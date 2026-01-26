export interface Post {
    slug: string;
    title: string;
    date: string;
    year: string;
    category: string;
    description: string;
    content?: any; // mdsvex render output
    readingTime?: string;
}
