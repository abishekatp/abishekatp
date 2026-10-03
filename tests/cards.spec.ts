import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import { PNG } from 'pngjs';

const markdown = '# A quieter kind of attention\n\n' + ('Small moments teach us to pay attention. **Keep looking.** *Stay curious.*\n\n').repeat(15) + '\n## A final thought\n\n3. First idea\n4. Another idea\n\n> Make room for wonder.\n\n```ts\nconst thought = "keep going";\n```';

test('workspace rows follow input, settings, and preview order', async ({ page }, testInfo) => {
    await page.goto('cards/');
    await expect(page.getByLabel('Markdown file')).toBeEnabled();
    for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const input = (await page.locator('.input-row').boundingBox())!;
        const upload = (await page.locator('.upload-zone').boundingBox())!;
        const text = (await page.locator('#markdown-source').boundingBox())!;
        const title = (await page.locator('.title-row').boundingBox())!;
        const appearance = (await page.locator('.appearance-controls').boundingBox())!;
        const actions = (await page.locator('.editor-footer').boundingBox())!;
        const preview = (await page.locator('.preview-section').boundingBox())!;
        expect(title.y).toBeGreaterThanOrEqual(input.y + input.height);
        expect(appearance.y).toBeGreaterThanOrEqual(title.y + title.height);
        expect(actions.y).toBeGreaterThanOrEqual(appearance.y + appearance.height);
        expect(preview.y).toBeGreaterThanOrEqual(actions.y + actions.height);
        if (width > 767) {
            expect(text.x).toBeGreaterThanOrEqual(upload.x + upload.width);
            expect(Math.abs(text.y - upload.y)).toBeLessThan(4);
        } else expect(text.y).toBeGreaterThanOrEqual(upload.y + upload.height);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`vertical-${width}.png`), fullPage: true });
    }
});

test('uploads, paginates, edits and exports matching PNG cards without uploading content', async ({ page }, testInfo) => {
    const posted: string[] = [];
    page.on('request', (request) => { if (request.method() === 'POST') posted.push(request.url()); });
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.goto('cards/');
    await expect(page.getByLabel('Markdown file')).toBeEnabled();
    await page.getByLabel('Markdown file').setInputFiles({ name: 'thought.md', mimeType: 'text/markdown', buffer: Buffer.from(markdown) });
    await expect(page.getByRole('status')).toContainText('cards ready');
    await expect(page.getByRole('alert')).toHaveCount(0);
    const count = Number((await page.locator('.counter').innerText()).split('/')[1].trim());
    expect(count).toBeGreaterThan(2);
    await page.getByRole('button', { name: 'Next card', exact: true }).click();
    await expect(page.locator('.counter')).toHaveText(`2 / ${count}`);
    const nonblank = await page.locator('.paper canvas').evaluate((canvas: HTMLCanvasElement) => {
        const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        let bright = 0;
        for (let index = 0; index < data.length; index += 4) if (data[index] > 220 && data[index + 1] > 220 && data[index + 2] > 220) bright++;
        return bright;
    });
    expect(nonblank).toBeGreaterThan(1000);
    const plainDarkFooter = await page.locator('.paper canvas').evaluate((canvas: HTMLCanvasElement) => {
        const pixels = canvas.getContext('2d')!.getImageData(0, 1200, canvas.width, 150).data;
        for (let index = 0; index < pixels.length; index += 4) {
            if (pixels[index] !== 39 || pixels[index + 1] !== 42 || pixels[index + 2] !== 46 || pixels[index + 3] !== 255) return false;
        }
        return true;
    });
    expect(plainDarkFooter).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true });
    await page.getByLabel('Text color', { exact: true }).fill('#ffeecc');
    await page.getByLabel('Background', { exact: true }).fill('#112233');
    await page.getByLabel('Font size', { exact: true }).fill('52');
    await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
    await page.getByLabel('Title override').fill('Updated title');
    await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
    await page.getByRole('button', { name: 'Regenerate' }).click();
    await expect(page.getByRole('status')).toContainText('cards ready');
    const updatedCount = Number((await page.locator('.counter').innerText()).split('/')[1].trim());
    expect(updatedCount).toBeGreaterThan(count);
    const customAppearance = await page.locator('.paper canvas').evaluate((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d')!;
        return { background: Array.from(context.getImageData(0, 0, 1, 1).data), ink: context.fillStyle, font: context.font };
    });
    expect(customAppearance.background).toEqual([17, 34, 51, 255]);
    expect(customAppearance.ink).toBe('#ffeecc');
    expect(customAppearance.font).toContain('99px');
    const preview = await page.locator('.paper canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL('image/png').split(',')[1]);
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download ZIP' }).click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe('Updated-title-cards.zip');
    const files = unzipSync(await readFile((await download.path())!));
    expect(Object.keys(files)).toHaveLength(updatedCount);
    expect(Object.keys(files).sort()).toEqual(Array.from({ length: updatedCount }, (_, index) => `card-${String(index + 1).padStart(3, '0')}.png`));
    for (const png of Object.values(files)) {
        expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
        const header = new DataView(png.buffer, png.byteOffset, png.byteLength);
        expect(header.getUint32(16)).toBe(1080);
        expect(header.getUint32(20)).toBe(1350);
    }
    const exportedPixels = PNG.sync.read(Buffer.from(files['card-001.png'])).data;
    const previewPixels = PNG.sync.read(Buffer.from(preview, 'base64')).data;
    expect(exportedPixels.equals(previewPixels)).toBe(true);
    expect(posted).toEqual([]);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Cards', exact: true })).toBeVisible();
    await expect(page.getByLabel('Markdown', { exact: true })).toHaveValue('');
});

test('mobile navigation, invalid files, warnings and reset', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('cards/');
    await expect(page.getByLabel('Markdown file')).toBeEnabled();
    await page.getByRole('button', { name: 'Open main menu' }).click();
    await page.getByRole('link', { name: 'Cards', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Cards', exact: true })).toBeHidden();
    await page.getByLabel('Markdown file').setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('Text') });
    await expect(page.getByRole('alert')).toContainText('.md or .markdown');
    await page.getByLabel('Markdown file').setInputFiles({ name: 'rich.md', mimeType: 'text/markdown', buffer: Buffer.from('# Rich\n\n![Alt](https://example.com/image.png)\n\n<script>alert(1)</script>\n\n| A | B |\n| - | - |\n| C | D |') });
    await expect(page.getByRole('status')).toContainText('cards ready');
    await expect(page.locator('.warnings')).toContainText('Images are not loaded');
    await expect(page.locator('.warnings')).toContainText('HTML is not rendered');
    await expect(page.locator('.warnings')).toContainText('plain-text rows');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByLabel('Text color', { exact: true })).toHaveValue('#ffffff');
    await expect(page.getByLabel('Background', { exact: true })).toHaveValue('#272a2e');
    await expect(page.getByLabel('Font size', { exact: true })).toHaveValue('40');
    await expect(page.getByLabel('Markdown', { exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
    await expect(page.locator('.warnings')).toHaveCount(0);
});

test('font failure can be retried, cancellation discards stale generation, and encoding errors surface', async ({ page }) => {
    await page.route('**/*.woff2', (route) => route.abort());
    await page.goto('cards/');
    await page.getByLabel('Markdown', { exact: true }).fill(markdown);
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('fonts could not be loaded');
    await page.unroute('**/*.woff2');
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('cards ready');
    await page.evaluate(() => {
        const original = HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
            setTimeout(() => original.call(this, callback, type, quality), 500);
        };
    });
    await page.getByRole('button', { name: 'Download ZIP' }).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Cancelled');
    await page.evaluate(() => { HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); }; });
    await page.getByRole('button', { name: 'Download ZIP' }).click();
    await expect(page.getByRole('alert')).toContainText('could not be encoded');
});

test('real font measurements stay within safe bounds', async ({ page }) => {
    test.skip(process.env.TEST_PREVIEW === '1', 'Source-module measurement check runs against dev; output verification runs against preview.');
    await page.goto('cards/');
    const bounds = await page.evaluate(async () => {
        const base = location.pathname.replace(/cards\/$/, '');
        const { loadCardFonts } = await import(/* @vite-ignore */ `${base}src/lib/cards/fonts.ts`);
        const { parseMarkdown } = await import(/* @vite-ignore */ `${base}src/lib/cards/parse.ts`);
        const { layoutCards } = await import(/* @vite-ignore */ `${base}src/lib/cards/layout.ts`);
        const { canvasMeasure } = await import(/* @vite-ignore */ `${base}src/lib/cards/render.ts`);
        const { editorial, fontString } = await import(/* @vite-ignore */ `${base}src/lib/cards/templates.ts`);
        await loadCardFonts();
        const context = document.createElement('canvas').getContext('2d')!;
        const source = '# ' + 'An exceptionally long title '.repeat(20) + '\n\n' + ('A paragraph with **strong words** and *italic text*.\n\n').repeat(50) + '\n```\n' + 'longCode'.repeat(200) + '\n```';
        const cards = layoutCards(parseMarkdown(source), canvasMeasure(context));
        const violations = [];
        for (const card of cards) for (const operation of card.operations) {
            context.font = fontString(editorial, operation.style);
            context.textBaseline = 'top';
            const metrics = context.measureText(operation.text);
            if (operation.x - metrics.actualBoundingBoxLeft < 88 || operation.x + metrics.actualBoundingBoxRight > 992 || operation.y + metrics.actualBoundingBoxDescent > 1170) violations.push(operation);
        }
        return { violations, count: cards.length };
    });
    expect(bounds.count).toBeGreaterThan(4);
    expect(bounds.violations).toEqual([]);
});