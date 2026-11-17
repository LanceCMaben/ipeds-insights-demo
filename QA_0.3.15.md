# IPEDS Insights — QA checklist (0.3.16)

**Portal card:** Domo `1175639536` · app instance `cbfb18f2-38ca-4b2f-9352-a7bfae56bfca`  
**Prod design:** `fefabd63-5f28-46c8-84ef-2fa289d52faa`  
**Branch shipped:** `update/ipeds-insights-card` @ `cb79f8c`

## Before you start

- [ ] Hard refresh the portal page (**Ctrl+Shift+R**) so cached assets reload.
- [ ] Open DevTools → Elements → confirm `<html data-ipeds-version="0.3.16">` (set from `APP_VERSION` in the running bundle).
- [ ] Optional: Network tab — `app.js?v=0.3.16` and `app.css?v=0.3.16` load without 404.

---

## Theme: Top 10 survey year (AUD-002 · `e9bf86a`)

**What changed:** Top 10 no longer falls back to all years when the selected survey year has no rows.

| Where | Expected |
|-------|----------|
| Admissions → **Comparison institutions** (Top 10) | With **Survey year** set and no peer apps for that year, empty message names the year (not a silent wrong-year list). |
| Same chart | With a year that has data, shows up to 10 schools for **that year only**. |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Error banners (AUD-019–022 · `548e9a9`; Top 10 · `522a376`)

**What changed:** Migration, origin, lookup, comparison aggregate, and Top 10 SQL failures surface in the **data banner** (amber bar under filters).

| Where | Expected |
|-------|----------|
| **Data banner** | No spurious errors on happy path with datasets mapped. |
| (If you can trigger a failure) Comparison / Top 10 | Banner prefix `Comparison data:` or `Top 10 comparison:` with a readable message. |
| Migration / FROM STATE | On failure, `Migration data:` or `Out-of-state data:` (not a blank chart with no explanation). |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Survey year on Admissions (AUD-011 · `ce24225`)

**What changed:** Explicit **Survey year** control on the Admissions filter bar (left column with institution).

| Where | Expected |
|-------|----------|
| Admissions filter bar (left) | **Survey year** picker visible and applies to year-scoped views (Top 10, residence, OOS). |
| Trend charts | Still show all years returned for the selected institution. |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Reset and FROM STATE (AUD-013 · `3047c01`; AUD-006 · `5eb2499`)

**What changed:** Reset clears comparison filters, restores defaults, clears **FROM STATE**; origin options come from migration labels; empty OOS shows “No migration data for this state.”

| Where | Expected |
|-------|----------|
| **Reset** | Clears comparison filters and **FROM STATE**; migration/OOS views refresh. |
| **FROM STATE** menu | Values match migration origin labels (not IPEDS comparison state list). |
| OOS charts | No origin selected → placeholder; origin with no rows → **No migration data for this state.** |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Peer aggregates (AUD-001 · `356361e`; AUD-001b · `d5db967`)

**What changed:** Comparison trends use SQL `GROUP BY SURVEY_YEAR` (ratio-of-sums rates, enrollment-weighted discount/Pell, **AVG** per institution for application counts); no client-side `averageByYear`.

| Where | Expected |
|-------|----------|
| Comparison **Admissions metrics** | Peer application bars ~**thousands** (not millions) for High Point default peers. |
| **Details** on a comparison chart | Methodology lists averages, ratio-of-sums, enrollment-weighted rules. |
| **Admit & yield — comparison** | Rates plausible vs institution series (same axis scale). |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Default peer definition (AUD-003 · `37b7cb0`)

**What changed:** Ignores non-groupable conference (`Not applicable`, etc.); default = state + control; plain-language comparison subtitles with institution count and `(default)`; broad group note if &gt;1,000; empty state if no valid default.

| Where | Expected |
|-------|----------|
| **High Point University, North Carolina** — comparison subtitles | `Peers: North Carolina, Private not-for-profit, 49 institutions (default)` (count may vary slightly by survey year). |
| **Duke** or **UNC Chapel Hill** | Valid **conference** default (e.g. ACC, ~16 institutions). |
| Institution with no valid default | Comparison charts ask you to **Choose comparison filters…** |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Discount / Pell reporting coverage (`039b6d3`)

**What changed:** Peer SQL returns reporters per year; tooltip and **Details** show e.g. `43 of 49 report discount rate`.

| Where | Expected |
|-------|----------|
| **Discount rate — comparison** tooltip | Peer institution count + reporting coverage line. |
| **Pell — comparison** tooltip | Same pattern for Pell reporters. |
| **Details** table | **Reporting coverage** column on discount/Pell comparison charts. |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Layout and docs (AUD-025–026 · `baf0d59`; prior layout · `1811fe8` / `249d2dc`)

**What changed:** Admissions layout (institution + year left, comparisons right); docs describe behavior; CNVA-style loader and tabs.

| Where | Expected |
|-------|----------|
| Admissions filters | Institution + survey year left; comparison dimensions right; **Apply** / **Reset**. |
| Tabs | Admissions, Advancement, FAQ switch without broken views. |
| Footer / 3E chrome | Logo and contact present. |

- [ ] Pass / Fail — notes: ___________

---

## Theme: Boot and datasets (0.3.13+ · `8e664d9`)

**What changed:** IPEDS probe fallback; clearer banner when alias not mapped.

| Where | Expected |
|-------|----------|
| Loader | Dismisses after data connect; filters populate. |
| Missing migration mapping | Banner explains migration alias needed (IPEDS-only still loads core charts). |

- [ ] Pass / Fail — notes: ___________

---

## Extra sanity checks (recommended)

1. **Advancement tab** — comparison subtitles and peer trends load for the same institution (no Admissions-only regression).
2. **Export report** — enabled with an institution selected; opens printable layout.
3. **Explicit comparison filters** — pick a conference on the right, **Apply**; subtitle reflects your filters (no `(default)`), and charts update.

---

## Warehouse spot-check (optional, Domo SQL on `VW_IPEDS_BETA`)

High Point default peer predicate (2024):

```sql
INSTNM <> 'High Point University, North Carolina'
  AND STABBR_VALUE = 'North Carolina'
  AND CONTROL_VALUE = 'Private not-for-profit'
  AND SURVEY_YEAR = '2024'
```

Expect ~**49** peer institutions, **AVG(APPLCN)** in the **thousands**, institution **APPLCN** ~**17,572** (2024).

---

## Sign-off

| Field | Value |
|-------|--------|
| Tester | |
| Date | |
| Portal `designVersion` seen | |
| Overall | Pass / Fail |
