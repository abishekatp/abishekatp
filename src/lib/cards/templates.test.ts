import { expect, it } from 'vitest';
import { customizeTemplate, editorial } from './templates';
import { layoutCards } from './layout';
import { parseMarkdown } from './parse';

it('customizes colors and scales all typography without mutating defaults', () => {
    const template = customizeTemplate('#ffeecc', '#112233', 64);
    expect(template.ink).toBe('#ffeecc');
    expect(template.background).toBe('#112233');
    expect(template.fonts.body.size).toBe(64);
    expect(template.fonts.title.size).toBe(122);
    expect(template.lineHeight).toBe(91);
    expect(editorial.fonts.body.size).toBe(40);
    const cards = layoutCards(parseMarkdown('# ' + 'Long title '.repeat(30) + '\n\n## Heading\n\n' + 'Content '.repeat(500)),
        (text, style) => text.length * template.fonts[style].size * .5, template);
    for (const card of cards) for (const operation of card.operations) {
        expect(operation.y + template.fonts[operation.style].size).toBeLessThanOrEqual(template.bottom);
    }
});

it('rejects invalid colors and font sizes', () => {
    expect(() => customizeTemplate('red', '#112233', 40)).toThrow('colors');
    for (const size of [NaN, 0, 65]) expect(() => customizeTemplate('#ffffff', '#112233', size)).toThrow('Font size');
});