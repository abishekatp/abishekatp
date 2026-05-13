<script lang="ts">
    import type { PageData } from "./$types";
    import { formatDate } from "$lib/utils";
    import { base } from "$app/paths";

    export let data: PageData;
    // ... (rest of imports)

    const categories = [
        {
            name: "Philosophy",
            slug: "philosophy",
            desc: "Reflections on life and thought.",
            color: "bg-philosophy-light text-slate-100 hover:border-accent",
        },
        {
            name: "Technology",
            slug: "technology",
            desc: "Technical deep dives and tutorials.",
            color: "bg-technology-light text-blue-100 hover:border-blue-400",
        },
        {
            name: "The City of Paras",
            slug: "city-of-paras",
            desc: "A fictional saga set in the year 9925.",
            color: "bg-paras-light text-indigo-100 hover:border-indigo-400",
        },
    ];
</script>

<div class="space-y-24 pb-20">
    <!-- Hero Section -->
    <section class="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center">
        <div class="max-w-4xl mx-auto space-y-6">
            <h1
                class="text-5xl md:text-7xl font-bold font-serif text-slate-100 tracking-tight"
            >
                Building Logic, <br />
                <span class="text-accent italic">Seeking Truth</span>
            </h1>
            <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Hey I am Abishek, I write about technology, philosophy, 
                and the intersection of both. I write to think.
            </p>
            <div class="pt-8 flex justify-center gap-4">
                <a
                    href="{base}#categories"
                    class="px-8 py-3 bg-slate-100 text-philosophy font-semibold rounded-full hover:bg-white transition-all transform hover:scale-105"
                >
                    Read Blogs
                </a>
                <a
                    href="{base}/about"
                    class="px-8 py-3 border border-slate-700 text-slate-300 font-semibold rounded-full hover:border-slate-500 hover:text-white transition-all"
                >
                    About Me
                </a>
            </div>
        </div>
    </section>

    <!-- Categories Section -->
    <section id="categories" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-serif font-bold text-slate-100">
                Explore Topics
            </h2>
        </div>
        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {#each categories as cat}
                <a
                    href="{base}/{cat.slug}"
                    class="group relative overflow-hidden rounded-2xl p-8 border border-white/5 transition-all duration-300 {cat.color} hover:shadow-2xl hover:border-accent/50"
                >
                    <div class="relative z-10">
                        <h3
                            class="text-3xl font-serif font-bold mb-2 group-hover:translate-x-2 transition-transform"
                        >
                            {cat.name}
                        </h3>
                        <p
                            class="opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                            {cat.desc}
                        </p>
                    </div>
                    <div
                        class="absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500"
                    >
                        {cat.name[0]}
                    </div>
                </a>
            {/each}
        </div>
    </section>

    <!-- Recent Posts Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
            class="flex items-center justify-between mb-8 border-b border-white/10 pb-4"
        >
            <h2 class="text-2xl font-serif font-bold text-slate-100">
                Latest Writings
            </h2>
        </div>

        <div class="space-y-8">
            {#if data.posts.length === 0}
                <p class="text-slate-500 text-center py-10">
                    No posts found yet. Check back soon!
                </p>
            {:else}
                {#each data.posts as post}
                    <article class="group relative flex flex-col items-start">
                        <div
                            class="flex items-center gap-x-4 text-xs text-slate-400 mb-1"
                        >
                            <time datetime={post.date}
                                >{formatDate(post.date)}</time
                            >
                            <a
                                href="{base}/{post.category}"
                                class="relative z-10 rounded-full bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20 capitalize"
                                >{post.category}</a
                            >
                        </div>
                        <h3
                            class="mt-3 text-xl font-semibold leading-6 text-slate-100 group-hover:text-accent transition-colors"
                        >
                            <a
                                href="{base}/{post.category}/{post.year}/{post.slug}"
                            >
                                <span class="absolute inset-0"></span>
                                {post.title}
                            </a>
                        </h3>
                        <p
                            class="mt-3 line-clamp-3 text-sm leading-6 text-slate-400"
                        >
                            {post.description}
                        </p>
                    </article>
                {/each}
            {/if}
        </div>
    </section>
</div>
