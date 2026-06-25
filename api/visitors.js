const start = '<!-- gravis-visitors:v1 -->';
const end = '<!-- /gravis-visitors -->';

const send = (res, code, data) => {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
};

const body = async (req) => {
  if (typeof req.body === 'object' && req.body) return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};

const config = () => {
  const repo = process.env.VISITOR_STATS_REPO || process.env.GUESTBOOK_REPO || (
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG
      : ''
  );
  const issue = process.env.VISITOR_STATS_ISSUE_NUMBER || process.env.GUESTBOOK_ISSUE_NUMBER;
  const token = process.env.GUESTBOOK_GITHUB_TOKEN;
  return token && repo && issue ? { token, repo, issue } : null;
};

const gh = async (cfg, path, options = {}) => {
  const r = await fetch('https://api.github.com' + path, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: 'Bearer ' + cfg.token,
      'content-type': 'application/json',
      'user-agent': 'gravis-home-visitors',
      'x-github-api-version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!r.ok) throw new Error('GitHub API ' + r.status + ': ' + await r.text());
  return r.json();
};

const parse = (text = '') => {
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(text.slice(a + start.length, b).trim()); } catch { return null; }
};

const clean = (raw) => ({
  totalViews: Math.max(0, Math.floor(Number(raw?.totalViews) || 0)),
  visitorIds: [...new Set(Array.isArray(raw?.visitorIds) ? raw.visitorIds.map(String).filter(Boolean) : [])],
  updatedAt: raw?.updatedAt || null,
});

const publicStats = (stats) => ({
  totalViews: stats.totalViews + (Number.parseInt(process.env.VISITOR_STATS_BASE_VIEWS || '0', 10) || 0),
  uniqueVisitors: stats.visitorIds.length + (Number.parseInt(process.env.VISITOR_STATS_BASE_UNIQUE || '0', 10) || 0),
  updatedAt: stats.updatedAt,
});

const storedBody = (stats) => [start, JSON.stringify(stats), end, '', 'Visitor counter storage.'].join(String.fromCharCode(10));

const load = async (cfg) => {
  const comments = await gh(cfg, '/repos/' + cfg.repo + '/issues/' + cfg.issue + '/comments?per_page=100');
  const comment = comments.find((item) => parse(item.body));
  return { comment, stats: clean(comment ? parse(comment.body) : null) };
};

export default async function handler(req, res) {
  const cfg = config();
  if (!cfg) return send(res, 503, { error: 'Visitor counter backend is not configured.' });

  try {
    if (req.method === 'GET') {
      const { stats } = await load(cfg);
      return send(res, 200, publicStats(stats));
    }

    if (req.method === 'POST') {
      const id = String((await body(req)).visitorId || '').slice(0, 80);
      if (!/^[A-Za-z0-9_-]{12,80}$/.test(id)) return send(res, 400, { error: 'Valid visitor id is required.' });

      const { comment, stats } = await load(cfg);
      stats.totalViews += 1;
      if (!stats.visitorIds.includes(id)) stats.visitorIds.push(id);
      stats.updatedAt = new Date().toISOString();

      if (comment) {
        await gh(cfg, '/repos/' + cfg.repo + '/issues/comments/' + comment.id, { method: 'PATCH', body: JSON.stringify({ body: storedBody(stats) }) });
      } else {
        await gh(cfg, '/repos/' + cfg.repo + '/issues/' + cfg.issue + '/comments', { method: 'POST', body: JSON.stringify({ body: storedBody(stats) }) });
      }
      return send(res, 200, publicStats(stats));
    }

    res.setHeader('allow', 'GET, POST');
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Visitor counter request failed.' });
  }
}
