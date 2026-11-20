# Victor Hu’s Portfolio

[Live site](https://vict0rhu.github.io/) for Victor Hu, who publishes research as Jyun-Chi Hu. The site is built with Astro. The interactive Lab uses Three.js.

## Local development

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Open the URL printed by the dev or preview server. Check the homepage, a project page, and `/lab/` before deploying. Lab playtest controls are available in development and at `/lab/?playtest=1`.

## Content and layout

- `src/pages/index.astro` contains the homepage, selected work, and the project archive.
- `src/content/projects/` holds project pages. A Markdown file named `<slug>.md` is served at `/portfolio/<slug>/`. The schema in `src/content.config.ts` validates titles, thumbnails, media, and links.
- `src/lib/site.ts` holds site identity, profile links, and recent updates. Update the name mapping there if the public byline changes.
- `src/layouts/BaseLayout.astro` and `src/styles/site.css` contain the portfolio layout and styles.
- `src/lab/` contains the 3D scenes, controls, and Lab content. Its page is `src/pages/lab.astro`.
- `public/assets/` contains images and project media. Keep existing project slugs stable so inbound links keep working.

## Interactive Lab

Visitors can explore Victor’s room, the office, and the mountain overlook. Posters and the thought world lead to CONTACT research, optical inspection, egocentric teleoperation, and UNR exchange memories. The room also has an awards display with links to the corresponding work.

- `src/lab/content.ts` defines the schedule, destinations, and interactions.
- `src/lab/poster-wall-content.ts` defines poster positions and memory routes, including reserved slots for future memories.
- `src/lab/awards-content.ts` defines the display order and project links. Award descriptions come from the project files’ `labAward` metadata.
- `src/lab/unr-content.ts` holds the exchange memory’s scene content. Its scene construction, atmosphere, and characters live in the other `unr-*.ts` files.
- `src/lab/collection-view.ts` and `collection-keys.ts` share camera transitions and keyboard handling between the poster and awards displays.

## Deployment and search

GitHub Actions builds and deploys to GitHub Pages on pushes to `main`. The workflow can also be run manually. The production URL is set in `astro.config.mjs`.

The build generates `/sitemap-index.xml`, also referenced in `/robots.txt`. After deploying changes to the homepage identity, use Google Search Console to check the live canonical URL and submit the sitemap if needed.

## Third-party notices

The Lab uses Three.js under the MIT License. The notice is included in [public/assets/lab/three-license.txt](public/assets/lab/three-license.txt).
