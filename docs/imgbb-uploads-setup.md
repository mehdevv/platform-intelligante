# imgBB uploads (report gallery, sector icons, blog covers)

The admin UI uploads **images** to **imgBB** from the browser, then stores the returned **HTTPS URL** in Supabase (`report_images.image_url`, `sectors.icon_image_url`, `blog_posts.cover_image_url`).

## Setup

1. Create an API key at [imgBB API](https://api.imgbb.com/) (free tier is fine for development).
2. Add to **`.env`** (not committed):

   ```bash
   VITE_IMGBB_API_KEY=your_key_here
   ```

3. Run the SQL migrations that add URL columns and storage (as needed):

   - `supabase/migrations/20260524120000_report_images_sector_icons.sql`
   - `supabase/migrations/20260526120000_blog_posts_cover_sources_storage.sql` (blog cover column + public `blog-sources` bucket for PDFs and other files linked from posts)

4. Restart `npm run dev` / redeploy so Vite picks up the env var.

## Dev server CORS

`vite.config.js` proxies **`/__imgbb/*`** → **`https://api.imgbb.com`** in development so the browser does not hit cross-origin issues. Production builds call **`https://api.imgbb.com/1/upload`** directly; if your host blocks that, add a small server proxy and point uploads there (not implemented in this repo).

## Security

- Treat the imgBB key like any third-party secret: **do not commit it**, rotate it if it was ever exposed, and restrict usage in the imgBB dashboard if available.
- For stricter setups, move uploads to a **backend or Edge Function** and keep the key server-side only.
