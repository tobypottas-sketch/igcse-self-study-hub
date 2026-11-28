import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const client = require('@supabase/supabase-js/package.json');
const version = client.version;
const bundle = await build({
  absWorkingDir: here,
  stdin: { contents: "export { createClient } from '@supabase/supabase-js';", resolveDir: here },
  bundle: true,
  platform: 'browser',
  preserveSymlinks: true,
  format: 'esm',
  target: ['chrome100', 'safari15.4'],
  minify: true,
  legalComments: 'inline',
  metafile: true,
  write: false
});

const output = Object.values(bundle.metafile.outputs)[0];
if (output.imports.length) throw new Error('The browser bundle must have no runtime imports.');

const modules = new Set(Object.keys(bundle.metafile.inputs)
  .map(input => input.match(/^node_modules\/(@[^/]+\/[^/]+|[^/]+)\//)?.[1])
  .filter(Boolean));
const notices = [];
for (const name of [...modules].sort()) {
  const directory = resolve(here, 'node_modules', name);
  const pkg = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
  const filename = { '@supabase/phoenix': 'LICENSE.md', tslib: 'LICENSE.txt' }[name] ?? 'LICENSE';
  const license = await readFile(resolve(directory, filename), 'utf8');
  notices.push(`${name} ${pkg.version} (${pkg.license})\n\n${license.replaceAll('\r\n', '\n').trim()}`);
}

const vendor = resolve(here, '../../src/vendor');
await writeFile(resolve(vendor, `supabase-${version}.js`), bundle.outputFiles[0].contents);
await writeFile(resolve(vendor, 'supabase-LICENSES.txt'), notices.join('\n\n---\n\n') + '\n');
