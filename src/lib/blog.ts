import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/content';

export async function getPublishedPosts(locale: Locale) {
	return (await getCollection('blog', ({ data }) => data.language === locale && !data.draft))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function blogHref(locale: Locale, slug?: string) {
	const base = locale === 'de' ? '/de/blog/' : '/blog/';
	return slug ? `${base}${slug}/` : base;
}
