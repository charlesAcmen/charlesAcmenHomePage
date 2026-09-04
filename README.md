# CharlesAcmen

A bilingual, scroll-driven portfolio for CharlesAcmen. It is a static Next-compatible Vinext site: no database, user accounts, runtime APIs, or proprietary visual assets are required.

## Local development

```powershell
npm install
npm run dev
```

## Cloudflare Pages deployment

1. Create a new Cloudflare Pages project and connect the repository that contains this folder.
2. Set **Build command** to `npm run build` and **Build output directory** to `dist/client`.
3. Deploy the `main` branch. Cloudflare will assign a `pages.dev` address; bind a custom domain later when desired.

The build uses static export. Any future database, authentication, SSR, or server-side form handling should move to a Cloudflare Workers/Vinext deployment rather than being added to Pages ad hoc.

## Content maintenance

All public copy, projects, links, and benchmark qualifiers live in `app/site-data.ts`. Keep performance numbers tied to a stated test environment, and keep third-party game brands, assets, and logos out of the visual system.
