import { getPosts } from '$lib/server/posts';

export async function load() {
    const posts = await getPosts();
    return {
        posts: posts.slice(0, 5) // Get latest 5 posts
    };
}
