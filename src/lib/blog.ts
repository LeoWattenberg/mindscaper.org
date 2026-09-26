import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
	return (await getCollection('blog', ({ data }) => !data.draft))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function blogHref(slug?: string) {
	return slug ? `/blog/${slug}/` : '/blog/';
}
