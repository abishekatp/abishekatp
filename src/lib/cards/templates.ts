import type { CardTemplate, TextStyle } from './types';

export const editorial: CardTemplate = {
    id: 'editorial-v1', name: 'Editorial', width: 1080, height: 1350,
    margin: 96, top: 166, bottom: 1170,
    background: '#272a2e', ink: '#ffffff', muted: '#b7bec4', accent: '#8dc6bd',
    lineHeight: 57, gap: 30,
    fonts: {
        body: { family: 'Cards Sans', size: 40, weight: 400 },
        bold: { family: 'Cards Sans', size: 40, weight: 700 },
        italic: { family: 'Cards Sans', size: 40, weight: 400, italic: true },
        boldItalic: { family: 'Cards Sans', size: 40, weight: 700, italic: true },
        code: { family: 'monospace', size: 32, weight: 400 },
        heading: { family: 'Cards Sans', size: 48, weight: 700 },
        title: { family: 'Cards Sans', size: 76, weight: 700 }
    }
};

export const templates: Record<string, CardTemplate> = { [editorial.id]: editorial };

export function fontString(template: CardTemplate, style: TextStyle): string {
    const font = template.fonts[style];
    return `${font.italic ? 'italic ' : ''}${font.weight} ${font.size}px "${font.family}"`;
}