import {
  appendSetCookie,
  clearCookie,
  createCookie,
  createOAuthState,
  createSession,
  createSignedValue,
  getGitHubSession,
  getOAuthState,
  sessionCookieName,
  stateCookieName,
} from './_session.js';
import { applySecurityHeaders, consumeRateLimit } from './_security.js';

const jsonResponse = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
};

const getOrigin = (request) => {
  const protocol = request.headers['x-forwarded-proto'] || 'https';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  return `${protocol}://${host}`;
};

const getAuthConfig = () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
};

const redirect = (response, location) => {
  response.statusCode = 302;
  response.setHeader('location', location);
  response.end();
};

const safeReturnTo = (value) => {
  const returnTo = String(value || '');
  return returnTo.startsWith('/') &&
    !returnTo.startsWith('//') &&
    !/[\u0000-\u001f\u007f]/.test(returnTo)
    ? returnTo
    : '/';
};

const exchangeCode = async ({ clientId, clientSecret, code, origin }) => {
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${origin}/api/github-auth`,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || 'GitHub OAuth token exchange failed.');
  }

  return tokenData.access_token;
};

const fetchGitHubUser = async (accessToken) => {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${accessToken}`,
      'user-agent': 'gravis-home-guestbook',
      'x-github-api-version': '2022-11-28',
    },
  });

  if (!userResponse.ok) throw new Error('Failed to fetch GitHub user.');
  const user = await userResponse.json();

  return {
    id: user.id,
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
  };
};

export default async function handler(request, response) {
  applySecurityHeaders(response);
  const rate = consumeRateLimit(request, 'github-auth', { limit: 30 });
  if (!rate.allowed) {
    response.setHeader('retry-after', String(rate.retryAfter));
    return jsonResponse(response, 429, { error: 'Too many requests.' });
  }
  const url = new URL(request.url, getOrigin(request));
  const action = url.searchParams.get('action');

  if (action === 'session') {
    return jsonResponse(response, 200, {
      user: getGitHubSession(request)?.user || null,
    });
  }

  if (action === 'logout') {
    appendSetCookie(response, clearCookie(sessionCookieName));
    return redirect(response, safeReturnTo(url.searchParams.get('returnTo')));
  }

  const config = getAuthConfig();
  if (!config) {
    return jsonResponse(response, 503, { error: 'GitHub OAuth is not configured.' });
  }

  try {
    const origin = getOrigin(request);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      const oauthState = createOAuthState(safeReturnTo(url.searchParams.get('returnTo')));
      appendSetCookie(
        response,
        createCookie(stateCookieName, createSignedValue(oauthState), { maxAge: 600 })
      );

      const githubUrl = new URL('https://github.com/login/oauth/authorize');
      githubUrl.searchParams.set('client_id', config.clientId);
      githubUrl.searchParams.set('redirect_uri', `${origin}/api/github-auth`);
      githubUrl.searchParams.set('scope', 'read:user');
      githubUrl.searchParams.set('state', oauthState.value);
      return redirect(response, githubUrl.toString());
    }

    const oauthState = getOAuthState(request);
    if (!oauthState || oauthState.value !== state) {
      return jsonResponse(response, 400, { error: 'Invalid OAuth state.' });
    }

    const accessToken = await exchangeCode({ ...config, code, origin });
    const user = await fetchGitHubUser(accessToken);

    appendSetCookie(response, clearCookie(stateCookieName));
    appendSetCookie(response, createCookie(sessionCookieName, createSession(user), { maxAge: 1209600 }));
    return redirect(response, safeReturnTo(oauthState.returnTo));
  } catch (error) {
    if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
      return jsonResponse(response, 413, { error: 'Request body is too large.' });
    }
    return jsonResponse(response, 500, {
      error: error instanceof Error ? error.message : 'GitHub login failed.',
    });
  }
}
