<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { Upload, Download, ChevronLeft, ChevronRight, RotateCcw, Sparkles, X, FileText, AlertCircle } from '@lucide/svelte';
    import { parseMarkdown, validateFile, MAX_INPUT_BYTES } from '$lib/cards/parse';
    import { loadCardFonts } from '$lib/cards/fonts';
    import { layoutCards } from '$lib/cards/layout';
    import { canvasMeasure } from '$lib/cards/render';
    import { exportCards, saveZip, nextFrame } from '$lib/cards/export';
    import CardPreview from '$lib/cards/components/CardPreview.svelte';
    import type { CardLayout } from '$lib/cards/types';

    let source = '';
    let title = '';
    let filename = '';
    let cards: CardLayout[] = [];
    let sample: CardLayout[] = [];
    let warnings: string[] = [];
    let selected = 0;
    let generatedSource = '';
    let generatedTitle = '';
    let documentTitle = '';
    let busy = false;
    let status = '';
    let error = '';
    let dragging = false;
    let request = 0;
    let hydrated = false;
    let fileInput: HTMLInputElement;
    const example = '# Small moments, lasting thoughts\n\nSome ideas arrive quietly. A conversation, a walk, a line in a book: each leaves something behind.\n\n## Make room for attention\n\nThere is value in slowing down long enough to notice what stays with us.\n\n- Notice the ordinary.\n- Keep a little space for curiosity.\n- Write down what matters.\n\n> Not every thought needs an answer. Some need time.';
    $: dirty = source !== generatedSource || title !== generatedTitle;
    $: preview = cards.length ? cards : sample;

    function cancel(): void {
        request++;
        busy = false;
        status = 'Cancelled.';
    }
    onDestroy(() => { request++; });

    onMount(() => {
        hydrated = true;
        const token = request;
        loadCardFonts().then(() => {
            if (token !== request) return;
            const context = document.createElement('canvas').getContext('2d');
            if (context) sample = layoutCards(parseMarkdown(example), canvasMeasure(context));
        }).catch(() => {});
    });

    async function generate(): Promise<void> {
        const token = ++request;
        const inputSource = source;
        const inputTitle = title;
        busy = true;
        error = '';
        status = 'Preparing cards...';
        try {
            await nextFrame();
            const parsed = parseMarkdown(inputSource, filename || 'Untitled.md', inputTitle);
            await loadCardFonts();
            if (token !== request) return;
            const context = document.createElement('canvas').getContext('2d');
            if (!context) throw new Error('Canvas is not available in this browser.');
            const result = layoutCards(parsed, canvasMeasure(context));
            if (token !== request) return;
            cards = result;
            warnings = parsed.warnings;
            documentTitle = parsed.title;
            generatedSource = inputSource;
            generatedTitle = inputTitle;
            selected = 0;
            status = `${cards.length} cards ready.`;
        } catch (cause) {
            if (token === request) { error = cause instanceof Error ? cause.message : 'Cards could not be generated.'; status = ''; }
        } finally { if (token === request) busy = false; }
    }

    async function loadFile(file?: File): Promise<void> {
        if (!file || busy) return;
        const token = ++request;
        error = '';
        busy = true;
        status = 'Reading Markdown...';
        try {
            validateFile(file);
            const text = await file.text();
            if (token !== request) return;
            filename = file.name;
            source = text;
            title = '';
            cards = [];
            warnings = [];
            selected = 0;
            await generate();
        } catch (cause) {
            if (token === request) { error = cause instanceof Error ? cause.message : 'The file could not be read.'; status = ''; }
        } finally { if (token === request) busy = false; }
    }

    function reset(): void {
        cancel();
        source = ''; title = ''; filename = ''; cards = []; warnings = [];
        generatedSource = ''; generatedTitle = ''; documentTitle = ''; selected = 0;
        status = ''; error = '';
        if (fileInput) fileInput.value = '';
    }

    async function download(): Promise<void> {
        if (busy || dirty || !cards.length) return;
        const token = ++request;
        busy = true;
        error = '';
        status = `Exporting 0 of ${cards.length}...`;
        const assertActive = () => { if (token !== request) throw new Error('Cancelled.'); };
        try {
            const blob = await exportCards(cards, (completed) => { if (token === request) status = `Exporting ${completed} of ${cards.length}...`; }, assertActive);
            assertActive();
            saveZip(blob, documentTitle);
            status = `${cards.length} PNGs exported.`;
        } catch (cause) {
            if (token === request) { error = cause instanceof Error ? cause.message : 'Export failed. Try again.'; status = ''; }
        } finally { if (token === request) busy = false; }
    }

    function drop(event: DragEvent): void {
        event.preventDefault();
        dragging = false;
        if (event.dataTransfer?.files.length !== 1) { error = 'Choose one Markdown file at a time.'; return; }
        void loadFile(event.dataTransfer.files[0]);
    }

    async function useExample(): Promise<void> {
        filename = 'example.md'; source = example; title = '';
        await generate();
    }
</script>

<svelte:head>
    <title>Cards | ABISHEK P</title>
    <meta name="description" content="Create Instagram cards from your Markdown and download PNGs in a ZIP, privately in your browser." />
</svelte:head>

<section class="cards-workspace">
    <header class="workspace-header">
        <div><p class="eyebrow">THE STUDIO</p><h1>Cards</h1></div>
        <div class="header-actions">
            <button class="icon-button" on:click={reset} disabled={busy || (!source && !error)} title="Reset" aria-label="Reset"><RotateCcw size={19} /></button>
            <button class="primary" on:click={download} disabled={!cards.length || dirty || busy}><Download size={18} /> Download ZIP</button>
        </div>
    </header>

    <div class="workspace-grid">
        <aside class="editor">
            <div class="section-heading"><h2>Document</h2><button class="text-button" on:click={useExample} disabled={busy}>Load example</button></div>
            <input class="file-input" bind:this={fileInput} type="file" accept=".md,.markdown,text/markdown" aria-label="Markdown file" disabled={busy || !hydrated} on:change={(event) => { void loadFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
            <button class:dragging class="upload-zone" disabled={busy || !hydrated} on:click={() => fileInput.click()} on:dragover={(event) => { event.preventDefault(); dragging = true; }} on:dragleave={() => dragging = false} on:drop={drop}>
                {#if filename}<FileText size={25} /><span class="file-name">{filename}</span>{:else}<Upload size={25} /><span>Choose Markdown</span>{/if}
                <span class="upload-meta">.md / .markdown · 1 MiB max</span>
            </button>
            <label for="card-title">Title override</label>
            <input id="card-title" bind:value={title} autocomplete="off" disabled={busy || !hydrated} placeholder={documentTitle || 'From your document'} />
            <div class="source-label"><label for="markdown-source">Markdown</label><span>{new TextEncoder().encode(source).length.toLocaleString()} / {MAX_INPUT_BYTES.toLocaleString()} bytes</span></div>
            <textarea id="markdown-source" bind:value={source} autocomplete="off" disabled={busy || !hydrated} spellcheck="false"></textarea>
            <div class="editor-footer">
                <span>{cards.length && dirty ? 'Unapplied changes' : filename ? 'Local document' : 'No file selected'}</span>
                <button class="generate" on:click={generate} disabled={busy || !source.trim()}><Sparkles size={17} />{cards.length ? 'Regenerate' : 'Generate'}</button>
            </div>
            {#if warnings.length}<ul class="warnings">{#each warnings as warning}<li><AlertCircle size={15} /><span>{warning}</span></li>{/each}</ul>{/if}
        </aside>

        <section class="preview-section" aria-label="Card preview">
            <div class="section-heading"><h2>{cards.length ? 'Preview' : 'Example'}</h2><span class="template-label">Editorial <span class="swatch"></span></span></div>
            <div class="preview-stage">
                <div class="paper">
                    {#if preview[selected]}<CardPreview card={preview[selected]} index={selected} total={preview.length} />{:else}<div class="empty-paper"><span>Cards</span></div>{/if}
                </div>
            </div>
            <div class="preview-toolbar">
                <span class="dimensions">1080 × 1350 <span>PNG</span></span>
                <div class="pagination">
                    <button class="icon-button" on:click={() => selected--} disabled={selected === 0 || busy} title="Previous card" aria-label="Previous card"><ChevronLeft size={20} /></button>
                    <span class="counter">{preview.length ? selected + 1 : 0} / {preview.length}</span>
                    <button class="icon-button" on:click={() => selected++} disabled={selected >= preview.length - 1 || busy} title="Next card" aria-label="Next card"><ChevronRight size={20} /></button>
                </div>
            </div>
            {#if preview.length > 1}
                <div class="slide-list" aria-label="Cards">
                    {#each preview as card, index}<button class:active={index === selected} aria-label="Show card {index + 1}" aria-current={index === selected ? 'true' : undefined} disabled={busy} on:click={() => selected = index}>{String(index + 1).padStart(2, '0')}</button>{/each}
                </div>
            {/if}
        </section>
    </div>
    <footer class="status-bar">
        <div role="status" aria-live="polite"><span class:working={busy} class="status-dot"></span>{busy || status ? status : 'Ready'}{#if busy}<button class="text-button" on:click={cancel}><X size={14} />Cancel</button>{/if}</div>
        <span class="privacy">Local processing</span>
    </footer>
    {#if error}<div class="error" role="alert"><AlertCircle size={18} /><span>{error}</span><button class="icon-button" on:click={() => error = ''} aria-label="Dismiss error" title="Dismiss error"><X size={18} /></button></div>{/if}
</section>

<style>
    .cards-workspace { --ink: #242c2a; --muted: #697773; --line: #dce4e0; --teal: #137b71; background: #f8faf9; color: var(--ink); max-width: 1200px; margin: 32px auto 48px; font-family: 'Cards Sans', 'Source Sans 3', sans-serif; }
    .workspace-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 24px 32px; border-bottom: 1px solid var(--line); }
    .eyebrow { font-size: 11px; font-weight: 700; color: var(--teal); margin: 0 0 4px; letter-spacing: 0; }
    h1 { font-size: 32px; line-height: 1.2; color: var(--ink); margin: 0; }
    h2 { font: 600 17px 'Cards Sans', sans-serif; margin: 0; color: var(--ink); }
    .header-actions, .pagination, .editor-footer, .section-heading, .preview-toolbar { display: flex; align-items: center; gap: 12px; }
    button { display: inline-flex; justify-content: center; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; transition: background 150ms; border-radius: 4px; }
    button:disabled { opacity: .42; cursor: not-allowed; }
    button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
    .primary, .generate { background: var(--teal); color: white; min-height: 40px; padding: 9px 16px; white-space: nowrap; }
    .primary:hover:not(:disabled), .generate:hover:not(:disabled) { background: #0b6259; }
    .icon-button { width: 36px; height: 36px; flex-shrink: 0; }
    .icon-button:hover:not(:disabled) { background: #e4ece8; }
    .text-button { color: var(--teal); font-size: 13px; padding: 5px 0; }
    .workspace-grid { display: grid; grid-template-columns: minmax(0, 380px) minmax(0, 1fr); }
    .editor { border-right: 1px solid var(--line); padding: 24px; min-width: 0; }
    .section-heading { justify-content: space-between; margin-bottom: 18px; min-height: 28px; }
    .file-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .upload-zone { display: flex; flex-direction: column; width: 100%; min-height: 138px; border: 1px dashed #adbfba; background: #edf4f1; color: var(--teal); margin-bottom: 24px; padding: 20px 12px; }
    .upload-zone.dragging, .upload-zone:hover:not(:disabled) { background: #deece6; border-color: var(--teal); }
    .file-name { overflow-wrap: anywhere; max-width: 100%; }
    .upload-meta { color: var(--muted); font-size: 12px; font-weight: 400; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
    input:not(.file-input), textarea { width: 100%; background: white; border: 1px solid #cad6d0; border-radius: 4px; color: var(--ink); padding: 10px 12px; font-size: 14px; }
    input:not(.file-input) { height: 44px; margin-bottom: 20px; }
    .source-label { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .source-label span { font-size: 10px; color: var(--muted); white-space: nowrap; }
    textarea { height: 290px; min-height: 160px; resize: vertical; font: 12px/1.7 ui-monospace, monospace; }
    .editor-footer { justify-content: space-between; margin-top: 14px; }
    .editor-footer > span { font-size: 12px; color: var(--muted); }
    .warnings { list-style: none; padding: 16px 0 0; margin: 16px 0 0; border-top: 1px solid var(--line); font-size: 12px; color: #785716; }
    .warnings li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; }
    .warnings :global(svg) { flex-shrink: 0; margin-top: 2px; }
    .preview-section { min-width: 0; padding: 24px 32px; }
    .template-label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
    .swatch { width: 12px; height: 12px; background: #272a2e; border: 2px solid white; outline: 1px solid #cad6d0; }
    .preview-stage { display: flex; justify-content: center; padding: 24px; background-color: #e8eeeb; background-image: radial-gradient(#c2cec8 1px, transparent 1px); background-size: 16px 16px; }
    .paper { width: 100%; max-width: 400px; aspect-ratio: 4 / 5; box-shadow: 0 8px 22px #25392c14; }
    .empty-paper { aspect-ratio: 4 / 5; background: #272a2e; display: grid; place-items: center; font: 700 32px 'Cards Sans', sans-serif; color: #ffffff; }
    .preview-toolbar { justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--line); }
    .dimensions { font-size: 12px; color: var(--muted); }
    .dimensions > span { margin-left: 8px; font-size: 10px; }
    .counter { width: 60px; text-align: center; font-size: 13px; font-variant-numeric: tabular-nums; }
    .pagination { gap: 0; }
    .slide-list { display: flex; gap: 6px; overflow-x: auto; padding: 16px 0 4px; }
    .slide-list button { flex-shrink: 0; width: 38px; height: 38px; border: 1px solid #cad6d0; background: white; font-variant-numeric: tabular-nums; }
    .slide-list button.active { color: white; background: var(--teal); border-color: var(--teal); }
    .status-bar { border-top: 1px solid var(--line); display: flex; justify-content: space-between; gap: 12px; padding: 14px 24px; font-size: 12px; color: var(--muted); }
    .status-bar > div { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    .status-dot { width: 6px; height: 6px; background: var(--teal); border-radius: 50%; }
    .working { animation: pulse 1s ease-in-out infinite; }
    .error { display: flex; align-items: center; gap: 10px; background: #fff1ef; border-top: 1px solid #f5ceca; color: #9b312a; padding: 12px 24px; font-size: 14px; }
    .error :global(svg) { flex-shrink: 0; }
    .error > span { flex: 1; overflow-wrap: anywhere; }
    @keyframes pulse { 50% { opacity: .3; } }
    @media (prefers-reduced-motion: reduce) { .working { animation: none; } }
    @media (max-width: 767px) {
        .cards-workspace { margin: 0; }
        .workspace-header { padding: 20px 16px; }
        .workspace-grid { grid-template-columns: minmax(0, 1fr); }
        .editor { border-right: 0; border-bottom: 1px solid var(--line); padding: 20px 16px; }
        textarea { height: 190px; }
        .preview-section { padding: 20px 16px; }
        .preview-stage { padding: 16px; }
        .privacy { display: none; }
        .header-actions { gap: 4px; }
        .primary { font-size: 12px; padding: 9px 10px; }
        .status-bar { padding: 12px 16px; }
    }
</style>