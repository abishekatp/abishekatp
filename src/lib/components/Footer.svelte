<script lang="ts">
    const currentYear = new Date().getFullYear();
</script>

<footer class="bg-philosophy py-8 border-t border-white/10 mt-auto">
    <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center bg-gray-600"
    >
        <div class="mb-4 md:mb-0 space-y-1">
            <p class="text-slate-400 text-sm">
                &copy; {currentYear} Abishek P. All rights reserved.
            </p>
            <p class="text-slate-500 text-xs">
                All content licensed under
                <a
                    href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                    target="_blank"
                    rel="noopener noreferrer license"
                    class="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                    CC BY-NC-ND 4.0
                </a>
                — not for commercial use without permission.
            </p>
        </div>
        <div class="flex space-x-6">
            <a
                href="https://github.com/abishek-atp"
                target="_blank"
                rel="noopener noreferrer"
                class="text-slate-400 hover:text-white transition-colors"
            >
                <span class="sr-only">GitHub</span>
                GitHub
            </a>
            <a
                href="https://www.linkedin.com/in/abishek-p/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-slate-400 hover:text-white transition-colors"
            >
                <span class="sr-only">LinkedIn</span>
                LinkedIn
            </a>
        </div>
    </div>
</footer>
