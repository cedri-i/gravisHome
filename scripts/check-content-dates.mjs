import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
let count = 0;
async function check(directory) {
 for (const entry of await readdir(directory, { withFileTypes: true })) {
  const file = path.join(directory, entry.name);
  if (entry.isDirectory()) { await check(file); continue; }
  if (!/\.mdx?$/.test(entry.name)) continue;
  const relative = path.relative(root, file).split(path.sep).join('/');
  if (relative.startsWith('baiyun/') && !/^baiyun\/index\.mdx?$/.test(relative)) continue;
  const text = await readFile(file, 'utf8');
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  const get = key => fm.split('\n').find(line => line.startsWith(key + ':'))?.slice(key.length + 1).trim().replace(/^["']|["']$/g, '');
  const created = get('createdAt'), updated = get('updatedAt');
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
  for (const [key, value] of [['createdAt', created], ['updatedAt', updated]]) {
   if (!value || !iso.test(value) || !Number.isFinite(Date.parse(value))) throw new Error(relative + ': ' + key + ' 必须是带时区、精确到秒的 ISO 8601 时间');
  }
  if (Date.parse(updated) < Date.parse(created)) throw new Error(relative + ': 修改时间早于建立时间');
  if (!['git', 'source', 'manual'].includes(get('timeSource'))) throw new Error(relative + ': 缺少有效 timeSource');
  count++;
 }
}
await check(root);
console.log('Content dates verified: ' + count + ' pages');
