# Peer median / percentile / rank — follow-up (not in 0.4.0)

This restyle keeps the current **peer mean** (and existing ratio-of-sums / weighted means). No peer SQL changed. Plug these in later without another layout pass.

## Already on each peer aggregate row

- `PEER_N` — institution count in the comparison group for that survey year
- `DISCOUNT_REPORT_N`, `PGRNT_REPORT_N` — how many peers reported discount and Pell

## Needs new SQL fields (same peer filters, do not change aliases)

| UI spot | Component | Fields to add |
|---|---|---|
| KPI “Peer average” line | `kpiFromColumn` / `updateAdmissionsKpiStrip` / `updateAdvancementKpiStrip` | `*_MEDIAN` beside each mean column (applications, admits, enrollment, admit rate, yield, tuition, NTR, discount, Pell, endowment, giving, FTE, endowment per FTE, opex) |
| Peer chart series | `drawTrend` datasets | same `*_MEDIAN` columns; optional `*_P25` and `*_P75` for a band dataset |
| Shared y-scale pairs | `SHARED_Y_PAIRS` + `alignSharedYScales` | no new fields; recompute max from median series once those columns feed the charts |
| Rank X of N | new line under KPI value, and Top 10 subtitle | `RANK_<metric>` plus existing `PEER_N`, for the selected institution vs the peer set, for the selected survey year |
| Section footnote | `syncSectionFootnotes` | can keep `PEER_N`; add a clause when median is the statistic in use |
| Detail table | `buildTableHtmlFromSpec` | extra columns when `tableSpec` includes median / p25 / p75 |
| Peer methodology copy | `PEER_METHODOLOGY_HTML` | replace “averaged” wording when the query switches |

Ratio metrics (admit rate, yield, endowment per FTE, discount, Pell, philanthropic share) should stay ratio-of-sums or a documented weighted median — do not median the already-averaged percentages without a definition.
