<script lang="ts">
    const currentYear = new Date().getFullYear();
</script>

<footer class="bg-philosophy py-8 border-t border-white/10 mt-auto">
    <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center bg-gray-600"
    >
        <div class="mb-4 md:mb-0">
            <p class="text-slate-400 text-sm">
                &copy; {currentYear} Abishek P. All rights reserved.
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
                href="https://linkedin.com/in/"
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
