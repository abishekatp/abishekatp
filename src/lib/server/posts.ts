import type { Post } from '$lib/types';

export async function getPosts(category?: string) {
    const paths = import.meta.glob('/src/posts/**/*.md', { eager: true });

    let posts: Post[] = [];

    for (const path in paths) {
        const file = paths[path];
        // expected path: /src/posts/[category]/[year]/[slug].md
        const pathParts = path.split('/');
        const slug = pathParts[pathParts.length - 1].replace('.md', '');
        const year = pathParts[pathParts.length - 2];
        const cat = pathParts[pathParts.length - 3];

        if (file && typeof file === 'object' && 'metadata' in file && slug) {
            const metadata = file.metadata as Omit<Post, 'slug' | 'content'>;
            const post: Post = {
                ...metadata,
                slug,
                year,
                category: cat,
                content: undefined // explicitly no content
            };
            posts.push(post);
        }
    }

    posts = posts.sort((first, second) => {
        return new Date(second.date).getTime() - new Date(first.date).getTime();
    });

    if (category) {
        posts = posts.filter(post => post.category === category);
    }

    return posts;
}
