import assert from 'node:assert/strict';
import { sendCommentNotification } from '../api/_comment-notification.js';

const originalFetch = globalThis.fetch;
const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  COMMENT_NOTIFICATION_TO: process.env.COMMENT_NOTIFICATION_TO,
  COMMENT_NOTIFICATION_FROM: process.env.COMMENT_NOTIFICATION_FROM,
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
};

try {
  process.env.RESEND_API_KEY = 'test-key';
  process.env.COMMENT_NOTIFICATION_TO = 'notify@example.com';
  process.env.COMMENT_NOTIFICATION_FROM = 'Test <test@example.com>';
  process.env.PUBLIC_SITE_URL = 'https://notes.example.com';

  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ id: 'email-test' }), { status: 200 });
  };

  const result = await sendCommentNotification({
    id: 'github-123',
    name: 'Visitor',
    githubLogin: 'visitor',
    message: '这是一条测试评论。',
    createdAt: '2026-09-06T00:00:00.000Z',
    parentId: '',
    pagePath: '/programming-languages/c/',
    githubUrl: 'https://github.com/example/repo/issues/1#issuecomment-123',
  });

  assert.deepEqual(result, { sent: true });
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.authorization, 'Bearer test-key');
  assert.equal(request.options.headers['idempotency-key'], 'gravis-comment-github-123');

  const payload = JSON.parse(request.options.body);
  assert.equal(payload.from, 'Test <test@example.com>');
  assert.deepEqual(payload.to, ['notify@example.com']);
  assert.match(payload.subject, /新评论/);
  assert.match(payload.text, /@visitor/);
  assert.match(payload.text, /https:\/\/notes\.example\.com\/programming-languages\/c\//);
  assert.match(payload.text, /这是一条测试评论/);
  assert.match(payload.text, /issuecomment-123/);

  globalThis.fetch = async () => new Response('invalid sender', { status: 422 });
  await assert.rejects(
    () => sendCommentNotification({ id: 'github-124', pagePath: '/', message: 'test' }),
    /Resend API 422/
  );

  delete process.env.RESEND_API_KEY;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response('{}', { status: 200 });
  };
  assert.deepEqual(await sendCommentNotification({}), { sent: false, reason: 'not-configured' });
  assert.equal(called, false);

  console.log('Comment notification tests passed.');
} finally {
  globalThis.fetch = originalFetch;
  for (const [name, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}
