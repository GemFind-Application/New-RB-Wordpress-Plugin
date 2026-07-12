# Going live – Ring Builder (Vite/React)

## 1. Build the app

From the **RB-Version2-React-Code-latest-code** folder:

```bash
cd RB-Version2-React-Code-latest-code
npm install
npm run build
```

- Output goes to the **`build/`** folder (see `vite.config.mjs`: `outDir: "build"`).
- For production, use a **production** `.env`: set API URLs and paths to your live API/shop (e.g. replace dev/ringbuilderdev with your live paths).

---

## 2. Deploy the `build/` folder

Choose one of these.

### Option A: Laravel / existing server

If the app is served from Laravel or your own server:

1. Copy the **contents** of `build/` to the folder your server uses for the Ring Builder app (e.g. `public/frontpublic/build/` or whatever your Laravel routes point to).
2. Ensure the server is configured to serve `index.html` for the app’s routes (SPA fallback).
3. Restart or reload the server if needed.

### Option B: Static hosting (Netlify, Vercel, etc.)

1. Connect your repo (or use “Deploy from folder”).
2. Set **build command**: `npm run build`
3. Set **publish/output directory**: `build`
4. Set **root directory** to: `RB-Version2-React-Code-latest-code` (if the repo root is the repo root).
5. Add **environment variables** from `.env` (e.g. `VITE_APP_API_URL`, `VITE_IMAGE_URL`, etc.) in the host’s dashboard.
6. If the app uses client-side routing, add a redirect/rewrite so all routes serve `index.html` (SPA mode).

### Option C: Upload to your web server (FTP/cPanel, etc.)

1. Upload everything inside **`build/`** to the directory that will be the document root for the Ring Builder app (e.g. `public_html/apps/ringbuilder` or similar).
2. Point the domain or subpath to that folder.
3. Configure the server so requests to the app’s paths return `index.html` (SPA fallback).

---

## 3. Environment variables for production

Before building for production, set in `.env` (or in your host’s env):

- `VITE_APP_API_URL` – live Ring Builder API URL  
- `VITE_APP_API_VIDEOURL` – live video API URL  
- `VITE_IMAGE_URL` – live CDN/base URL for images  
- `VITE_ADD_TO_CART`, `VITE_APP_FORM_API_URL` – live cart/shop URLs  
- `VITE_SHOP_EXTENSION` / `VITE_RING_URL_EXT` – live app path (e.g. `/apps/ringbuilder` instead of `/apps/ringbuilderdev`)

Then run `npm run build` again so Vite bakes these into the build.

---

## 4. Quick checklist

- [ ] `.env` (or host env) set to **production** API and URLs  
- [ ] `npm run build` runs without errors  
- [ ] Contents of **`build/`** deployed to the correct folder or host  
- [ ] SPA fallback: all app routes serve `index.html`  
- [ ] Test on live URL: settings, video, metal type, diamond shape, add to cart  

After that, the app is “live” at the URL you configured.
