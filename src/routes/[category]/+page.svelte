<script lang="ts">
    import type { PageData } from "./$types";
    import { formatDate } from "$lib/utils";
    import { base } from "$app/paths";

    export let data: PageData;
    $: ({ posts, category } = data);

    // Group posts by year
    $: postsByYear = posts.reduce(
        (acc, post) => {
            const year = post.year;
            if (!acc[year]) acc[year] = [];
            acc[year].push(post);
            return acc;
        },
        {} as Record<string, typeof posts>,
    );

    $: years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <header class="mb-20 text-center">
        <h1
            class="text-6xl font-serif font-bold capitalize text-slate-100 mb-4"
        >
            {category}
        </h1>
        <p class="text-slate-400 max-w-2xl mx-auto">
            {#if category === "philosophy"}
                Reflections on existence, meaning, and the human condition.
            {:else if category === "technology"}
                Snippets, tutorials, and deep dives into the world of technology.
            {:else}
                My thoughts and writings on {category}.
            {/if}
        </p>
    </header>

    <div class="space-y-20">
        {#each years as year}
            <section class="relative border-l border-white/10 pl-8 md:pl-12">
                <span
                    class="absolute -left-3 top-0 bg-philosophy border border-white/10 text-slate-400 font-serif font-bold py-1 px-3 rounded-md text-sm"
                >
                    {year}
                </span>

                <div class="space-y-12">
                    {#each postsByYear[year] as post}
                        <article class="group">
                            <div
                                class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2"
                            >
                                <h2
                                    class="text-2xl font-bold text-slate-100 group-hover:text-accent transition-colors"
                                >
                                    <a
                                        href="{base}/{category}/{year}/{post.slug}"
                                    >
                                        {post.title}
                                    </a>
                                </h2>
                                <time
                                    datetime={post.date}
                                    class="text-sm text-slate-500 font-mono whitespace-nowrap"
                                    >{formatDate(post.date)}</time
                                >
                            </div>
                            <p class="text-slate-400 leading-relaxed max-w-3xl">
                                {post.description}
                            </p>
                        </article>
                    {/each}
                </div>
            </section>
        {/each}

        {#if posts.length === 0}
            <div
                class="text-center py-20 border border-dashed border-white/10 rounded-xl"
            >
                <p class="text-slate-500">No entries found for this era yet.</p>
                <a
                    href="{base}/"
                    class="text-accent hover:underline mt-4 inline-block"
                    >Return Home</a
                >
            </div>
        {/if}
    </div>
</div>
