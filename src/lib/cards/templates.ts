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

export function customizeTemplate(textColor: string, backgroundColor: string, fontSize: number): CardTemplate {
    if (!/^#[0-9a-f]{6}$/i.test(textColor) || !/^#[0-9a-f]{6}$/i.test(backgroundColor)) {
        throw new Error('Choose valid text and background colors.');
    }
    if (!Number.isFinite(fontSize) || fontSize < 32 || fontSize > 64) {
        throw new Error('Font size must be between 32 and 64 px.');
    }
    const scale = fontSize / editorial.fonts.body.size;
    const fonts = { ...editorial.fonts };
    for (const style of Object.keys(fonts) as TextStyle[]) {
        fonts[style] = { ...fonts[style], size: Math.round(editorial.fonts[style].size * scale) };
    }
    return { ...editorial, ink: textColor, background: backgroundColor, fonts,
        lineHeight: Math.round(editorial.lineHeight * scale), gap: Math.round(editorial.gap * scale) };
}

export function fontString(template: CardTemplate, style: TextStyle): string {
    const font = template.fonts[style];
    return `${font.italic ? 'italic ' : ''}${font.weight} ${font.size}px "${font.family}"`;
}