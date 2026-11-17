# 3E IPEDS Insights (GitHub Pages snapshot)

Static snapshot of the **IPEDS Insights** Domo custom design from `3enrollment/eee_client_insights` → `IPEDS_Insights/`.

## Live site

After push: **https://lancecmaben.github.io/ipeds-insights-demo/**

**Demo mode:** `pages-demo-bootstrap.js` + synthetic tables power the dashboard on GitHub Pages without Domo. Domo Dev/Prod builds are unchanged in the team monorepo.

## Publish flow

1. Push to this repo (`main`).
2. Run **Deploy demo to GitHub Pages** (Actions) or wait for the push workflow.
3. **Settings → Pages**: branch **`gh-pages`**, folder **/ (root)**.

## Domo publish (team)

From the source monorepo folder: `npx --yes ryuu -m manifest.dev.json publish` (Dev) or `manifest.json` (Prod). See team `PROCESS.md`.