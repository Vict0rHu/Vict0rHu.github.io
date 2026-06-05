# Victor Hu's Portfolio Website

Personal portfolio showcasing projects, research, and professional experience.
Built with **[Astro](https://astro.build/)** — content-driven, statically
generated, ships almost no JavaScript.

## 🌐 Website

**[vict0rhu.github.io](https://vict0rhu.github.io)**

## 🧱 Tech stack

- **Astro** (static site generator) + content collections
- **Bootstrap 5** CSS grid/utilities + Bootstrap Icons
- **Swiper** (project media slider), **GLightbox** (image zoom), **AOS** (scroll animations)
- Design based on the BootstrapMade *iPortfolio* template

## 🚀 Local development

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:4321
npm run build    # build the static site to ./dist
npm run preview  # preview the production build locally
```

## 📁 Project structure

```
src/
├── content.config.ts          # Zod schema for projects (validated at build time)
├── content/projects/*.md       # one markdown file per portfolio project
├── layouts/BaseLayout.astro    # <head>, SEO/OG, shared sidebar + footer
├── components/                 # Sidebar, Footer, ProjectCard
├── lib/site.ts                 # site constants + base-aware URL helper
└── pages/
    ├── index.astro             # About / Skills / Resume / Portfolio
    └── portfolio/[slug].astro  # per-project case-study page (static)
public/assets/                  # images, vendor CSS/JS, main.css, main.js
```

## ➕ Adding a portfolio project

Create a new markdown file in `src/content/projects/`. The filename becomes the
URL slug (`/portfolio/<filename>/`):

```md
---
title: "My Project"
filter: "Projects"            # Projects | Research | Competitions | Coursework
category: "Robotics · Simulation"
date: "2025"
role: "Solo Developer"
order: 1                       # lower shows first
thumbnail: "/assets/img/portfolio/my-project.jpg"
description: "One-line blurb for the grid card."
tech: ["ROS2", "Python"]
links:
  - { label: "GitHub", icon: "bi-github", url: "https://github.com/..." }
highlights:
  - "Quantified outcome #1"
  - "Quantified outcome #2"
media:
  - { type: "image", src: "/assets/img/portfolio/my-project.jpg" }
  - { type: "video", src: "https://www.youtube.com/embed/XXXX" }
---

Rich markdown narrative goes here — this becomes the project overview.
```

The schema is validated on build, so an invalid `filter` (or a missing required
field) fails the build instead of silently breaking the page.

## 🛠 Deployment

GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`, using
`withastro/action`). Pushing to `main` builds and deploys automatically.
The site is served from the user page, so `astro.config.mjs` uses `base: '/'`.

## 📄 License / credits

Design based on the [iPortfolio](https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/)
template by [BootstrapMade](https://bootstrapmade.com/) (free license — footer
credit retained).
