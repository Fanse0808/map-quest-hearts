# Map Quest Hearts

A mobile-first quiz adventure game with:
- User accounts and per-user progress
- Heart system (start at 3, max at 5)
- Admin studio for editing map, characters, levels, and answers
- Asset uploads for map and characters
- Analytics dashboard for admins

## Local Run

```bash
ruby server.rb
```

Open `http://127.0.0.1:4567`.

Default admin credentials:
- username: `admin`
- password: `admin123`

## Deploy Online (Render)

This repo includes `render.yaml` and `Procfile`.

1. Push this project to GitHub.
2. In Render, create a **Blueprint** from your repo.
3. Render will provision:
   - Web service (`bundle exec ruby server.rb`)
   - Persistent disk at `/var/data`
4. After first deploy, check env vars:
   - `DB_PATH=/var/data/app.db`
   - `UPLOAD_DIR=/var/data/uploads`
   - `DEFAULT_ADMIN_PASSWORD` (auto-generated in `render.yaml`; set your own)

### Git commands before Render deploy

```bash
git add .
git commit -m "Deploy-ready mobile Map Quest app"
git push origin main
```

## Docker Deploy (Any VPS/Provider)

```bash
docker build -t map-quest-hearts .
docker run -d -p 10000:10000 -v mapquest-data:/data --name mapquest map-quest-hearts
```

## Mobile Notes

- Optimized responsive layout for small screens
- Tap-friendly controls and larger action targets
- PWA metadata (`manifest.webmanifest`) for add-to-home-screen support
