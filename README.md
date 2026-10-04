# DSA OS
npm install && npm run dev
Data: src/data/questions.ts (format 'leetcode-slug:E|M|H'; add gfg / codingNinjas URLs there). Persistence: src/services/storage.ts only.

## Merging more sheets
node scripts/merge-sheet.mjs love-babbar.csv "Love Babbar"   # columns: title,topic,subtopic,difficulty,leetcode,gfg,codingNinjas
Duplicates are matched by problem link (then title) and get the extra sheet tag instead of a second copy.
Data note: bank.json was derived from the public dsa-rip repo (no licence file), which mirrors the TakeUForward A2Z sheet. Keep this project personal.

## Free hosting (GitHub Pages)
1. Create a PUBLIC repo on GitHub (free Pages needs public), e.g. `dsa-os`.
2. In this folder: `git init && git add . && git commit -m "init" && git branch -M main && git remote add origin https://github.com/<you>/dsa-os.git && git push -u origin main`
3. Repo > Settings > Pages > Source: **GitHub Actions**. Each push to `main` redeploys. Site: `https://<you>.github.io/dsa-os/`
Alternatives that allow a private repo for free: Cloudflare Pages / Netlify / Vercel (build: `npm run build`, output: `dist`).
Progress lives in each browser's localStorage: use Settings > Export/Import to move between devices.

## Cloud sync (Supabase, free)
1. supabase.com > New project (free). SQL Editor > run `supabase/schema.sql`.
2. Authentication > Providers > Email: turn OFF "Confirm email" (simplest for personal use).
3. Project Settings > API: copy Project URL + anon/publishable key.
4. Local: copy `.env.example` to `.env`, fill both. GitHub: repo Settings > Secrets and variables > Actions > add secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (used by deploy and keep-alive workflows), then re-run the deploy.
5. In the app: Settings > Cloud sync > Sign up. Sign in on any device; the newest save wins. Local storage remains an offline cache.
