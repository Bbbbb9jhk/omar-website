import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';
const source = await readFile('lib/intake.ts', 'utf8');
const compiled = await transform(source, { loader: 'ts', format: 'esm' });
const { validateBrief, MAX_BRIEF_BYTES, intakeAvailability } = await import('data:text/javascript;base64,' + Buffer.from(compiled.code).toString('base64'));
const pages = ['', 'about', 'work', 'approach', 'book', 'consultation', 'privacy', 'work/lamsa', 'work/trends', 'work/twenzer', 'booking-admin'];
test('all generated routes have Arabic semantics and distinct page titles', async () => {
  const titles = new Set();
  for (const page of pages) {
    const html = await readFile(path.join('dist', page, 'index.html'), 'utf8');
    assert.match(html, /<html lang="ar" dir="rtl"/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, page);
    assert.match(html, /name="description"/);
    assert.match(html, /name="robots" content="noindex,nofollow"/);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!titles.has(title), `duplicate title: ${title}`); titles.add(title);
  }
});
test('all local links and loaded assets resolve to generated files', async () => {
  for (const page of pages) {
    const html = await readFile(path.join('dist', page, 'index.html'), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const target = match[1];
      await access(path.join('dist', target, /\.[a-z0-9]+$/i.test(target) ? '' : 'index.html'));
    }
  }
});
test('no video block, embedded media, or external font requests ship', async () => {
  for (const page of pages) {
    const html = await readFile(path.join('dist', page, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /<(?:video|iframe)\b|fonts\.googleapis\.com|fonts\.gstatic\.com/);
  }
  const fonts = await readFile('dist/fonts/fonts.css', 'utf8');
  assert.doesNotMatch(fonts, /url\(https?:/);
});
test('booking integration is ready and forms use client-side confirmation', async () => {
  assert.equal(intakeAvailability.available, true);
  for (const page of ['book']) {
    const html = await readFile(`dist/${page}/index.html`, 'utf8');
    assert.match(html, /خطوات الحجز/);
    assert.doesNotMatch(html, /<form[^>]*action=/);
  }
});
test('PDF accepts a valid signature, type, name and bounded size', async () => {
  assert.equal(await validateBrief(new File(['%PDF-1.7\n'], 'brief.pdf', { type: 'application/pdf' })), null);
});
test('PDF rejects a renamed non-PDF, incorrect type and oversized input', async () => {
  assert.ok(await validateBrief(new File(['<script>example</script>'], 'brief.pdf', { type: 'application/pdf' })));
  assert.ok(await validateBrief(new File(['%PDF-1.7'], 'brief.txt', { type: 'text/plain' })));
  assert.ok(await validateBrief(new File(['%PDF-', new Uint8Array(MAX_BRIEF_BYTES)], 'large.pdf', { type: 'application/pdf' })));
});

test('booking wizard collects business and contact details before qualification', async () => {
  for (const page of ['book']) {
    const html = await readFile(`dist/${page}/index.html`, 'utf8');
    for (const name of ['businessName', 'name', 'contact']) {
      const input = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0]; assert.ok(input, name); assert.match(input, /required=""/);
    }
    const instagram = html.match(/<input[^>]*name="instagram"[^>]*>/)[0];
    assert.match(instagram, /type="text"/);
    assert.doesNotMatch(instagram, /required=/);
    assert.doesNotMatch(html.match(/<input[^>]*name="website"[^>]*>/)[0], /required=/);
    assert.match(html, /aria-label="خطوات الحجز"/);
    assert.match(html, /<fieldset[^>]*hidden="" disabled=""/);
    assert.match(html, /name="briefFile"/);
    for (const value of ['under-100k', '100k-200k', '200k-500k', '500k-1m', '1m-3m', 'over-3m', '10k-30k', '30k-70k', '70k-200k', 'over-200k']) {
      assert.ok(html.includes(`value="${value}"`), value);
    }
    assert.match(html, /الإيرادات الشهرية/);
    assert.match(html, /بالجنيه المصري/);
  }
});

test('business details support manual answers or an unrestricted brief attachment', async () => {
  for (const page of ['book']) {
    const html = await readFile(`dist/${page}/index.html`, 'utf8');
    for (const name of ['business', 'problemsAndTools', 'attempts']) {
      const field = html.match(new RegExp(`<textarea[^>]*name="${name}"[^>]*>`))?.[0];
      assert.ok(field, name); assert.match(field, /required=""/);
    }
    assert.doesNotMatch(html.match(/<textarea[^>]*name="help"[^>]*>/)[0], /required=/);
    const file = html.match(/<input[^>]*name="briefFile"[^>]*>/)[0];
    assert.match(file, /type="file"/); assert.doesNotMatch(file, /accept=/);
    assert.match(html, /name="employees" required=""/);
    for (const value of ['solo', '2-4', '4-8', '8-plus']) assert.ok(html.includes(`value="${value}"`));
    assert.match(html, /أجاوب على الأسئلة يدويًا/); assert.match(html, /عندي بريف جاهز/);
    assert.doesNotMatch(html.match(/<ol class="booking-progress"[\s\S]*?<\/ol>/)[0], /بياناتك وبيانات البزنس/);
  }
});

test('homepage publishes real social links and both booking locations', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  for (const href of ['https://www.instagram.com/omarayman.tech/', 'https://www.tiktok.com/@omarayman.tech', 'https://wa.me/201050454132']) {
    assert.ok(html.includes(`href="${href}"`), `missing clickable social link: ${href}`);
  }
  const approach = html.indexOf('id="approach-title"');
  const middle = html.indexOf('class="booking-between');
  const problems = html.indexOf('id="problems-title"');
  const invitation = html.indexOf('id="booking-invitation-title"');
  assert.ok(approach < middle && middle < problems && problems < invitation);
  const middleActions = html.slice(middle, problems);
  assert.match(middleActions, /href="\/book"/);
  assert.match(middleActions, /<button[^>]*disabled=""/);
  assert.doesNotMatch(html, /دي طريقة شغلي/);
});

test('consultation is closed and booking pages omit the footer', async () => {
  const consultation = await readFile('dist/consultation/index.html', 'utf8');
  assert.match(consultation, /الاستشارات قريبًا/);
  assert.doesNotMatch(consultation, /<form\b/);
  for (const page of ['book', 'consultation']) {
    assert.doesNotMatch(await readFile(`dist/${page}/index.html`, 'utf8'), /<footer\b/);
  }
  for (const slug of ['lamsa', 'trends', 'twenzer']) {
    const html = await readFile(`dist/work/${slug}/index.html`, 'utf8');
    assert.match(html, /project-footer/);
    assert.doesNotMatch(html, /footer-socials|next-project|ارجع لكل المشاريع/);
  }
});