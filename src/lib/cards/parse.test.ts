import { describe, expect, it } from 'vitest';
import { parseMarkdown, validateFile } from './parse';

describe('Markdown input', () => {
    it('moves an inferred H1 to the cover and preserves paragraphs', () => {
        const document = parseMarkdown('# A title\n\nHello **world** and *friends*.');
        expect(document.title).toBe('A title');
        expect(document.blocks).toHaveLength(1);
        expect(document.blocks[0].runs.map((run) => run.text).join('')).toBe('Hello world and friends.');
        expect(document.blocks[0].runs.some((run) => run.style === 'bold')).toBe(true);
    });
    it('uses overrides before frontmatter and keeps the body heading', () => {
        const document = parseMarkdown('---\ntitle: Metadata\n---\n# Heading\n\nBody', 'name.md', 'Override');
        expect(document.title).toBe('Override');
        expect(document.blocks[0].kind).toBe('heading');
        expect(parseMarkdown('---\ntitle: Metadata\n---\n# Heading').title).toBe('Metadata');
    });
    it('warns about invalid frontmatter, media, tables and HTML without fetching anything', () => {
        const document = parseMarkdown('---\ntitle: [invalid\n---\n# Heading\n\n![Alt](https://example.com/a.png)\n\n| A | B |\n| - | - |\n| C | D |\n\n<script>alert(1)</script>');
        expect(document.title).toBe('Heading');
        expect(document.warnings).toHaveLength(4);
        expect(document.blocks.flatMap((block) => block.runs).map((run) => run.text).join('')).toContain('Alt');
    });
    it('preserves ordered and nested list markers, links, code and quotes', () => {
        const document = parseMarkdown('3. First\n   - Child\n4. Second\n\n> Quote\n\n[Link](https://example.com)\n\n```js\nconst value = 1;\n```');
        expect(document.blocks[0].prefix).toBe('3. ');
        expect(document.blocks[1].depth).toBe(1);
        expect(document.blocks[2].prefix).toBe('4. ');
        expect(document.blocks.some((block) => block.kind === 'quote')).toBe(true);
        expect(document.blocks.at(-1)?.runs[0].text).toBe('const value = 1;');
    });
    it('rejects empty, oversized and non-Markdown inputs', () => {
        expect(() => parseMarkdown('  ')).toThrow('empty');
        expect(() => parseMarkdown('a'.repeat(1024 * 1024 + 1))).toThrow('1 MiB');
        expect(() => validateFile({ name: 'image.png', size: 20 })).toThrow('.md');
        expect(() => validateFile({ name: 'post.md', size: 1024 * 1024 + 1 })).toThrow('1 MiB');
        expect(parseMarkdown('Body', 'example.markdown').title).toBe('example');
    });
    it('preserves footnote references and their text', () => {
        const document = parseMarkdown('Thought[^one].\n\n[^one]: A supporting idea.');
        const text = document.blocks.flatMap((block) => block.runs).map((run) => run.text).join('');
        expect(text).toContain('Thought[one].');
        expect(text).toContain('A supporting idea.');
    });
});