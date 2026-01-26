import { getPosts } from '$lib/server/posts';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { category } = params;
    const allPosts = await getPosts(category);

    if (allPosts.length === 0) {
        // Optional: Check if the category is valid even if no posts exist
        // For now, we return empty list, but in a real app we might 404 if category is invalid
    }

    return {
        posts: allPosts,
        category
    };
}
