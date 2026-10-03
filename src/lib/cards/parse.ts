import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { parseDocument } from 'yaml';
import type { Root, RootContent, PhrasingContent } from 'mdast';
import type { CardDocument, ContentBlock, InlineRun, TextStyle } from './types';

export const MAX_INPUT_BYTES = 1024 * 1024;
const parser = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).use(remarkGfm);

export function validateFile(file: Pick<File, 'name' | 'size'>): void {
    if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('Choose a .md or .markdown file.');
    if (file.size > MAX_INPUT_BYTES) throw new Error('Markdown files must be smaller than 1 MiB.');
}

export function parseMarkdown(source: string, filename = 'Untitled.md', titleOverride = ''): CardDocument {
    if (new TextEncoder().encode(source).length > MAX_INPUT_BYTES) {
        throw new Error('Markdown must be smaller than 1 MiB.');
    }
    if (!source.trim()) throw new Error('The Markdown document is empty.');
    const tree = parser.parse(source) as Root;
    const warnings = new Set<string>();
    const blocks: ContentBlock[] = [];
    const definitions = new Map<string, string>();
    let metadataTitle = '';
    let headingTitle = '';
    let titleHeading: RootContent | undefined;

    for (const node of tree.children) {
        if (node.type === 'definition') definitions.set(node.identifier, node.url);
    }

    function inline(nodes: PhrasingContent[], style: TextStyle = 'body'): InlineRun[] {
        return nodes.flatMap((node): InlineRun[] => {
            if (node.type === 'text') return [{ text: node.value, style }];
            if (node.type === 'break') return [{ text: '\n', style }];
            if (node.type === 'inlineCode') return [{ text: node.value, style: 'code' }];
            if (node.type === 'footnoteReference') return [{ text: `[${node.label || node.identifier}]`, style }];
            if (node.type === 'strong') return inline(node.children, style === 'italic' ? 'boldItalic' : 'bold');
            if (node.type === 'emphasis') return inline(node.children, style === 'bold' ? 'boldItalic' : 'italic');
            if (node.type === 'delete') {
                warnings.add('Strikethrough is rendered as plain text.');
                return inline(node.children, style);
            }
            if (node.type === 'link' || node.type === 'linkReference') {
                const runs = inline(node.children, style);
                const url = node.type === 'link' ? node.url : definitions.get(node.identifier);
                if (url && runs.map((run) => run.text).join('') !== url) runs.push({ text: ` (${url})`, style });
                return runs;
            }
            if (node.type === 'image' || node.type === 'imageReference') {
                warnings.add('Images are not loaded; only their alt text is included.');
                return [{ text: `[Image: ${node.alt || 'no description'}]`, style }];
            }
            if (node.type === 'html') warnings.add('HTML is not rendered. Text inside raw HTML blocks is omitted.');
            return [];
        });
    }

    const first = tree.children[0];
    if (first?.type === 'yaml') {
        try {
            const metadata = parseDocument(first.value, { uniqueKeys: true });
            if (metadata.errors.length) throw metadata.errors[0];
            const data = metadata.toJS({ maxAliasCount: 20 });
            if (typeof data?.title === 'string') metadataTitle = data.title.trim();
        } catch {
            warnings.add('Frontmatter could not be read; using the heading or filename for the title.');
        }
    }
    titleHeading = tree.children.find((node) => node.type === 'heading' && node.depth === 1);
    if (titleHeading?.type === 'heading') headingTitle = inline(titleHeading.children).map((run) => run.text).join('').trim();
    const title = titleOverride.trim() || metadataTitle || headingTitle || filename.replace(/\.(md|markdown)$/i, '') || 'Untitled';
    const useHeadingAsCover = !titleOverride.trim() && !metadataTitle && Boolean(headingTitle);

    function visit(nodes: RootContent[], depth = 0, quoted = false): void {
        for (const node of nodes) {
            if (node === titleHeading && useHeadingAsCover) continue;
            if (node.type === 'paragraph' || node.type === 'heading') {
                blocks.push({ kind: node.type === 'heading' ? 'heading' : quoted ? 'quote' : 'paragraph', runs: inline(node.children), depth });
            } else if (node.type === 'blockquote') {
                visit(node.children, depth, true);
            } else if (node.type === 'footnoteDefinition') {
                blocks.push({ kind: 'heading', runs: [{ text: `Note [${node.label || node.identifier}]`, style: 'heading' }] });
                visit(node.children, depth, quoted);
            } else if (node.type === 'list') {
                node.children.forEach((item, index) => {
                    const prefix = node.ordered ? `${(node.start ?? 1) + index}. ` : '\u2022 ';
                    let firstParagraph = true;
                    for (const child of item.children) {
                        if (child.type === 'paragraph') {
                            const task = item.checked === null || item.checked === undefined ? '' : item.checked ? '[x] ' : '[ ] ';
                            blocks.push({ kind: 'list', runs: inline(child.children), prefix: firstParagraph ? prefix + task : '', depth });
                            firstParagraph = false;
                        } else visit([child], depth + 1, quoted);
                    }
                });
            } else if (node.type === 'code') {
                blocks.push({ kind: 'code', runs: [{ text: node.value, style: 'code' }], depth });
            } else if (node.type === 'thematicBreak') {
                blocks.push({ kind: 'rule', runs: [] });
            } else if (node.type === 'table') {
                warnings.add('Tables are rendered as plain-text rows.');
                for (const row of node.children) {
                    blocks.push({ kind: 'paragraph', runs: row.children.flatMap((cell, index) => [...(index ? [{ text: ' | ', style: 'body' as const }] : []), ...inline(cell.children)]) });
                }
            } else if (node.type === 'html') {
                warnings.add('HTML is not rendered. Text inside raw HTML blocks is omitted.');
            }
        }
    }
    visit(tree.children);
    if (/[^\x00-\x7f\p{Script=Latin}\p{Number}\p{Punctuation}\p{Separator}\p{Mark}\s]/u.test(title + blocks.flatMap((block) => block.runs.map((run) => run.text)).join(''))) {
        warnings.add('Some characters may use fallback fonts. Check the preview before exporting.');
    }
    return { title, blocks, warnings: [...warnings] };
}