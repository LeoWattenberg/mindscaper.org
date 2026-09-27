# Mindscaper.org

The English-language website for Mindscaper, a nonprofit association and open source project. It introduces Mindscaper and its first tools, [Soundscaper](https://soundscaper.org) and [Framescaper](https://framescaper.org).

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

## Pages

The website is currently English-only. Its main pages are `/`, `/about/`, `/join/`, `/blog/`, and `/legal/`. The bylaws are at `/bylaws/`. The Soundscaper commit graph is at `/soundscaper-commit-graph/`.

## Visual assets

The product screenshots in `public/screenshots/` are real captures from the Soundscaper project. Jost and Lora are served locally from `public/fonts/`; their OFL license files are included there.

## Blog posts

The blog index is at `/blog/`. Copy `src/content/blog/_template.md` to `src/content/blog/your-post-slug.md`, then fill in the title, description, date, and Markdown body. The filename becomes the post URL. Set `draft: false` when the post is ready; drafts do not appear in the index or the built site. Posts are shown newest first.

## Deployment

Pushes to `main` are built and deployed through the workflow in `.github/workflows/deploy.yml`. The custom domain is configured as `mindscaper.org` through `public/CNAME` and `astro.config.mjs`.

The hourly `.github/workflows/generate-commit-graph.yml` workflow fetches Soundscaper commits and line counts from GitHub. It publishes `public/data/soundscaper-commits.json` as a single commit on the disposable `generated` branch. Deploys restore that snapshot before building, and a successful generation run triggers a new deploy. The initial snapshot in `scripts/soundscaper-commits-seed.json` keeps the page usable before the generated branch exists. Locally, `npm run dev` and `npm run build` copy the seed when no snapshot is present; run `npm run sync:commit-graph` to fetch the latest one. Set `GITHUB_TOKEN` when running `npm run graph:soundscaper-commits` to avoid GitHub's anonymous API limit.

In the GitHub repository settings, select **GitHub Actions** as the Pages source and enable **Enforce HTTPS** after the certificate has been provisioned.

## Privacy

The site is static and contains no analytics, advertising, embeds, forms, cookies, or local storage.
