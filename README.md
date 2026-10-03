# About Me

I am a Software Development Engineer with a passion for Rust, Golang, and building efficient systems. I strive to apply my knowledge to advance science and technology for the betterment of society.

## About Myself

I am a dedicated Software Development Engineer with a strong passion for systems programming and web technologies. My journey involves deep dives into Rust, Golang, and building efficient, scalable systems. I believe in using technology as a tool to advance science and improve lives.

Beyond code, I am driven by philosophical inquiry—constantly asking "why" and seeking truth in both logic and life. I enjoy contributing to open source, exploring new languages, and refining my craft.

## Technical Skills

### Programming Languages
- Golang, Rust, TypeScript, C, Python, Java

### Web & Systems
- SvelteJS, Dioxus, React, PostgreSQL, HTML/CSS, Embdedded (Arduino/8051)

## Cards

The Cards tab opens a standalone Markdown-to-Instagram-card tool. Choose a `.md`
or `.markdown` file, edit the title or source if needed, generate a preview, and
download numbered 1080 x 1350 PNGs in a ZIP. Input is processed in your browser;
it is never uploaded, saved to browser storage, or read from this site's posts.

The first template is **Editorial**, with a dark graphite background, white text,
a soft mint accent, and Source Sans 3 typography. Exported slides have no printed
page numbers or footer decoration; slide navigation stays in the workspace. Fonts are
bundled locally. Templates, parsing, measured pagination, rendering, and export
live separately in `src/lib/cards` so more templates can be added later.

Supported content includes headings, paragraphs, emphasis, links, nested lists,
quotes, inline code, fenced code, and optional YAML title frontmatter. Full text
is paginated, not summarized. Images become alt-text placeholders, tables become
plain-text rows, and raw HTML is not rendered; text inside raw HTML blocks is
omitted. These fallbacks produce visible warnings. Characters outside the bundled
Latin fonts may use browser fallback fonts; check their appearance in the preview.

Limits: 1 MiB per input and 60 generated cards, including covers. Oversized titles
and blocks continue onto additional cards. Exceeding the limit produces an error,
not truncated output. The tool does not publish to Instagram or enforce its
changing carousel upload limits. Source/title edits require regeneration before
export. Resetting or leaving the page discards the document.

### Development and Verification

```sh
pnpm install
pnpm run dev
pnpm test
pnpm run check
pnpm exec playwright install chromium firefox webkit
pnpm run test:browser
pnpm run build
TEST_PREVIEW=1 pnpm run test:browser
```

The default route is `/abishekatp/cards/`. Set `BASE_PATH=''` when building and
previewing a root deployment. The static build emits `docs/`; do not edit generated
deployment files by hand. Browser tests verify uploads, mobile layout, real font
bounds, local-only processing, error recovery, and ZIP/PNG output.
