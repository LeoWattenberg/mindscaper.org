export type Locale = 'en' | 'de';

export interface SiteCopy {
	meta: {
		title: string;
		description: string;
	};
	nav: {
		mission: string;
		projects: string;
		join: string;
		blog: string;
		ariaLabel: string;
	};
	language: {
		label: string;
		short: string;
		href: string;
	};
	hero: {
		eyebrow: string;
		titleStart: string;
		titleAccent: string;
		intro: string;
		primaryCta: string;
		secondaryCta: string;
		artLabel: string;
		artCaption: string;
	};
	mission: {
		eyebrow: string;
		title: string;
		body: string;
		principles: Array<{
			number: string;
			title: string;
			body: string;
		}>;
	};
	projects: {
		eyebrow: string;
		title: string;
		intro: string;
		visitLabel: string;
		items: Array<{
			name: string;
			kind: string;
			description: string;
			href: string;
			visualLabel: string;
		}>;
	};
	join: {
		eyebrow: string;
		title: string;
		body: string;
		roles: string[];
		cta: string;
		aside: string;
	};
	footer: {
		tagline: string;
		status: string;
		projects: string;
		connect: string;
		legal: string;
		legalHref: string;
		github: string;
		source: string;
	};
}

export const siteCopy: Record<Locale, SiteCopy> = {
	en: {
		meta: {
			title: 'Mindscaper — Open tools for creative minds',
			description:
				'Mindscaper is a nonprofit initiative in formation building open, local-first tools for audio and video creation.',
		},
		nav: {
			mission: 'Mission',
			projects: 'Projects',
			join: 'Join us',
			blog: 'Blog',
			ariaLabel: 'Main navigation',
		},
		language: {
			label: 'Deutsch',
			short: 'DE',
			href: '/de/',
		},
		hero: {
			eyebrow: 'Nonprofit initiative in formation',
			titleStart: 'Creative freedom needs',
			titleAccent: 'open tools.',
			intro:
				'We are building a new generation of professional creative software: open to everyone, respectful of your work, and shaped by the people who use it.',
			primaryCta: 'Join us on GitHub',
			secondaryCta: 'Explore our projects',
			artLabel: 'An abstract composition of audio waves and video frames',
			artCaption: 'Sound, image, and ideas — on your terms.',
		},
		mission: {
			eyebrow: 'Why Mindscaper',
			title: 'Creative tools should serve the people who create.',
			body:
				'Mindscaper is becoming a nonprofit home for ambitious creative software. We believe professional tools can be powerful without locking people in, harvesting their work, or putting essential expression behind closed doors.',
			principles: [
				{
					number: '01',
					title: 'Open by design',
					body: 'Our tools are open source, so their future can be inspected, discussed, and built together.',
				},
				{
					number: '02',
					title: 'Your work stays yours',
					body: 'Local-first workflows keep projects close, with no account required to start creating.',
				},
				{
					number: '03',
					title: 'Made for real work',
					body: 'Accessible does not mean basic. We are building capable tools for serious creative practice.',
				},
			],
		},
		projects: {
			eyebrow: 'Our first projects',
			title: 'One creative ecosystem, starting with sound and motion.',
			intro:
				'Each project focuses on its craft while sharing the same belief: your tools should help ideas move, not stand in their way.',
			visitLabel: 'Visit',
			items: [
				{
					name: 'Soundscaper',
					kind: 'Audio creation',
					description:
						'A local-first audio editor for recording, arranging, processing, and finishing sound in the browser.',
					href: 'https://soundscaper.org',
					visualLabel: 'Stylized multitrack audio waveform',
				},
				{
					name: 'Framescaper',
					kind: 'Video creation',
					description:
						'A focused video workspace for shaping moving images, effects, and compositions with an open workflow.',
					href: 'https://framescaper.org',
					visualLabel: 'Stylized sequence of video frames',
				},
			],
		},
		join: {
			eyebrow: 'Help shape what comes next',
			title: 'A creative suite should be made with its community.',
			body:
				'Mindscaper is early, and that is exactly when your perspective matters most. Join the conversation, test the tools, or contribute the skills you care about.',
			roles: ['Development', 'Design', 'Documentation', 'Translation'],
			cta: 'See how to join',
			aside: 'Open source. Local first. Built in public.',
		},
		footer: {
			tagline: 'Open tools for creative minds.',
			status: 'A nonprofit initiative in formation.',
			projects: 'Projects',
			connect: 'Connect',
			legal: 'Legal & privacy',
			legalHref: '/legal/',
			github: 'GitHub',
			source: 'Website source',
		},
	},
	de: {
		meta: {
			title: 'Mindscaper — Offene Werkzeuge für kreative Köpfe',
			description:
				'Mindscaper ist eine gemeinnützige Initiative in Gründung und entwickelt offene, lokale Werkzeuge für Audio- und Videoproduktion.',
		},
		nav: {
			mission: 'Mission',
			projects: 'Projekte',
			join: 'Mitmachen',
			blog: 'Blog',
			ariaLabel: 'Hauptnavigation',
		},
		language: {
			label: 'English',
			short: 'EN',
			href: '/',
		},
		hero: {
			eyebrow: 'Gemeinnützige Initiative in Gründung',
			titleStart: 'Kreative Freiheit braucht',
			titleAccent: 'offene Werkzeuge.',
			intro:
				'Wir entwickeln eine neue Generation professioneller Kreativsoftware: offen für alle, respektvoll gegenüber deiner Arbeit und gemeinsam mit den Menschen gestaltet, die sie nutzen.',
			primaryCta: 'Auf GitHub mitmachen',
			secondaryCta: 'Unsere Projekte entdecken',
			artLabel: 'Eine abstrakte Komposition aus Audiowellen und Videobildern',
			artCaption: 'Klang, Bild und Ideen — zu deinen Bedingungen.',
		},
		mission: {
			eyebrow: 'Warum Mindscaper',
			title: 'Kreativwerkzeuge sollten den Menschen dienen, die mit ihnen gestalten.',
			body:
				'Mindscaper wird ein gemeinnütziges Zuhause für ambitionierte Kreativsoftware. Wir glauben, dass professionelle Werkzeuge leistungsfähig sein können, ohne Menschen einzusperren, ihre Arbeit auszuwerten oder wichtigen Ausdruck hinter verschlossene Türen zu stellen.',
			principles: [
				{
					number: '01',
					title: 'Von Grund auf offen',
					body: 'Unsere Werkzeuge sind Open Source. So kann ihre Zukunft geprüft, diskutiert und gemeinsam gestaltet werden.',
				},
				{
					number: '02',
					title: 'Deine Arbeit bleibt deine',
					body: 'Lokale Arbeitsabläufe halten Projekte nah bei dir — und zum Loslegen brauchst du kein Konto.',
				},
				{
					number: '03',
					title: 'Für echte Arbeit gemacht',
					body: 'Zugänglich heißt nicht simpel. Wir bauen leistungsfähige Werkzeuge für ernsthafte kreative Arbeit.',
				},
			],
		},
		projects: {
			eyebrow: 'Unsere ersten Projekte',
			title: 'Ein kreatives Ökosystem — beginnend mit Klang und Bewegung.',
			intro:
				'Jedes Projekt konzentriert sich auf sein Handwerk und folgt derselben Überzeugung: Werkzeuge sollten Ideen in Bewegung bringen, statt ihnen im Weg zu stehen.',
			visitLabel: 'Öffnen',
			items: [
				{
					name: 'Soundscaper',
					kind: 'Audioproduktion',
					description:
						'Ein lokaler Audioeditor zum Aufnehmen, Arrangieren, Bearbeiten und Fertigstellen von Klang direkt im Browser.',
					href: 'https://soundscaper.org',
					visualLabel: 'Stilisierte mehrspurige Audiowellenform',
				},
				{
					name: 'Framescaper',
					kind: 'Videoproduktion',
					description:
						'Ein fokussierter Video-Arbeitsbereich für bewegte Bilder, Effekte und Kompositionen mit offenem Workflow.',
					href: 'https://framescaper.org',
					visualLabel: 'Stilisierte Abfolge von Videobildern',
				},
			],
		},
		join: {
			eyebrow: 'Gestalte mit, was als Nächstes kommt',
			title: 'Eine Kreativsuite sollte gemeinsam mit ihrer Community entstehen.',
			body:
				'Mindscaper steht am Anfang — und genau jetzt zählt deine Perspektive am meisten. Diskutiere mit, teste die Werkzeuge oder bringe die Fähigkeiten ein, die dir wichtig sind.',
			roles: ['Entwicklung', 'Design', 'Dokumentation', 'Übersetzung'],
			cta: 'So kannst du mitmachen',
			aside: 'Open Source. Lokal gedacht. Öffentlich entwickelt.',
		},
		footer: {
			tagline: 'Offene Werkzeuge für kreative Köpfe.',
			status: 'Eine gemeinnützige Initiative in Gründung.',
			projects: 'Projekte',
			connect: 'Kontakt',
			legal: 'Impressum & Datenschutz',
			legalHref: '/de/impressum/',
			github: 'GitHub',
			source: 'Website-Quellcode',
		},
	},
};
