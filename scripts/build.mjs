import { build } from 'esbuild';
import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const origin = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://omar-ayman-story.sprybread128.chatgpt.site');
await mkdir('dist/assets', { recursive: true });
await mkdir('work/build', { recursive: true });
await build({ entryPoints: ['app/site.tsx'], outfile: 'work/build/site.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', tsconfig: 'tsconfig.json', define: { 'process.env.SITE_URL': JSON.stringify(origin) } });
const { App, routes } = await import(pathToFileURL(path.resolve(root, 'work/build/site.mjs')).href);
const { renderToString } = await import('react-dom/server');
const { createElement } = await import('react');
await build({ entryPoints: ['app/client.tsx'], outfile: 'dist/assets/app.js', bundle: true, platform: 'browser', format: 'esm', target: ['es2022'], minify: true, jsx: 'automatic', tsconfig: 'tsconfig.json', define: { 'process.env.SITE_URL': JSON.stringify(origin), 'process.env.NODE_ENV': '"production"' } });
await cp('public', 'dist', { recursive: true });
await cp('app/globals.css', 'dist/assets/site.css');
for (const route of [...routes, '/404']) {
  const directory = path.join('dist', route === '/' ? '' : route.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), '<!DOCTYPE html>' + renderToString(createElement(App, { path: route })));
}
await cp('dist/404/index.html', 'dist/404.html');


await writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.map(route => `<url><loc>${origin}${route === '/' ? '' : route}</loc></url>`).join('') + '</urlset>');
await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
await writeFile('dist/_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Robots-Tag: noindex, nofollow\n');

console.log(`Built ${routes.length} pages plus a 404 page. Supabase booking integration included.`);
