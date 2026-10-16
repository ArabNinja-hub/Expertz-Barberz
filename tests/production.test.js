import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'vite';
import { verifySite } from '../scripts/verify-site.mjs';

test('production artifact is complete and rejects broken Pages output', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'expertz-production-'));
  try {
    await build({ build: { outDir: directory }, logLevel: 'silent' });
    const index = join(directory, 'index.html');
    const html = await readFile(index, 'utf8');
    await t.test('compiled JS, CSS, fonts, favicon and all images exist under the Pages base', async () => {
      assert.ok(await verifySite(directory) >= 19);
    });
    for (const [name, broken] of [
      ['source HTML', html.replace(/\/Expertz-Barberz\/assets\/[^"']+\.js/, '/src/main.js')],
      ['root-relative favicon', html.replace('/Expertz-Barberz/favicon.svg', '/favicon.svg')],
      ['missing image', html.replace('/images/classic-fade.jpg', '/images/missing.jpg')],
      ['missing stylesheet', html.replace(/<link[^>]+rel="stylesheet"[^>]*>/, '')],
    ]) {
      await t.test(`rejects ${name}`, async () => {
        await writeFile(index, broken);
        await assert.rejects(verifySite(directory));
        await writeFile(index, html);
      });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
