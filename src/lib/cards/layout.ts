import type { CardDocument, CardLayout, CardTemplate, InlineRun, MeasureText, TextOperation, TextStyle } from './types';
import { editorial } from './templates';

export const MAX_CARDS = 60;
type Line = Omit<TextOperation, 'y'>[];
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function wrapRuns(runs: InlineRun[], width: number, measure: MeasureText): Line[] {
    const lines: Line[] = [];
    let line: Line = [];
    let cursor = 0;
    function flush(): void {
        lines.push(line);
        line = [];
        cursor = 0;
    }
    function append(text: string, style: TextStyle): void {
        const measured = measure(text, style);
        const previous = line.at(-1);
        if (previous?.style === style) {
            const combinedWidth = measure(previous.text + text, style);
            if (previous.x + combinedWidth <= width) {
                previous.text += text;
                cursor = previous.x + combinedWidth;
                previous.width = combinedWidth;
                return;
            }
        }
        line.push({ text, style, x: cursor, width: measured });
        cursor += measured;
    }
    for (const run of runs) {
        const tokens = run.text.replace(/\t/g, '    ').match(/\n|[^\S\n]+|[^\s]+/gu) ?? [];
        for (const token of tokens) {
            if (token === '\n') { flush(); continue; }
            const tokenWidth = measure(token, run.style);
            if (cursor + tokenWidth > width && line.length) flush();
            if (tokenWidth <= width) {
                append(token, run.style);
            } else {
                for (const { segment } of segmenter.segment(token)) {
                    const glyphWidth = measure(segment, run.style);
                    if (glyphWidth > width) throw new Error('A character is too wide for this template. Shorten the input or reduce list nesting.');
                    if (cursor + glyphWidth > width && line.length) flush();
                    append(segment, run.style);
                }
            }
        }
    }
    if (line.length) flush();
    return lines;
}

export function layoutCards(document: CardDocument, measure: MeasureText, template: CardTemplate = editorial, maxCards = MAX_CARDS): CardLayout[] {
    const cards: CardLayout[] = [];
    const width = template.width - template.margin * 2;
    let current: CardLayout;
    let cursor = template.top;
    function newCard(kind: CardLayout['kind']): void {
        if (cards.length >= maxCards) throw new Error(`This document needs more than ${maxCards} cards. Shorten the input and regenerate.`);
        current = { kind, operations: [] };
        cards.push(current);
        cursor = template.top;
    }
    function place(lines: Line[], lineHeight: number, indent: number, kind: CardLayout['kind']): void {
        for (const line of lines) {
            if (cursor + lineHeight > template.bottom) newCard(kind);
            for (const operation of line) {
                current.operations.push({ ...operation, x: template.margin + indent + operation.x, y: cursor });
            }
            cursor += lineHeight;
        }
    }
    newCard('cover');
    const titleLines = wrapRuns([{ text: document.title, style: 'title' }], width, measure);
    const titleHeight = 106;
    cursor = titleLines.length <= 7 ? Math.max(template.top, (template.bottom - titleLines.length * titleHeight) / 2) : template.top;
    place(titleLines, titleHeight, 0, 'cover');
    const meaningful = document.blocks.filter((block) => block.kind !== 'rule' || block.runs.length);
    if (!meaningful.length) return cards;
    newCard('content');
    document.blocks.forEach((block, index) => {
        if (block.kind === 'rule') {
            cursor = Math.min(template.bottom, cursor + template.gap);
            return;
        }
        const indent = Math.min(block.depth ?? 0, 8) * 30 + (block.kind === 'quote' ? 28 : 0);
        const runs = block.kind === 'heading' ? block.runs.map((run) => ({ ...run, style: 'heading' as const })) : block.runs;
        const withPrefix: InlineRun[] = [...(block.prefix ? [{ text: block.prefix, style: 'body' as const }] : []), ...runs];
        const lines = wrapRuns(withPrefix, width - indent, measure);
        const lineHeight = block.kind === 'heading' ? 70 : template.lineHeight;
        const height = lines.length * lineHeight;
        const headingReserve = block.kind === 'heading' && document.blocks[index + 1] ? template.gap + template.lineHeight * 2 : 0;
        if (current.operations.length && cursor + height + headingReserve > template.bottom && height + headingReserve <= template.bottom - template.top) newCard('content');
        place(lines, lineHeight, indent, 'content');
        cursor += template.gap;
    });
    return cards;
}