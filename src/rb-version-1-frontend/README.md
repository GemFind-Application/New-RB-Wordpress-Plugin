# Ring Builder v1 (classic storefront)

Pre-built v1 bundles ship in `public/static/` for WordPress installs.

## Build from plugin root

```bash
npm run build:v1
```

This verifies `public/static/js/frontend-v1.js` exists and runs `scripts/patch-v1-wp-paths.js` (`/apps/ringbuilder` → `/ringbuilder`).

## Rebuild from CRA source

When developing v1 from source (Create React App), place the project here and point the build output to:

- `public/static/js/frontend-v1.js`
- `public/static/css/frontend-v1.css`

Reference CRA source: `Ring-builder-CI-to-Laravel-main/frontend-version-1/`

Then run `npm run build:v1` from the plugin root.

See `developer.md` for full build documentation.
