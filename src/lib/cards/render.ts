import { editorial, fontString } from './templates';
import type { CardLayout, CardTemplate, MeasureText } from './types';

export function canvasMeasure(context: CanvasRenderingContext2D, template: CardTemplate = editorial): MeasureText {
    return (text, style) => {
        context.font = fontString(template, style);
        return context.measureText(text).width;
    };
}

export function renderCard(canvas: HTMLCanvasElement, card: CardLayout, index: number, _total: number, template: CardTemplate = editorial): void {
    canvas.style.setProperty('-webkit-font-smoothing', 'antialiased');
    canvas.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
    canvas.width = template.width;
    canvas.height = template.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.fillStyle = template.background;
    context.fillRect(0, 0, template.width, template.height);
    context.fillStyle = template.accent;
    context.fillRect(template.margin, 92, card.kind === 'cover' ? 160 : 70, 8);
    context.textBaseline = 'top';
    context.fillStyle = template.ink;
    for (const operation of card.operations) {
        context.font = fontString(template, operation.style);
        context.fillText(operation.text, operation.x, operation.y);
    }
    context.fillStyle = template.muted;
    context.font = '400 22px "Cards Sans"';
    context.textAlign = 'right';
    context.fillText(String(index + 1).padStart(2, '0'), template.width - template.margin, template.height - 68);
    context.textAlign = 'left';
}