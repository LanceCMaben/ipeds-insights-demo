# 3E IPEDS Insights

Client refresh of the legacy App Studio app **3E IPEDS Insights**. Visual system follows Conversion Apply (`DEV_3Ei Conversion Apply`): Spotlight / Midnight, Archivo titles, gold accent, shared footer.

## Current Admissions filters (UI)

- **Left column:** Institution Selection (`INSTNM`), Survey year (`SURVEY_YEAR`).
- **Right grid (comparison):** Conference, Region, Institutional Control, Comparison institutions, State, Selectivity.
- **Apply** runs queries; **Reset** clears comparison filters, restores default institution/year, and clears **FROM STATE**.
- **Partition** is not shown on Admissions (legacy partition removed from this layout).

Advancement still uses the header filter row (survey year, institution, and comparison filters) until the Advancement layout is finalized.

## Comparison group (peers)

When you **Apply** without choosing comparison filters, the card builds a **default peer group** from the selected institution’s latest row:

1. **Conference** — only if the value is groupable (not null, blank, `Not applicable`, `N/A`, etc.).
2. Otherwise **state (`STABBR_VALUE`) and control (`CONTROL_VALUE`)** together.
3. If only one of state or control is groupable, that dimension alone is used **only when** the peer count for the survey year is **under 1,000** institutions.
4. If no usable predicate remains, comparison charts show an empty state: choose comparison filters and **Apply**.

The selected institution is always excluded. Comparison chart subtitles show plain language, e.g. `Peers: North Carolina, Private not-for-profit, 49 institutions (default)`. A note appears when the default group has **more than 1,000** institutions.

The same rules apply to **migration** residence comparison via `peerWhereMigration` / default resolution on the migration view columns.

When you **do** set comparison filters, subtitles describe your filters and include the distinct institution count for the survey year.

## Peer metrics (comparison trends)

Subtitle on comparison charts: **Peer group aggregate**. Open **Details** on a comparison chart for full methodology.

| Metric | Aggregation |
|--------|-------------|
| Applications, admissions, enrollment | **Average** per peer institution |
| Admit rate, yield, endowment / FTE | **Ratio of sums** (pair-filtered; both sides non-null on a row) |
| Discount rate, Pell share | **Enrollment-weighted** mean (approximation; reporting counts shown in tooltip/Details) |
| Tuition, NTR, endowment, giving, FTE, opex | **Average** per peer institution |

Rate columns are scaled to match the selected institution (0–1 vs 0–100) before charting.

## FROM STATE (migration)

**FROM STATE** options come from migration origin labels (`EFCSTATE_LABEL`, else `EFCSTATE_TITLE`), not IPEDS comparison states. Empty migration rows show **No migration data for this state.**

## Error banners

| Source | Banner prefix |
|--------|----------------|
| Comparison aggregate SQL | `Comparison data:` |
| Top 10 comparison SQL | `Top 10 comparison:` |
| Migration wave / residence | `Migration data:` |
| Out-of-state origin query | `Out-of-state data:` |
| Background lookup | `Comparison menus may be incomplete.` |

## Legacy audit (reference)

| Admissions | Admissions metrics, admit and yield, top comparison institutions by applications, discount and net tuition revenue, published tuition, Pell, state of residence, out-of-state schools and destination states. Link to MarketIQ. |
| Advancement | Endowment, private giving, FTE, endowment per FTE, operating expenses and philanthropic contribution. Link to fundraising contact. |
| FAQ | Short FAQ and glossary. |

Survey year drives residence, rankings, and out-of-state views. Trend charts plot every year returned for the selected institution.

## Datasets

| Manifest alias | Snowflake view |
|---|---|
| `ipeds` | `MARVIN_ANALYTICS.REPORTING.VW_IPEDS_BETA` |
| `migration` | `MARVIN_ANALYTICS.REPORTING.VW_IPEDS_MIGRATION_BETA` |

Dataset UUIDs and portal pin steps: [README.md](./README.md).

## Columns the legacy app reads

`VW_IPEDS_BETA`: `UNITID`, `INSTNM`, `SURVEY_YEAR`, `APPLCN`, `ADMSSN`, `ENRLT`, `ADMIT_RATE`, `TUITION1`, `TUITION2`, `AVG_TUITION`, `NTR`, `DISCOUNT_RATE`, `PGRNT_P`, `CONTROL_VALUE`, `STABBR_VALUE`, `OBEREG_VALUE`, `CONFERENCE`, `SELECTIVITY_CATEGORY`, advancement columns as available.

`VW_IPEDS_MIGRATION_BETA`: `INSTNM`, `EFCSTATE_TITLE`, `EFCSTATE_LABEL`, `EFRES01`, `STABBR`, `STABBR_VALUE`, `SURVEY_YEAR`, etc.

Confirm column names on the Domo datasets after each view change.

## Performance

- **Boot:** Parallel dataset probes; **essential** boot is survey years + default institution only, then the dashboard shows (no minimum splash delay). Filter **lookup** `GROUP BY`, full institution list, and comparison fallbacks load in the background. IPEDS charts load with header status **Updating**.
- **Wave load:** IPEDS trend charts paint first; migration (residence) loads in a second wave. Out-of-state loads when **FROM STATE** is selected.
- **Charts:** Only the **active tab** renders on load and refresh; switching tabs repaints from cached query results.
- **Details / reports:** Table HTML is built when you open **Details** or **Export report**.
- **Loader:** No artificial minimum splash time; overlay hides as soon as essentials are ready. Chart.js ships in `vendor/` (same origin as the card). Portal cards must be **pinned** to the published `designVersion` — see [README.md](./README.md).

## Release checks (local)

From `IPEDS_Insights/`:

```bash
node --check app.js
node scripts/peer-helpers.test.js
node scripts/check-release.js
```

`check-release.js` fails if `manifest.json`, `manifest.dev.json`, `APP_VERSION`, `index.html` cache-bust, and README’s cited version disagree.

## Publish

Follow [../PROCESS.md](../PROCESS.md). Prod publish from **`main`** after Dev validation.

## Changelog (audit / fix commits on `update/ipeds-insights-card`)

| Commit | Item | Summary |
|--------|------|---------|
| `e9bf86a` | AUD-002 | Top 10: no all-years fallback; explicit empty when year has no rows |
| `548e9a9` | AUD-019–022 | Migration, origin, lookup errors in data banner |
| `ce24225` | AUD-011 | Explicit Survey year on Admissions |
| `3047c01` | AUD-013 | Reset clears FROM STATE |
| `baf0d59` | AUD-025–026 | README/DOCUMENTATION layout sync |
| `5eb2499` | AUD-006 | FROM STATE from migration labels; empty-state message |
| `356361e` | AUD-001 | SQL peer aggregates by survey year |
| `d5db967` | AUD-001b | Peer volume metrics: AVG per institution |
| `37b7cb0` | AUD-003 | Non-groupable default peer; peer definition subtitle |
| `039b6d3` | — | Discount/Pell reporting coverage in tooltip and Details |
| `522a376` | — | Top 10 query errors in banner |

*(Prod and Dev manifests aligned at **0.3.24** after publish.)*
