# Safwan Piliang Portfolio V3

Personal portfolio of Safwan Piliang: UI/UX, brand and 3D design. Designed in Figma Make, single page built with React 19, Vite, Tailwind CSS v4 and Motion.

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run preview  # serve the production build
npm run format   # oxfmt
```

## Structure

- `src/data/content.ts`: all copy, links and images (projects, articles, services, socials, CV link). Add or edit content here.
- `src/components/sections/`: page sections in order (Navbar, Hero, Logos, Services, Projects, Insights, About, Footer).
- `src/components/cards/`, `src/components/ui/`: reusable cards and primitives.
- `src/index.css`: Tailwind v4 theme tokens (colors, fonts, marquee animation).
- `public/images/`: `projects/`, `articles/`, `about/`, `logos/`, `icons/`, `hero/`, plus `logo.svg`.
