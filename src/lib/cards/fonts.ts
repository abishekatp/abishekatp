import sansRegular from '@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2?url';
import sansBold from '@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff2?url';
import sansItalic from '@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff2?url';
import sansBoldItalic from '@fontsource/source-sans-3/files/source-sans-3-latin-700-italic.woff2?url';

let loading: Promise<void> | undefined;

export function loadCardFonts(): Promise<void> {
    if (loading) return loading;
    loading = (async () => {
        const faces = [
            new FontFace('Cards Sans', `url("${sansRegular}")`, { weight: '400' }),
            new FontFace('Cards Sans', `url("${sansBold}")`, { weight: '700' }),
            new FontFace('Cards Sans', `url("${sansItalic}")`, { weight: '400', style: 'italic' }),
            new FontFace('Cards Sans', `url("${sansBoldItalic}")`, { weight: '700', style: 'italic' })
        ];
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
            await Promise.race([
                Promise.all(faces.map((face) => face.load())),
                new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Font timeout')), 15000); })
            ]);
            faces.forEach((face) => document.fonts.add(face));
        } catch {
            loading = undefined;
            throw new Error('Card fonts could not be loaded. Check your connection and try again.');
        } finally {
            clearTimeout(timer);
        }
    })();
    return loading;
}