# Mindscaper.org

The multilingual public website for Mindscaper, a nonprofit creative-software initiative in formation. The site introduces Mindscaper's mission and its first projects, [Soundscaper](https://soundscaper.org) and [Framescaper](https://framescaper.org).

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev -- --background
```

Manage the background development server with:

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

Build the static site with:

```sh
npm run build
```

The generated files are written to `dist/`.

## Languages

English is served at `/` and German at `/de/`. Translations are kept in a typed content dictionary in `src/i18n/content.ts`; no i18n plugin or client-side locale detection is used.

Equivalent legal and privacy pages are available at `/legal/` and `/de/impressum/`.

## Deployment

Pushes to `main` are built and deployed through the workflow in `.github/workflows/deploy.yml`. The custom domain is configured as `mindscaper.org` through `public/CNAME` and `astro.config.mjs`.

In the GitHub repository settings, select **GitHub Actions** as the Pages source and enable **Enforce HTTPS** after the certificate has been provisioned.

## Privacy

The site is fully static. It contains no analytics, advertising, embeds, forms, cookies, local storage, or external font requests.
