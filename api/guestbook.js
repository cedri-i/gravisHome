import { getGitHubSession } from './_session.js';

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

const getAdminToken = (request) => {
  const authorization = request.headers.authorization || request.headers.Authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : '';
};

const isAuthorizedAdmin = (request) => {
  const adminToken = process.env.GUESTBOOK_ADMIN_TOKEN;
  return Boolean(adminToken && getAdminToken(request) === adminToken);
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

const normalizeLogin = (login) => {
  return String(login || '').trim().slice(0, 39);
};

const normalizeParentId = (parentId) => {
  return String(parentId || '').trim().slice(0, 80);
};

const readPayload = (body) => {
  const start = body.indexOf(markerStart);
  const end = body.indexOf(markerEnd);
  if (start === -1 || end === -1 || end <= start) return null;

  const raw = body.slice(start + markerStart.length, end).trim();
  try {
    return {
      markerStartIndex: start,
      markerEndIndex: end,
      payload: JSON.parse(raw),
    };
  } catch {
    return null;
  }
};

const parseComment = (comment) => {
  const parsed = readPayload(comment.body);
  if (!parsed) return null;

  const message = normalizeMessage(parsed.payload.message);
  if (!message) return null;

  return {
    id: `github-${comment.id}`,
    name: normalizeName(parsed.payload.name) || '匿名',
    githubLogin: normalizeLogin(parsed.payload.githubLogin),
    avatarUrl: String(parsed.payload.avatarUrl || ''),
    profileUrl: String(parsed.payload.profileUrl || ''),
    message,
    createdAt: parsed.payload.createdAt || comment.created_at,
    parentId: normalizeParentId(parsed.payload.parentId),
    hidden: Boolean(parsed.payload.hidden),
  };
};

const toCommentBody = ({ author, message, createdAt, parentId }) => {
  const displayName = normalizeName(author.name || author.login) || 'GitHub user';
  const normalizedParentId = normalizeParentId(parentId);
  const payload = {
    name: displayName,
    githubLogin: normalizeLogin(author.login),
    avatarUrl: author.avatarUrl,
    profileUrl: author.profileUrl,
    message: normalizeMessage(message),
    createdAt,
    parentId: normalizedParentId,
    hidden: false,
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
        .filter((message) => message && !message.hidden)
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

      return jsonResponse(response, 200, { messages });
    }

    if (request.method === 'POST') {
      const session = getGitHubSession(request);
      if (!session) {
        return jsonResponse(response, 401, { error: 'GitHub login is required.' });
      }

      const body = await readRequestBody(request);
      const message = normalizeMessage(body.message);
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
            body: toCommentBody({ author: session.user, message, createdAt, parentId }),
          }),
        }
      );

      return jsonResponse(response, 201, {
        message: parseComment(comment),
      });
    }

    if (request.method === 'PATCH') {
      const body = await readRequestBody(request);
      const commentId = String(body.id || '').replace(/^github-/, '').trim();

      if (!/^\d+$/.test(commentId)) {
        return jsonResponse(response, 400, { error: 'Valid comment id is required.' });
      }

      const comment = await githubRequest(
        config,
        `/repos/${config.repository}/issues/comments/${commentId}`
      );
      const parsed = readPayload(comment.body);
      if (!parsed) {
        return jsonResponse(response, 400, { error: 'Comment is not a guestbook message.' });
      }

      if (body.action === 'claim') {
        const session = getGitHubSession(request);
        if (!session) {
          return jsonResponse(response, 401, { error: 'GitHub login is required.' });
        }

        const proofMatches =
          !parsed.payload.githubLogin &&
          normalizeMessage(body.message) === normalizeMessage(parsed.payload.message) &&
          normalizeParentId(body.parentId) === normalizeParentId(parsed.payload.parentId) &&
          String(body.createdAt || '') === String(parsed.payload.createdAt || comment.created_at);

        if (!proofMatches) {
          return jsonResponse(response, 403, { error: 'Comment ownership proof did not match.' });
        }

        const nextPayload = {
          ...parsed.payload,
          name: normalizeName(session.user.name || session.user.login) || 'GitHub user',
          githubLogin: normalizeLogin(session.user.login),
          avatarUrl: session.user.avatarUrl,
          profileUrl: session.user.profileUrl,
          claimedAt: new Date().toISOString(),
        };
        const nextBody = `${comment.body.slice(0, parsed.markerStartIndex + markerStart.length)}
${JSON.stringify(nextPayload)}
${comment.body.slice(parsed.markerEndIndex)}`;

        const updatedComment = await githubRequest(
          config,
          `/repos/${config.repository}/issues/comments/${commentId}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ body: nextBody }),
          }
        );

        return jsonResponse(response, 200, {
          message: parseComment(updatedComment),
        });
      }

      if (!isAuthorizedAdmin(request)) {
        return jsonResponse(response, 401, { error: 'Unauthorized.' });
      }

      const hidden = Boolean(body.hidden);

      const nextPayload = {
        ...parsed.payload,
        hidden,
        hiddenAt: hidden ? new Date().toISOString() : undefined,
      };
      const nextBody = `${comment.body.slice(0, parsed.markerStartIndex + markerStart.length)}
${JSON.stringify(nextPayload)}
${comment.body.slice(parsed.markerEndIndex)}`;

      const updatedComment = await githubRequest(
        config,
        `/repos/${config.repository}/issues/comments/${commentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ body: nextBody }),
        }
      );

      return jsonResponse(response, 200, {
        message: parseComment(updatedComment),
      });
    }

    response.setHeader('allow', 'GET, POST, PATCH');
    return jsonResponse(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return jsonResponse(response, 500, {
      error: error instanceof Error ? error.message : 'Guestbook request failed.',
    });
  }
}
