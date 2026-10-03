import { describe, expect, it } from 'vitest';
import { PNG } from 'pngjs';
import { addPngCaptureTime, cardCaptureTime } from './export';

describe('gallery ordering metadata', () => {
    it('assigns descending one-minute capture times so card 001 sorts newest', () => {
        const now = new Date(2026, 9, 3, 12, 30, 17).getTime();
        expect(cardCaptureTime(0, now).getTime()).toBe(now);
        expect(cardCaptureTime(1, now).getTime()).toBe(now - 60_000);
        expect(cardCaptureTime(2, now).getTime()).toBeLessThan(cardCaptureTime(1, now).getTime());
    });

    it('adds readable EXIF DateTimeOriginal metadata without changing PNG pixels', () => {
        const image = new PNG({ width: 2, height: 1 });
        image.data.set([10, 20, 30, 255, 40, 50, 60, 255]);
        const original = PNG.sync.write(image);
        const date = new Date(2026, 9, 3, 12, 29, 17);
        const output = addPngCaptureTime(new Uint8Array(original), date);
        expect(PNG.sync.read(Buffer.from(output)).data).toEqual(PNG.sync.read(original).data);
        const view = new DataView(output.buffer, output.byteOffset, output.byteLength);
        expect(new TextDecoder().decode(output.subarray(37, 41))).toBe('eXIf');
        const tiff = 41;
        expect(view.getUint16(tiff + 8, true)).toBe(2);
        expect(view.getUint16(tiff + 10, true)).toBe(0x0132);
        expect(view.getUint32(tiff + 18, true)).toBe(38);
        const localDate = `${date.getFullYear()}:${String(date.getMonth() + 1).padStart(2, '0')}:${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}\0`;
        expect(new TextDecoder().decode(output.subarray(tiff + 38, tiff + 58))).toBe(localDate);
        expect(view.getUint16(tiff + 60, true)).toBe(0x9003);
        expect(new TextDecoder().decode(output.subarray(tiff + 76, tiff + 96))).toBe(localDate);
    });
});