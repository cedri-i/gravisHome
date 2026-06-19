import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const sessionCookieName = 'gravis_github_session';
export const stateCookieName = 'gravis_github_oauth_state';

const getSecret = () => {
  return (
    process.env.GUESTBOOK_SESSION_SECRET ||
    process.env.GITHUB_CLIENT_SECRET ||
    process.env.GUESTBOOK_ADMIN_TOKEN ||
    ''
  );
};

const base64Url = (value) => Buffer.from(value).toString('base64url');

const sign = (value) => {
  const secret = getSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update(value).digest('base64url');
};

const parseCookies = (request) => {
  const cookieHeader = request.headers.cookie || request.headers.Cookie || '';
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf('=');
        return index === -1
          ? [cookie, '']
          : [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))];
      })
  );
};

const verifySignedValue = (value) => {
  const [payload, signature] = String(value || '').split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (!expected) return null;

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

export const createSignedValue = (payload) => {
  const encoded = base64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
};

export const createCookie = (name, value, options = {}) => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
  ];

  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join('; ');
};

export const clearCookie = (name) => {
  return createCookie(name, '', { maxAge: 0 });
};

export const appendSetCookie = (response, cookie) => {
  const previous = response.getHeader?.('set-cookie');
  if (!previous) {
    response.setHeader('set-cookie', cookie);
    return;
  }
  response.setHeader('set-cookie', Array.isArray(previous) ? [...previous, cookie] : [previous, cookie]);
};

export const createOAuthState = (returnTo = '/') => {
  return {
    value: randomBytes(24).toString('base64url'),
    returnTo,
  };
};

export const getOAuthState = (request) => {
  return verifySignedValue(parseCookies(request)[stateCookieName]);
};

export const createSession = (user) => {
  return createSignedValue({
    user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  });
};

export const getGitHubSession = (request) => {
  const session = verifySignedValue(parseCookies(request)[sessionCookieName]);
  if (!session || !session.user || session.exp < Date.now()) return null;
  return session;
};
