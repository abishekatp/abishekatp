import { zip } from 'fflate';
import { renderCard } from './render';
import type { CardLayout, CardTemplate } from './types';
import { editorial } from './templates';

export function nextFrame(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

export function downloadName(title: string): string {
    const stem = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    return `${stem || 'blog'}-cards.zip`;
}

export async function exportCards(cards: CardLayout[], onProgress: (completed: number) => void, assertActive: () => void, template: CardTemplate = editorial): Promise<Blob> {
    const files: Record<string, Uint8Array> = {};
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'fixed';
    canvas.style.left = '-10000px';
    canvas.style.pointerEvents = 'none';
    document.body.append(canvas);
    try {
        for (let index = 0; index < cards.length; index++) {
            assertActive();
            renderCard(canvas, cards[index], index, cards.length, template);
            const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('An image could not be encoded. Try again.')), 'image/png'));
            assertActive();
            files[`card-${String(index + 1).padStart(3, '0')}.png`] = new Uint8Array(await blob.arrayBuffer());
            onProgress(index + 1);
            await nextFrame();
        }
        assertActive();
        const data = await new Promise<Uint8Array>((resolve, reject) => {
            zip(files, { level: 0 }, (error, result) => error ? reject(error) : resolve(result));
        });
        assertActive();
        return new Blob([new Uint8Array(data)], { type: 'application/zip' });
    } finally {
        canvas.remove();
        canvas.width = 0;
        canvas.height = 0;
    }
}

export function saveZip(blob: Blob, title: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName(title);
    document.body.append(link);
    try { link.click(); }
    finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
}