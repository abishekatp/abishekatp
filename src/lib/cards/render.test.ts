import { describe, expect, it, vi } from 'vitest';
import { renderCard } from './render';
import { editorial } from './templates';

describe('Instagram card appearance', () => {
    it('renders white text on graphite without a book footer', () => {
        const fills: string[] = [];
        const context = {
            fillStyle: '', font: '', textBaseline: '',
            fillRect: vi.fn(() => { fills.push(context.fillStyle); }),
            fillText: vi.fn()
        };
        const canvas = {
            style: { setProperty: vi.fn() },
            getContext: () => context,
            width: 0, height: 0
        } as unknown as HTMLCanvasElement;
        renderCard(canvas, {
            kind: 'cover',
            operations: [{ text: 'A real thought', x: 96, y: 400, width: 300, style: 'title' }]
        }, 0, 5);
        expect(fills[0]).toBe('#272a2e');
        expect(context.fillRect.mock.calls).toHaveLength(2);
        expect(context.fillText.mock.calls).toEqual([['A real thought', 96, 400]]);
        expect(context.font).toContain('Cards Sans');
        expect(context.fillStyle).toBe(editorial.ink);
        expect(context.fillStyle).toBe('#ffffff');
    });
});