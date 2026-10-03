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

function exifDate(date: Date): Uint8Array<ArrayBuffer> {
    const value = `${date.getFullYear()}:${String(date.getMonth() + 1).padStart(2, '0')}:${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}\0`;
    return new TextEncoder().encode(value);
}

function exifTiff(date: Date): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(96);
    const view = new DataView(bytes.buffer);
    bytes.set([0x49, 0x49]);
    view.setUint16(2, 42, true);
    view.setUint32(4, 8, true);
    view.setUint16(8, 2, true);
    view.setUint16(10, 0x0132, true);
    view.setUint16(12, 2, true);
    view.setUint32(14, 20, true);
    view.setUint32(18, 38, true);
    view.setUint16(22, 0x8769, true);
    view.setUint16(24, 4, true);
    view.setUint32(26, 1, true);
    view.setUint32(30, 58, true);
    view.setUint32(34, 0, true);
    bytes.set(exifDate(date), 38);
    view.setUint16(58, 1, true);
    view.setUint16(60, 0x9003, true);
    view.setUint16(62, 2, true);
    view.setUint32(64, 20, true);
    view.setUint32(68, 76, true);
    view.setUint32(72, 0, true);
    bytes.set(exifDate(date), 76);
    return bytes;
}

const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
    let crc = value;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    return crc >>> 0;
});

function crc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

export function addPngCaptureTime(png: Uint8Array, date: Date): Uint8Array<ArrayBuffer> {
    if (png.length < 33 || png[0] !== 137 || png[1] !== 80 || png[2] !== 78 || png[3] !== 71 || png[12] !== 73 || png[13] !== 72 || png[14] !== 68 || png[15] !== 82) {
        throw new Error('The generated image is not a valid PNG.');
    }
    const metadata = exifTiff(date);
    const type = new TextEncoder().encode('eXIf');
    const chunkBody = new Uint8Array(type.length + metadata.length);
    chunkBody.set(type);
    chunkBody.set(metadata, type.length);
    const chunk = new Uint8Array(12 + metadata.length);
    const chunkView = new DataView(chunk.buffer);
    chunkView.setUint32(0, metadata.length, false);
    chunk.set(chunkBody, 4);
    chunkView.setUint32(4 + chunkBody.length, crc32(chunkBody), false);
    const result = new Uint8Array(png.length + chunk.length);
    result.set(png.subarray(0, 33));
    result.set(chunk, 33);
    result.set(png.subarray(33), 33 + chunk.length);
    return result;
}

export function cardCaptureTime(index: number, now = Date.now()): Date {
    return new Date(Math.floor(now / 1000) * 1000 - index * 60_000);
}

export async function exportCards(cards: CardLayout[], onProgress: (completed: number) => void, assertActive: () => void, template: CardTemplate = editorial): Promise<Blob> {
    const files: Record<string, [Uint8Array, { mtime: Date }]> = {};
    const captureBase = Date.now();
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
            const mtime = cardCaptureTime(index, captureBase);
            files[`card-${String(index + 1).padStart(3, '0')}.png`] = [addPngCaptureTime(new Uint8Array(await blob.arrayBuffer()), mtime), { mtime }];
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