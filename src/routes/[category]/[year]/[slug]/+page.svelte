<script lang="ts">
    import type { PageData } from "./$types";
    import { formatDate } from "$lib/utils";

    export let data: PageData;
</script>

<article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <header class="mb-12 text-center">
        <div
            class="flex items-center justify-center gap-4 text-sm text-slate-400 mb-6 font-mono"
        >
            <time>{formatDate(data.meta.date)}</time>
            <span>•</span>
            <span class="uppercase tracking-widest">{data.meta.category}</span>
        </div>
        <h1
            class="text-4xl md:text-5xl font-serif font-bold text-slate-100 leading-tight mb-6"
        >
            {data.meta.title}
        </h1>
        {#if data.meta.description}
            <p class="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                {data.meta.description}
            </p>
        {/if}
    </header>

    <div
        class="prose prose-invert prose-lg mx-auto prose-headings:font-serif prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:text-blue-200 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10"
    >
        <svelte:component this={data.content} />
    </div>
</article>
