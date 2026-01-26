<script lang="ts">
    import { page } from "$app/stores";
    import { base } from "$app/paths";

    const links = [
        { href: `${base}/`, label: "Home" },
        { href: `${base}/about`, label: "About" },
        { href: `${base}/contact`, label: "Contact" },
    ];

    let isMenuOpen = false;
</script>

<nav
    class="bg-philosophy/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10"
>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <div class="flex-shrink-0">
                <a
                    href="{base}/"
                    class="text-xl font-serif font-bold text-slate-100 tracking-wider"
                >
                    ABISHEK P
                </a>
            </div>
            <div class="hidden md:block">
                <div class="ml-10 flex items-baseline space-x-8">
                    {#each links as link}
                        <a
                            href={link.href}
                            class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
              {$page.url.pathname === link.href
                                ? 'text-accent'
                                : 'text-slate-300 hover:text-white'}"
                        >
                            {link.label}
                        </a>
                    {/each}
                </div>
            </div>
            <div class="-mr-2 flex md:hidden">
                <button
                    type="button"
                    class="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none"
                    on:click={() => (isMenuOpen = !isMenuOpen)}
                >
                    <span class="sr-only">Open main menu</span>
                    <!-- Heroicon name: menu -->
                    <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    {#if isMenuOpen}
        <div class="md:hidden bg-philosophy border-b border-white/10">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {#each links as link}
                    <a
                        href={link.href}
                        class="block px-3 py-2 rounded-md text-base font-medium
            {$page.url.pathname === link.href
                            ? 'text-accent bg-white/5'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'}"
                        on:click={() => (isMenuOpen = false)}
                    >
                        {link.label}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</nav>
