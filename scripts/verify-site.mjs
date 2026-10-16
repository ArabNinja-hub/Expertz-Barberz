import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const base = '/Expertz-Barberz/';

// Check the actual deployable files, not the Vite source HTML.
export async function verifySite(target = 'dist') {
  const remote = /^https?:/.test(target);
  const origin = remote ? new URL(target).origin : 'https://example.invalid';
  const root = resolve(target);
  const checked = new Set();
  async function load(path, kind) {
    assert.ok(path.startsWith(base), `Asset outside Pages subpath: ${path}`);
    const url = new URL(path, origin);
    const file = resolve(root, decodeURIComponent(url.pathname.slice(base.length) || 'index.html'));
    assert.ok(remote || file.startsWith(root + sep), `Unsafe asset path: ${path}`);
    let data;
    if (remote) {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
      assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
      const type = response.headers.get('content-type') || '';
      const types = { html: /text\/html/, js: /javascript/, css: /text\/css/, image: /image\// };
      if (types[kind]) assert.match(type, types[kind], `${url}: unexpected MIME type`);
      data = Buffer.from(await response.arrayBuffer());
    } else data = await readFile(file);
    assert.ok(data.length, `Empty asset: ${path}`);
    checked.add(path);
    return data.toString();
  }
  const html = await load(base, 'html');
  assert.doesNotMatch(html, /(?:src|href)=["']\/?src\//, 'Source HTML was deployed instead of dist');
  const scripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)/g)].map(m => m[1]);
  const styles = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)/g)].map(m => m[1]);
  assert.ok(scripts.some(p => p.startsWith(`${base}assets/`) && p.endsWith('.js')), 'Missing compiled JavaScript');
  assert.ok(styles.some(p => p.startsWith(`${base}assets/`) && p.endsWith('.css')), 'Missing compiled CSS');
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)/g)) {
    const path = match[1];
    if (/^(?:#|https?:|mailto:|tel:|data:)/.test(path)) continue;
    const kind = path.endsWith('.js') ? 'js' : path.endsWith('.css') ? 'css' : /\.(jpg|svg)$/.test(path) ? 'image' : undefined;
    const content = await load(path, kind);
    if (kind === 'css') {
      for (const font of content.matchAll(/url\(["']?([^\s)"']+)/g)) {
        if (font[1].startsWith('data:')) continue;
        await load(new URL(font[1], new URL(path, origin)).pathname);
      }
    }
  }
  for (const name of ['barber-at-work.jpg', 'textured-cut.jpg', 'classic-fade.jpg', 'scissor-cut.jpg', 'beard-detail.jpg']) {
    assert.ok(checked.has(`${base}images/${name}`), `Missing image: ${name}`);
  }
  assert.ok(checked.has(`${base}favicon.svg`), 'Missing favicon');
  return checked.size;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const target = process.argv[2] || 'dist';
  const attempts = /^https?:/.test(target) ? 6 : 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      console.log(`Verified ${await verifySite(target)} production files at ${target}`);
      break;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.warn(`Verification attempt ${attempt} failed: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}
