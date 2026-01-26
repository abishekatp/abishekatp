import { error } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        const post = await import(`../../../../posts/${params.category}/${params.year}/${params.slug}.md`);

        return {
            content: post.default,
            meta: post.metadata
        };
    } catch (e) {
        throw error(404, 'Post not found');
    }
}
