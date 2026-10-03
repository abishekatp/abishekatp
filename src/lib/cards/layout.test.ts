import { describe, expect, it } from 'vitest';
import { layoutCards, wrapRuns } from './layout';
import { parseMarkdown } from './parse';
import { editorial } from './templates';
import type { MeasureText } from './types';

const measure: MeasureText = (text, style) => [...text].length * (style === 'title' ? 40 : 20);

describe('measured layout', () => {
    it('preserves text through long paragraph and token pagination', () => {
        const source = 'First **bold** paragraph.\n\n' + 'word '.repeat(1200) + 'Z'.repeat(200);
        const document = parseMarkdown(source, 'Test.md');
        const cards = layoutCards(document, measure);
        expect(cards.length).toBeGreaterThan(2);
        const expected = document.blocks.flatMap((block) => block.runs).map((run) => run.text).join('').replace(/\s/g, '');
        const actual = cards.slice(1).flatMap((card) => card.operations).map((operation) => operation.text).join('').replace(/\s/g, '');
        expect(actual).toBe(expected);
        for (const card of cards) for (const operation of card.operations) {
            expect(operation.x + operation.width).toBeLessThanOrEqual(editorial.width - editorial.margin);
            expect(operation.y).toBeGreaterThanOrEqual(editorial.top);
            expect(operation.y + editorial.fonts[operation.style].size).toBeLessThanOrEqual(editorial.bottom);
        }
    });
    it('continues very long cover titles and enforces limits without truncation', () => {
        const document = parseMarkdown('# ' + 'Title '.repeat(100));
        const cards = layoutCards(document, measure);
        expect(cards.length).toBeGreaterThan(1);
        expect(cards.every((card) => card.kind === 'cover')).toBe(true);
        expect(cards.flatMap((card) => card.operations).map((operation) => operation.text).join('')).toBe(document.title);
        expect(() => layoutCards(document, measure, editorial, 1)).toThrow('Shorten');
    });
    it('keeps grapheme clusters intact and terminates on unrenderable glyphs', () => {
        const lines = wrapRuns([{ text: 'e\u0301'.repeat(10), style: 'body' }], 80, measure);
        expect(lines.flat().map((operation) => operation.text).join('')).toBe('e\u0301'.repeat(10));
        expect(lines.flat().every((operation) => !operation.text.startsWith('\u0301'))).toBe(true);
        expect(() => wrapRuns([{ text: 'x', style: 'body' }], 1, measure)).toThrow('too wide');
    });
    it('produces deterministic layouts and keeps nearby headings with text', () => {
        const document = parseMarkdown('# Cover\n\n' + 'line\n'.repeat(14) + '\n## Heading\n\nText');
        const cards = layoutCards(document, measure);
        expect(layoutCards(document, measure)).toEqual(cards);
        const containingHeading = cards.find((card) => card.operations.some((operation) => operation.text === 'Heading'));
        expect(containingHeading?.operations.some((operation) => operation.text === 'Text')).toBe(true);
    });
});