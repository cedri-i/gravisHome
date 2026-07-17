const buckets = new Map();
const maxBuckets = 5000;

const getIp = (request) => {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || request.socket?.remoteAddress || 'unknown';
};

export const applySecurityHeaders = (response) => {
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('x-frame-options', 'DENY');
  response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  response.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('cross-origin-resource-policy', 'same-origin');
  response.setHeader('cache-control', 'no-store');
};

export const isSameOrigin = (request) => {
  const origin = request.headers.origin;
  if (!origin) return true;
  const protocol = String(request.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(request.headers['x-forwarded-host'] || request.headers.host || '')
    .split(',')[0]
    .trim();
  return origin === `${protocol}://${host}`;
};

export const consumeRateLimit = (request, scope, options = {}) => {
  const limit = options.limit || 30;
  const windowMs = options.windowMs || 60_000;
  const now = Date.now();
  const key = `${scope}:${getIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (!buckets.has(key) && buckets.size >= maxBuckets) {
      buckets.delete(buckets.keys().next().value);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  if (buckets.size > maxBuckets) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
      if (buckets.size <= maxBuckets) break;
    }
  }

  return {
    allowed: current.count <= limit,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
};

export const readJsonBody = async (request, maxBytes = 4096) => {
  if (request.body && typeof request.body === 'object') {
    const serialized = JSON.stringify(request.body);
    if (Buffer.byteLength(serialized) > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
    return request.body;
  }
  if (typeof request.body === 'string') {
    if (Buffer.byteLength(request.body) > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
    return JSON.parse(request.body || '{}');
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};
