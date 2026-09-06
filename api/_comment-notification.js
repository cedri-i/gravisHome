const resendEndpoint = 'https://api.resend.com/emails';

const readEnv = (name) => String(process.env[name] || '').trim();

const getPublicOrigin = () => {
  const rawOrigin =
    readEnv('PUBLIC_SITE_URL') ||
    readEnv('VERCEL_PROJECT_PRODUCTION_URL') ||
    readEnv('VERCEL_URL');
  if (!rawOrigin) return '';

  try {
    return new URL(rawOrigin.includes('://') ? rawOrigin : `https://${rawOrigin}`).origin;
  } catch {
    return '';
  }
};

const getNotificationConfig = () => {
  const apiKey = readEnv('RESEND_API_KEY');
  const recipient = readEnv('COMMENT_NOTIFICATION_TO');
  if (!apiKey || !recipient) return null;

  return {
    apiKey,
    recipient,
    sender: readEnv('COMMENT_NOTIFICATION_FROM') || 'Gravis Home <onboarding@resend.dev>',
  };
};

const getPageUrl = (pagePath) => {
  const origin = getPublicOrigin();
  if (!origin) return pagePath;

  try {
    return new URL(pagePath, `${origin}/`).toString();
  } catch {
    return pagePath;
  }
};

export const sendCommentNotification = async (comment) => {
  const config = getNotificationConfig();
  if (!config) return { sent: false, reason: 'not-configured' };

  const author = comment.githubLogin ? `@${comment.githubLogin}` : comment.name || '匿名';
  const kind = comment.parentId ? '新回复' : '新评论';
  const pageUrl = getPageUrl(comment.pagePath);
  const text = [
    `你的网站收到一条${kind}。`,
    '',
    `评论者：${author}`,
    `页面：${pageUrl}`,
    `时间：${comment.createdAt}`,
    '',
    comment.message,
    '',
    comment.githubUrl ? `GitHub 记录：${comment.githubUrl}` : '',
  ].filter((line, index, lines) => line || lines[index - 1]).join('\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(resendEndpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': `gravis-comment-${String(comment.id || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '-')}`,
      },
      body: JSON.stringify({
        from: config.sender,
        to: [config.recipient],
        subject: `[Gravis Home] ${kind} · ${comment.pagePath}`,
        text,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`Resend API ${response.status}: ${detail}`);
    }

    return { sent: true };
  } finally {
    clearTimeout(timeout);
  }
};
