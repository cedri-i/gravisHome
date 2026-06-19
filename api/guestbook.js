const markerStart = '<!-- gravis-guestbook:v1 -->';
const markerEnd = '<!-- /gravis-guestbook -->';

const jsonResponse = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
};

const readRequestBody = async (request) => {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}');

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};

const getConfig = () => {
  const token = process.env.GUESTBOOK_GITHUB_TOKEN;
  const vercelRepository =
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : undefined;
  const repository = process.env.GUESTBOOK_REPO || vercelRepository;
  const issueNumber = process.env.GUESTBOOK_ISSUE_NUMBER;

  if (!token || !repository || !issueNumber) {
    return null;
  }

  return { token, repository, issueNumber };
};

const githubRequest = async (config, path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${config.token}`,
      'content-type': 'application/json',
      'user-agent': 'gravis-home-guestbook',
      'x-github-api-version': '2022-11-28',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  return response.json();
};

const normalizeMessage = (message) => {
  return String(message || '').trim().slice(0, 320);
};

const normalizeName = (name) => {
  return String(name || '').trim().slice(0, 24);
};

const normalizeParentId = (parentId) => {
  return String(parentId || '').trim().slice(0, 80);
};

const parseComment = (comment) => {
  const start = comment.body.indexOf(markerStart);
  const end = comment.body.indexOf(markerEnd);
  if (start === -1 || end === -1 || end <= start) return null;

  const raw = comment.body.slice(start + markerStart.length, end).trim();
  try {
    const payload = JSON.parse(raw);
    const message = normalizeMessage(payload.message);
    if (!message) return null;

    return {
      id: `github-${comment.id}`,
      name: normalizeName(payload.name) || '匿名',
      message,
      createdAt: payload.createdAt || comment.created_at,
      parentId: normalizeParentId(payload.parentId),
    };
  } catch {
    return null;
  }
};

const toCommentBody = ({ name, message, createdAt, parentId }) => {
  const displayName = normalizeName(name) || '匿名';
  const normalizedParentId = normalizeParentId(parentId);
  const payload = {
    name: displayName,
    message: normalizeMessage(message),
    createdAt,
    parentId: normalizedParentId,
  };

  return `${markerStart}
${JSON.stringify(payload)}
${markerEnd}

**${displayName}** · ${createdAt}${normalizedParentId ? ` · reply to ${normalizedParentId}` : ''}

${payload.message}`;
};

export default async function handler(request, response) {
  const config = getConfig();
  if (!config) {
    return jsonResponse(response, 503, {
      error: 'Guestbook backend is not configured.',
    });
  }

  try {
    if (request.method === 'GET') {
      const comments = await githubRequest(
        config,
        `/repos/${config.repository}/issues/${config.issueNumber}/comments?per_page=100`
      );
      const messages = comments
        .map(parseComment)
        .filter(Boolean)
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

      return jsonResponse(response, 200, { messages });
    }

    if (request.method === 'POST') {
      const body = await readRequestBody(request);
      const message = normalizeMessage(body.message);
      const name = normalizeName(body.name);
      const parentId = normalizeParentId(body.parentId);
      const createdAt = body.createdAt || new Date().toISOString();

      if (!message) {
        return jsonResponse(response, 400, { error: 'Message is required.' });
      }

      const comment = await githubRequest(
        config,
        `/repos/${config.repository}/issues/${config.issueNumber}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: toCommentBody({ name, message, createdAt, parentId }),
          }),
        }
      );

      return jsonResponse(response, 201, {
        message: parseComment(comment),
      });
    }

    response.setHeader('allow', 'GET, POST');
    return jsonResponse(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return jsonResponse(response, 500, {
      error: error instanceof Error ? error.message : 'Guestbook request failed.',
    });
  }
}
