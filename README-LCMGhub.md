# 3E IPEDS Insights (GitHub Pages snapshot)

Static snapshot of the **IPEDS Insights** Domo custom design from `3enrollment/eee_client_insights` → `IPEDS_Insights/`.

## Live site

After push: **https://lancecmaben.github.io/ipeds-insights-demo/**

This app requires the Domo SDK and mapped datasets at runtime. GitHub Pages hosts the **assets** for portfolio preview; full behavior is validated on Domo Dev/Prod.

## Publish flow

1. Push to this repo (`main`).
2. Run **Deploy demo to GitHub Pages** (Actions) or wait for the push workflow.
3. **Settings → Pages**: branch **`gh-pages`**, folder **/ (root)**.

## Domo publish (team)

From the source monorepo folder: `npx --yes ryuu -m manifest.dev.json publish` (Dev) or `manifest.json` (Prod). See team `PROCESS.md`.