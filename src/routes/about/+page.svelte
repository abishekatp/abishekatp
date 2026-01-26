<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <header class="mb-16">
        <h1 class="text-5xl font-serif font-bold text-slate-100 mb-6">
            About Me
        </h1>
        <p class="text-xl text-slate-400 leading-relaxed">
            I am a Software Development Engineer with a passion for Rust,
            Golang, and building efficient systems. I strive to apply my
            knowledge to advance science and technology for the betterment of
            society.
        </p>
    </header>

    <div class="space-y-16">
        <!-- About Myself -->
        <section>
            <h2
                class="text-3xl font-serif font-bold text-slate-100 mb-8 border-b border-white/10 pb-4"
            >
                About Myself
            </h2>
            <div class="prose prose-invert prose-lg max-w-none text-slate-400">
                <p>
                    I am a dedicated Software Development Engineer with a strong
                    passion for systems programming and web technologies. My
                    journey involves deep dives into Rust, Golang, and building
                    efficient, scalable systems. I believe in using technology
                    as a tool to advance science and improve lives.
                </p>
                <p class="mt-4">
                    Beyond code, I am driven by philosophical inquiry—constantly
                    asking "why" and seeking truth in both logic and life. I
                    enjoy contributing to open source, exploring new languages,
                    and refining my craft.
                </p>
            </div>
        </section>

        <!-- Skills -->
        <section>
            <h2
                class="text-3xl font-serif font-bold text-slate-100 mb-8 border-b border-white/10 pb-4"
            >
                Technical Skills
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-bold text-slate-200 mb-4">
                        Programming Languages
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        {#each ["Golang", "Rust", "TypeScript", "C", "Python", "Java"] as skill}
                            <span
                                class="px-3 py-1 bg-white/5 rounded-full text-sm text-slate-300 border border-white/5 hover:border-accent/50 transition-colors"
                            >
                                {skill}
                            </span>
                        {/each}
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-slate-200 mb-4">
                        Web & Systems
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        {#each ["SvelteJS", "Dioxus", "React", "PostgreSQL", "HTML/CSS", "Embdedded (Arduino/8051)"] as skill}
                            <span
                                class="px-3 py-1 bg-white/5 rounded-full text-sm text-slate-300 border border-white/5 hover:border-accent/50 transition-colors"
                            >
                                {skill}
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        </section>

        <!-- Education -->
        <section>
            <h2
                class="text-3xl font-serif font-bold text-slate-100 mb-8 border-b border-white/10 pb-4"
            >
                Education
            </h2>
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-bold text-slate-100">
                        Vellore Institute of Technology
                    </h3>
                    <p class="text-slate-400">
                        B.Tech Electronics and Communication Engineering
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-accent font-bold">8.54 CGPA</p>
                    <p class="text-slate-500 text-sm">
                        100% Scholarship (STARS)
                    </p>
                </div>
            </div>
        </section>
    </div>
</div>
