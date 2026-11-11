# UI component setup

This repository currently uses React with JavaScript and plain CSS. Shared application components live in `components/`, global styles live in `app/` and are imported by `app/layout.js`. It has no Tailwind, TypeScript configuration, import aliases, or shadcn `components.json`.

The expanding image gallery is adapted to the existing setup in `components/ui/image-gallery.js` with scoped styles in `components/ui/image-gallery.module.css`. Its project-specific data and full-screen dialog remain in `components/ProjectGallery.js`. It requires no additional dependencies. The sample's unused `cn` import, global font override, stock photos, and demo heading are omitted.

`components/ui/` gives reusable UI primitives a predictable location, matching the common shadcn convention and separating them from project-specific components. The folder itself does not require shadcn or Tailwind to work.

## Optional TypeScript, Tailwind, and shadcn setup

These steps are documentation for a future migration; they are not required to run this gallery.

1. Install TypeScript support:

   ```sh
   npm install --save-dev typescript @types/react @types/react-dom @types/node
   ```

   Rename the component to `.tsx`, add types for its props and event handlers, and run `npm run dev` to let Next.js generate the initial `tsconfig.json`. Keep `allowJs: true` for the existing JavaScript files. Add `compilerOptions.paths` with `"@/*": ["./*"]` to resolve imports from the repository root.

2. Install Tailwind's PostCSS integration:

   ```sh
   npm install tailwindcss @tailwindcss/postcss postcss
   ```

   Create `postcss.config.mjs`:

   ```js
   export default { plugins: { '@tailwindcss/postcss': {} } };
   ```

   Add `@import "tailwindcss";` at the top of `app/globals.css`. Review Tailwind's base reset against the existing site styling before adopting it throughout the site. See the [official Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs).

3. Initialize shadcn in this existing project:

   ```sh
   npx shadcn@latest init
   ```

   Use `app/globals.css` as the CSS entry and `@/components/ui` as the UI alias. Review the generated theme changes against the existing Hauszy variables. See the [official shadcn Next.js installation guide](https://ui.shadcn.com/docs/installation/next).

## Container scroll animation

`components/ui/container-scroll-animation.js` and its CSS module adapt the supplied scroll animation to JavaScript and scoped CSS. It uses the already installed `motion/react` API, so a second `framer-motion` dependency is unnecessary. The project photo section is its integration point. Reduced motion disables the tilt, scaling, and header translation. Mobile uses a smaller scale range to keep photos readable. Scroll progress finishes at the section center, without the demo's large empty spacers.

## Unit layout deck

`components/ui/scroll-stacking-cards.js` adapts Aakash Mehra's supplied Project Deck to the existing unit layout cards. It uses the installed `motion` package; `lucide-react` is also already installed. The matching CSS module replaces the sample Tailwind utilities. Desktop cards rise, tilt, sharpen, and stack with a single spring-smoothed scroll value. Small screens and reduced motion use an ordinary list. On desktop, tall cards scale to fit the available viewport instead of disabling the deck.

## Finer Details split roll

`components/ProjectDetailsCards.js` owns the pinned specification sequence. A single spring-smoothed Motion scroll value drives both text columns in opposite directions. Only the active index changes React state; per-frame transforms update outside React. The glass shell, transparent columns, button, and inset scrolling dialog have one consolidated stylesheet: `components/ui/split-detail-roll.module.css`.

The abandoned warp carousel, old Fancy stacking cards, detail previews, and their unused page effects have been removed. The current unit deck is `components/ui/scroll-stacking-cards.js`. Shared project button feedback is explicitly scoped out of the gallery panels and View all button to avoid transform and transition conflicts.
