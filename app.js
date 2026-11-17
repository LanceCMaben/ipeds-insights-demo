/* ============================================================
   3E IPEDS Insights — Admissions & Advancement
   Layout follows the legacy App Studio card.
   Chrome follows the Conversion Apply client refresh.
   ipeds     MARVIN_ANALYTICS.REPORTING.VW_IPEDS_BETA
   migration MARVIN_ANALYTICS.REPORTING.VW_IPEDS_MIGRATION_BETA
   ============================================================ */

var APP_VERSION = '0.4.67';
var APP_BUILD = 'stage2-20261112-1500';

var CONFIG = {
  ipedsAlias: 'ipeds',
  migrationAlias: 'migration',
  queryTimeoutMs: 90000,
  lookupTimeoutMs: 120000,
  institutionQueryTimeoutMs: 180000
};

var FIELD = {
  applications: ['APPLCN', 'APPLICATIONS'],
  admissions: ['ADMSSN', 'ADMISSIONS'],
  enrollment: ['ENRLT', 'ENROLLMENT'],
  admitRate: ['ADMIT_RATE'],
  yieldRate: ['YIELD_RATE', 'ENROLL_YIELD'],
  discount: ['DISCOUNT_RATE'],
  ntr: ['NTR', 'NET_TUITION_REVENUE'],
  tuition: ['AVG_TUITION', 'TUITION2', 'TUITION1'],
  pell: ['PGRNT_P', 'PELL_PCT'],
  endowment: ['ENDOWMENT_END', 'ENDOWMENT_BEGIN', 'ENDOWMENT', 'ENDOWMENT_VALUE'],
  giving: ['PRIVATE_GIVING_TOTAL', 'PRIVATE_GIFTS', 'PRIVATE_GRANTS_CONTRACTS', 'PRIVATE_GIVING'],
  fte: ['FTE_TOTAL', 'FTE', 'FTE_UG', 'FTE_COUNT'],
  opex: ['TOTAL_EXPENSES', 'INSTRUCTION_EXPENSES', 'OPERATING_EXPENSES'],
  philanthropic: ['PRIVATE_GIVING_TOTAL', 'ENDOWMENT_NEW_GIFTS_ADDITIONS', 'PRIVATE_GIFTS']
};

var MIGRATION_KNOWN_COLUMNS = [
  'INSTNM', 'SURVEY_YEAR', 'EFCSTATE_LABEL', 'EFCSTATE_TITLE', 'EFRES01', 'STABBR', 'STABBR_VALUE'
];

var KNOWN_COLUMNS = [
  'MYINSTNAME', 'PARTITION', 'INSTNM', 'SURVEY_YEAR', 'CONFERENCE', 'OBEREG_VALUE',
  'STABBR_VALUE', 'CONTROL_VALUE', 'SELECTIVITY_CATEGORY', 'APPLCN', 'ADMSSN', 'ENRLT',
  'ADMIT_RATE', 'AVG_TUITION', 'TUITION1', 'TUITION2', 'NTR', 'DISCOUNT_RATE', 'PGRNT_P',
  'ENDOWMENT_END', 'ENDOWMENT_BEGIN', 'PRIVATE_GIVING_TOTAL', 'PRIVATE_GIFTS',
  'FTE_TOTAL', 'FTE', 'TOTAL_EXPENSES', 'PRIVATE_GRANTS_CONTRACTS'
];
var IPEDS_PROBE_COLUMNS = KNOWN_COLUMNS.join(', ');
var PARTITION_COLUMNS = ['MYINSTNAME', 'PARTITION', 'CLIENT', 'PARTNER'];
var DEFAULT_INSTITUTION = 'HighPoint University';
var PEER_CMP_SUBTITLE = 'Peer average';
var PEER_PICK_FILTERS_MSG = 'Choose comparison filters on the right (conference, state, control, etc.), then Apply.';
var ORIGIN_PICK_STATE_MSG = 'Choose a state.';
var PEER_MAX_SINGLE_DIMENSION = 1000;
var PEER_METHODOLOGY_HTML =
  '<div class="peer-methodology">' +
  '<p><strong>Peer group methodology</strong></p>' +
  '<ul>' +
  '<li>The selected institution is excluded from the comparison group.</li>' +
  '<li>Applications, admissions, and enrollment are averaged across peer institutions for each survey year (mean per institution).</li>' +
  '<li>Admit rate, yield, and endowment per FTE are ratio-of-sums (numerator and denominator must both be present on a row for that row to count).</li>' +
  '<li>Discount rate and Pell eligibility are enrollment-weighted means across institutions (an approximation when the source reports a percentage for each institution).</li>' +
  '<li>Tooltip and Details show how many peer institutions reported discount and Pell each year versus the peer count.</li>' +
  '<li>Tuition, net tuition revenue, endowment, giving, FTE, and operating expenses are simple averages of institution values in the peer set.</li>' +
  '</ul></div>';

var ADMISSIONS_FILTER_KEYS = [
  'institution', 'year', 'conference', 'region', 'control', 'comparisons', 'state', 'selectivity'
];
var ADMISSIONS_COMPARISON_KEYS = ['conference', 'region', 'control', 'comparisons', 'state', 'selectivity'];

var FILTERS = [
  { key: 'partition', label: 'Partition', column: 'MYINSTNAME', single: true, allLabel: 'All partitions', noun: 'partitions', wide: true, hidden: true },
  { key: 'year', label: 'Survey year', column: 'SURVEY_YEAR', single: true, allLabel: 'All years', noun: 'years', sort: 'desc' },
  { key: 'institution', label: 'Institution', column: 'INSTNM', single: true, allLabel: 'Select an institution', noun: 'institutions', wide: true, layout: 'primary' },
  { key: 'comparisons', label: 'Comparison institutions', column: 'INSTNM', allLabel: 'All institutions', noun: 'institutions', wide: true, layout: 'comparison' },
  { key: 'conference', label: 'Conference', column: 'CONFERENCE', allLabel: 'All conferences', noun: 'conferences', layout: 'comparison' },
  { key: 'region', label: 'Region', column: 'OBEREG_VALUE', allLabel: 'All regions', noun: 'regions', layout: 'comparison' },
  { key: 'state', label: 'State', column: 'STABBR_VALUE', allLabel: 'All states', noun: 'states', layout: 'comparison' },
  { key: 'control', label: 'Institutional control', column: 'CONTROL_VALUE', allLabel: 'All controls', noun: 'controls', layout: 'comparison' },
  { key: 'selectivity', label: 'Selectivity (admit rate)', column: 'SELECTIVITY_CATEGORY', allLabel: 'All selectivity', noun: 'bands', layout: 'comparison' }
];

var FAQS = [
  ['What is the purpose of this dashboard?', 'It compares admissions, price, aid, migration, and advancement metrics for one institution against a comparison group, using IPEDS.'],
  ['Where does the data come from?', 'The U.S. Department of Education IPEDS surveys.'],
  ['How do I build a comparison group?', 'The card opens on the most similar default group for the selected institution, usually the same state and control. You can switch comparison off. To change the group, open comparison filters and choose a conference, region, state, control, selectivity, or specific institutions, then Apply. The selected institution is excluded from the average.'],
  ['Which charts use the survey year?', 'Residence, rankings, the heat tables, and the home-state enrollment map use the survey year. Trend charts plot every year returned for that institution.'],
  ['What is on the Advancement tab?', 'Endowment, private giving, FTE, endowment per FTE, philanthropic intensity, and operating expenses with philanthropic contribution. Your institution is shown beside the comparison group average.'],
  ['Why is an Advancement chart empty?', 'That metric may be missing for your selection, or no institution is chosen yet. Other advancement charts can still populate.']
];

var GLOSSARY = [
  ['Applications', 'Completed admission applications received.'],
  ['Admitted', 'Applicants offered admission.'],
  ['Enrolled', 'Admitted students who enrolled.'],
  ['Admit rate', 'Admissions divided by applications.'],
  ['Yield', 'Share of admitted students who enrolled.'],
  ['Published tuition', 'Average published tuition. Falls back to in-state, then in-district tuition.'],
  ['Net tuition revenue', 'Tuition and fee revenue per student after institutional aid.'],
  ['Discount rate', 'Share of published tuition offset by institutional aid.'],
  ['Pell eligibility', 'Share of full-time, first-time undergraduates awarded Pell grants.'],
  ['Endowment', 'Market value of endowment assets at the end of the fiscal year.'],
  ['Private giving', 'Gifts, grants, and contracts from private sources.'],
  ['FTE', 'Full-time equivalent enrollment used for advancement ratios.'],
  ['Endowment per FTE', 'Endowment divided by FTE for the same survey year.'],
  ['Operating expenses', 'Total operating expenses reported for the institution.'],
  ['Philanthropic contribution', 'Private giving and related gifts shown with operating expenses.'],
  ['Philanthropic intensity', 'Private giving divided by operating expenses.']
];

var state = {
  page: 'admissions',
  faqPanel: 'faq',
  year: '',
  partition: '',
  institution: '',
  originState: '',
  filters: { comparisons: [], conference: [], region: [], state: [], control: [], selectivity: [] },
  draft: { partition: [], year: [], institution: [], comparisons: [], conference: [], region: [], state: [], control: [], selectivity: [], origin: [] },
  detailExploreDraft: null,
  detailExplorePeerRows: null,
  lookup: [],
  didDefaultPartition: false,
  didDefaultYear: false,
  didDefaultInstitution: false,
  options: {},
  columns: [],
  migrationColumns: [],
  fields: {},
  connected: { ipeds: false, migration: false },
  error: '',
  migrationError: '',
  residenceInstError: '',
  residencePeerError: '',
  oosError: '',
  peerError: '',
  top10Error: '',
  peerInstitutionRowsPending: false,
  peerQueryBlocked: false,
  peerCompareOn: true,
  peerAnchorInstitution: '',
  originPinned: false,
  originInstitution: '',
  oosFocus: '',
  peerCtxIpeds: null,
  peerCtxMigration: null,
  peerRateScales: {},
  rankNotes: { admissions: '', advancement: '' },
  paintCache: null,
  refreshGen: 0,
  paintSerial: 0,
  pageSerial: { admissions: -1, advancement: -1, keymetrics: -1 },
  advExplorer: { metric: 'endowment', mode: 'actual' }
};

var charts = {};
var detailChart = null;
var detailNestedChart = null;
var sectionOverviewChart = null;
var detailStore = {};
var openDetailId = '';
var detailExploreMountedFor = '';
var refreshDimActive = false;

function $(id) { return document.getElementById(id); }

function str(v) { return v == null ? '' : String(v); }

function escapeHtml(s) {
  return str(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function titleCaseLabel(text) {
  if (text == null || text === '') return text;
  return String(text).replace(/(^|[\s&·/\-–—:(),]+)([a-z])/g, function (_, sep, ch) {
    return sep + ch.toUpperCase();
  });
}

function escapeSql(s) { return String(s).replace(/'/g, "''"); }

function num(v) {
  if (v == null || v === '') return null;
  var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return isFinite(n) ? n : null;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#18181A';
}

function axisInk() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? cssVar('--text') : cssVar('--text-mute');
}

function symlog(value) {
  var number = Number(value);
  if (!isFinite(number) || number <= 0) return 0;
  return Math.log10(1 + number);
}

function symlogTicks(maxRaw) {
  var ceiling = niceCeiling(Math.max(maxRaw, 1));
  var raws = [0];
  var exp = Math.floor(Math.log10(ceiling));
  var power;
  for (power = Math.max(0, exp - 2); power <= exp; power += 1) {
    [1, 5].forEach(function (mult) {
      var tick = mult * Math.pow(10, power);
      if (tick >= ceiling / 100 && tick <= ceiling * 1.001) raws.push(tick);
    });
  }
  if (raws[raws.length - 1] < ceiling * 0.9) raws.push(ceiling);
  var seen = {};
  return raws.filter(function (tick) {
    if (seen[tick]) return false;
    seen[tick] = true;
    return true;
  });
}

function upperRow(row) {
  var out = {};
  Object.keys(row || {}).forEach(function (key) { out[String(key).toUpperCase()] = row[key]; });
  return out;
}

function columnLabel(col) {
  if (col == null) return '';
  if (typeof col === 'string') return col;
  return col.name || col.label || col.column || '';
}

function normalizeRows(payload) {
  var rows = [];
  var columns = [];
  if (Array.isArray(payload)) rows = payload;
  else if (payload && typeof payload === 'object') {
    var rawCols = payload.columns || (payload.metadata && payload.metadata.columns) || [];
    if (Array.isArray(rawCols)) columns = rawCols.map(columnLabel);
    if (Array.isArray(payload.rows)) rows = payload.rows;
    else if (Array.isArray(payload.data)) rows = payload.data;
    else if (Array.isArray(payload.result)) rows = payload.result;
  }
  return rows.map(function (row) {
    if (Array.isArray(row)) {
      var obj = {};
      row.forEach(function (value, index) {
        obj[columns[index] || String(index)] = value;
      });
      return upperRow(obj);
    }
    return upperRow(row);
  });
}

function sqlQuery(alias, sql) {
  var pending = domo.post('/sql/v1/' + alias, sql, { contentType: 'text/plain' });
  if (!pending || typeof pending.then !== 'function') {
    return Promise.reject(new Error('The Domo query did not return a result.'));
  }
  return pending.then(normalizeRows);
}

function domoErrorMessage(err) {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err.statusReason) return err.statusReason;
  if (err.response && err.response.data) {
    var data = err.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.statusReason) return data.statusReason;
  }
  if (err.response && typeof err.response === 'string') return err.response;
  if (err.message && err.message !== 'Network Error' && !/^Request failed with status code/i.test(err.message)) {
    return err.message;
  }
  if (err.statusMessage) return err.statusMessage;
  if (err.status === 400) return 'Domo rejected the SQL query (400). Check column names and filters on the migration dataset.';
  if (err.message) return err.message;
  return '';
}

function withTimeout(promise, ms, label) {
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      reject(new Error(label + ' timed out'));
    }, ms);
    promise.then(function (value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(value);
    }, function (err) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

function resolveField(columns, candidates, fuzzy) {
  var map = {};
  columns.forEach(function (col) { map[col.toUpperCase()] = col; });
  var i;
  for (i = 0; i < candidates.length; i++) {
    if (map[candidates[i].toUpperCase()]) return map[candidates[i].toUpperCase()];
  }
  if (!fuzzy) return '';
  var names = Object.keys(map);
  for (i = 0; i < candidates.length; i++) {
    var needle = candidates[i].toUpperCase();
    for (var k = 0; k < names.length; k++) {
      if (names[k].indexOf(needle) !== -1) return map[names[k]];
    }
  }
  return '';
}

function field(name) { return state.fields[name] || ''; }

function distinctSql(column, alias) {
  var table = alias || CONFIG.ipedsAlias;
  return 'SELECT ' + column + ' AS V FROM ' + table +
    ' WHERE ' + column + ' IS NOT NULL GROUP BY ' + column + ' ORDER BY ' + column;
}

function migrationOriginColumn() {
  if (state.migrationColumns.indexOf('EFCSTATE_LABEL') !== -1) return 'EFCSTATE_LABEL';
  if (state.migrationColumns.indexOf('EFCSTATE_TITLE') !== -1) return 'EFCSTATE_TITLE';
  return '';
}

function distinctRowValue(row, column) {
  if (!row) return '';
  var alias = str(row.V);
  if (alias) return alias;
  var col = str(column).toUpperCase();
  if (row[col] != null && row[col] !== '') return str(row[col]);
  return '';
}

function allInstitutionsFromLookup() {
  var seen = {};
  state.lookup.forEach(function (row) {
    var name = str(row.INSTNM);
    if (name) seen[name] = true;
  });
  return sortValues(Object.keys(seen), false);
}

function mergeInstitutionsFromLookup() {
  if (!state.lookup.length) return;
  var seen = {};
  (state.options.institutions || []).forEach(function (name) { seen[name] = true; });
  state.lookup.forEach(function (row) {
    var name = str(row.INSTNM);
    if (name) seen[name] = true;
  });
  state.options.institutions = sortValues(Object.keys(seen), false);
}

function inClause(column, values) {
  if (!values || !values.length) return '';
  return column + ' IN (' + values.map(function (v) { return "'" + escapeSql(v) + "'"; }).join(', ') + ')';
}

function filterByKey(key) {
  var i;
  for (i = 0; i < FILTERS.length; i++) {
    if (FILTERS[i].key === key) return FILTERS[i];
  }
  return null;
}

function namedColumns(rows) {
  var keys = rows && rows[0] ? Object.keys(rows[0]) : [];
  return keys.filter(function (key) { return !/^\d+$/.test(key); });
}

function adoptColumns(rows) {
  var found = namedColumns(rows).map(function (col) { return String(col).toUpperCase(); });
  if (!found.length) return KNOWN_COLUMNS.slice();
  var merged = [];
  KNOWN_COLUMNS.forEach(function (col) {
    if (found.indexOf(col) !== -1) merged.push(col);
  });
  found.forEach(function (col) {
    if (merged.indexOf(col) === -1) merged.push(col);
  });
  return merged.length ? merged : KNOWN_COLUMNS.slice();
}

function hasColumn(col) {
  var want = String(col).toUpperCase();
  return state.columns.some(function (c) { return String(c).toUpperCase() === want; });
}

function adoptMigrationColumns(rows) {
  var found = namedColumns(rows).map(function (col) { return String(col).toUpperCase(); });
  if (!found.length) return MIGRATION_KNOWN_COLUMNS.slice();
  var merged = [];
  MIGRATION_KNOWN_COLUMNS.forEach(function (col) {
    if (found.indexOf(col) !== -1) merged.push(col);
  });
  found.forEach(function (col) {
    if (merged.indexOf(col) === -1) merged.push(col);
  });
  return merged;
}

function migrationHasColumn(col) {
  var want = String(col).toUpperCase();
  return state.migrationColumns.some(function (c) { return String(c).toUpperCase() === want; });
}

function migrationInstitutionColumn() {
  if (migrationHasColumn('INSTNM')) return 'INSTNM';
  if (migrationHasColumn('MYINSTNAME')) return 'MYINSTNAME';
  return '';
}

function migrationResidenceCountColumn() {
  if (migrationHasColumn('EFRES01')) return 'EFRES01';
  return '';
}

function migrationInstitutionWhere() {
  var col = migrationInstitutionColumn();
  if (!col) return '';
  var value = state.institution;
  if (col === 'MYINSTNAME' && state.partition) value = state.partition;
  if (!value) return '';
  return col + " = '" + escapeSql(value) + "'";
}

function migrationWhereClause(core) {
  var parts = [];
  if (core) parts.push(core);
  var scope = partitionClause(state.migrationColumns);
  if (scope) parts.push(scope);
  return parts.join(' AND ');
}

function migrationYearClause(opts) {
  opts = opts || {};
  if (opts.skipYear || !state.year || !migrationHasColumn('SURVEY_YEAR')) return '';
  var y = String(state.year).trim();
  if (/^\d+$/.test(y)) return ' AND SURVEY_YEAR = ' + y;
  return " AND SURVEY_YEAR = '" + escapeSql(y) + "'";
}

function setBanner(message, kind) {
  var banner = $('data-banner');
  if (!banner) return;
  banner.classList.remove('data-banner--error', 'data-banner--info');
  if (!message) {
    banner.classList.add('hidden');
    banner.textContent = '';
    banner.removeAttribute('role');
    return;
  }
  banner.classList.remove('hidden');
  banner.textContent = message;
  if (kind === 'error') {
    banner.classList.add('data-banner--error');
    banner.setAttribute('role', 'alert');
  } else {
    if (kind === 'info') banner.classList.add('data-banner--info');
    banner.setAttribute('role', 'status');
  }
}

function syncDataBanner(opts) {
  opts = opts || {};
  var parts = [];
  if (state.peerError) parts.push('Comparison data: ' + state.peerError);
  if (state.top10Error) parts.push('Top 10 comparison: ' + state.top10Error);
  if (opts.includeMigration !== false && state.migrationError) {
    parts.push('Migration data: ' + state.migrationError);
  }
  if (state.oosError) parts.push('Out-of-state data: ' + state.oosError);
  if (!parts.length) {
    if (!state.connected.migration && state.connected.ipeds) {
      setBanner(
        'VW_IPEDS_BETA is connected. Residence charts need VW_IPEDS_MIGRATION_BETA on the migration alias.',
        'info'
      );
      return;
    }
    setBanner('');
    return;
  }
  setBanner(parts.join(' '), 'error');
}

function partitionColumn() {
  var i;
  for (i = 0; i < PARTITION_COLUMNS.length; i++) {
    if (state.columns.indexOf(PARTITION_COLUMNS[i]) !== -1) return PARTITION_COLUMNS[i];
  }
  return '';
}

function syncPartitionColumn() {
  setPartitionColumn(partitionColumn());
}

function setPartitionColumn(col) {
  var def = filterByKey('partition');
  if (def && col) def.column = col;
}

function setOptionsFromDistinctRows(key, column, rows, sortDesc) {
  state.options[key] = sortValues(
    rows.map(function (row) { return distinctRowValue(row, column); }).filter(Boolean),
    !!sortDesc
  );
}

function compactName(value) {
  return str(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchPreferred(options, needle) {
  var want = compactName(needle);
  var i;
  var name;
  if (!want) return '';
  for (i = 0; i < options.length; i++) {
    if (compactName(options[i]) === want) return options[i];
  }
  for (i = 0; i < options.length; i++) {
    name = compactName(options[i]);
    if (name.indexOf(want) !== -1) return options[i];
  }
  return '';
}

function partitionClause(columns) {
  var col = partitionColumn();
  if (!state.partition || !col || !columns || columns.indexOf(col) === -1) return '';
  return col + " = '" + escapeSql(state.partition) + "'";
}

function peerWhereForColumns(columns) {
  var parts = [];
  var cols = columns || [];
  FILTERS.forEach(function (def) {
    if (def.single) return;
    if (!cols.length) return;
    if (cols.indexOf(def.column) === -1 && def.column !== 'INSTNM') return;
    var clause = inClause(def.column, state.filters[def.key]);
    if (clause) parts.push(clause);
  });
  if (state.institution) parts.push("INSTNM <> '" + escapeSql(state.institution) + "'");
  return parts.join(' AND ');
}

function peerWhereIpeds() {
  return peerWhereForColumns(state.columns);
}

function peerWhereMigration() {
  return peerWhereForColumns(state.migrationColumns);
}

function isGroupableValue(value) {
  var t = str(value).trim();
  if (!t) return false;
  var u = t.toUpperCase();
  if (u === 'NOT APPLICABLE' || u === 'N/A' || u === 'NA' || u === 'NONE' || u === 'NULL' || u === 'UNKNOWN') return false;
  if (t === '—' || t === '-') return false;
  return true;
}

function peerExcludeInstitutionClause() {
  if (!state.institution) return '';
  return "INSTNM <> '" + escapeSql(state.institution) + "'";
}

function peerEqClause(column, value) {
  return column + " = '" + escapeSql(str(value)) + "'";
}

function describeExplicitPeerFilters() {
  var parts = [];
  FILTERS.forEach(function (def) {
    if (def.single) return;
    var vals = state.filters[def.key];
    if (!vals || !vals.length) return;
    var label = def.label.replace(/\s*-\s*Comparison\s*$/i, '');
    parts.push(label + ': ' + vals.join('; '));
  });
  return parts.join(' · ');
}

function comparisonPeerSubtitle() {
  if (state.peerQueryBlocked) return PEER_PICK_FILTERS_MSG;
  var ctx = state.peerCtxIpeds;
  if (!ctx || ctx.blocked) return PEER_CMP_SUBTITLE;
  if (!ctx.label) return PEER_CMP_SUBTITLE;
  var line = 'Peers: ' + ctx.label;
  if (ctx.peerN != null) line += ', ' + Math.round(ctx.peerN).toLocaleString() + ' institutions';
  if (ctx.isDefault) line += ' (default)';
  if (ctx.tooBroad) line += '. Very broad default peer group (more than 1,000 institutions).';
  return line;
}

function syncComparisonChartSubtitles() {
  var ctx = state.peerCtxIpeds;
  var peerOn = !!(ctx && !ctx.blocked && ctx.label);
  document.querySelectorAll('.panel').forEach(function (panel) {
    var canvas = panel.querySelector('canvas');
    if (!canvas) return;
    var sub = panel.querySelector('.box-subtitle');
    if (!sub) return;
    if (canvas.id.slice(-4) === '-cmp') {
      sub.textContent = comparisonPeerSubtitle();
      return;
    }
    if (canvas.id === 'chart-admissions') {
      sub.textContent = peerOn
        ? 'Applications and admits, left axis. Enrollment, right axis. ' + comparisonPeerSubtitle()
        : 'Applications and admits, left axis. Enrollment, right axis. No comparison filters applied.';
      return;
    }
    if (!sub.hasAttribute('data-peer-sub')) return;
    sub.textContent = peerOn ? comparisonPeerSubtitle() : (state.institution || 'Institution only');
  });
}

function countPeerInstitutions(alias, where, surveyYear) {
  if (!where || !alias) return Promise.resolve(0);
  var yearClause = surveyYear ? " AND SURVEY_YEAR = '" + escapeSql(surveyYear) + "'" : '';
  var sql = 'SELECT COUNT(DISTINCT INSTNM) AS N FROM ' + alias + ' WHERE ' + where + yearClause;
  return withTimeout(sqlQuery(alias, sql), CONFIG.queryTimeoutMs, 'Peer count').then(function (rows) {
    return num(rows[0] && rows[0].N) || 0;
  });
}

function resolveExplicitPeerContext(columns) {
  var where = peerWhereForColumns(columns);
  if (!where) return { blocked: true, where: '', label: '', isDefault: false, peerN: null, tooBroad: false };
  return {
    blocked: false,
    where: where,
    label: describeExplicitPeerFilters(),
    isDefault: false,
    peerN: null,
    tooBroad: false
  };
}

function resolveDefaultPeerContext(sample, alias, columns) {
  var excl = peerExcludeInstitutionClause();
  if (!sample || !excl) return Promise.resolve({ blocked: true, where: '', label: '', isDefault: true, peerN: null, tooBroad: false });
  var surveyYear = state.year || str(sample.SURVEY_YEAR) || '';
  var hasConference = columns.indexOf('CONFERENCE') !== -1;
  var hasState = columns.indexOf('STABBR_VALUE') !== -1;
  var hasControl = columns.indexOf('CONTROL_VALUE') !== -1;
  var conferenceOk = hasConference && isGroupableValue(sample.CONFERENCE);
  var stateOk = hasState && isGroupableValue(sample.STABBR_VALUE);
  var controlOk = hasControl && isGroupableValue(sample.CONTROL_VALUE);

  function attempt(where, label) {
    return countPeerInstitutions(alias, where, surveyYear).then(function (peerN) {
      if (peerN > 0 && peerN < PEER_MAX_SINGLE_DIMENSION) {
        return { blocked: false, where: where, label: label, isDefault: true, peerN: peerN, tooBroad: false };
      }
      return null;
    }).catch(function () { return null; });
  }

  var steps = [];
  if (stateOk && controlOk) {
    steps.push(function () {
      return attempt(
        excl + ' AND ' + peerEqClause('STABBR_VALUE', sample.STABBR_VALUE) + ' AND ' + peerEqClause('CONTROL_VALUE', sample.CONTROL_VALUE),
        str(sample.STABBR_VALUE) + ', ' + str(sample.CONTROL_VALUE)
      );
    });
  }
  if (conferenceOk) {
    steps.push(function () {
      return attempt(excl + ' AND ' + peerEqClause('CONFERENCE', sample.CONFERENCE), String(sample.CONFERENCE));
    });
  }
  if (stateOk) {
    steps.push(function () {
      return attempt(excl + ' AND ' + peerEqClause('STABBR_VALUE', sample.STABBR_VALUE), str(sample.STABBR_VALUE));
    });
  }
  if (controlOk) {
    steps.push(function () {
      return attempt(excl + ' AND ' + peerEqClause('CONTROL_VALUE', sample.CONTROL_VALUE), str(sample.CONTROL_VALUE));
    });
  }
  function run(index) {
    if (index >= steps.length) {
      return Promise.resolve({ blocked: true, where: '', label: '', isDefault: true, peerN: null, tooBroad: false });
    }
    return steps[index]().then(function (ctx) {
      return ctx || run(index + 1);
    });
  }
  return run(0);
}

function blockedMigrationPeerContext() {
  return { blocked: true, where: '', label: '', isDefault: true, peerN: null, tooBroad: false };
}

function peerGroupPhrase(ctx) {
  if (!ctx || ctx.blocked || !ctx.label) return '';
  return String(ctx.label).replace(/,\s*/g, ' ');
}

function peerContextSentence() {
  var ctx = state.peerCtxIpeds;
  if (!state.peerCompareOn) return 'Comparison is off';
  if (!ctx || ctx.blocked || !ctx.label) return '';
  var n = ctx.peerN != null ? Math.round(ctx.peerN).toLocaleString() + ' ' : '';
  var kind = ctx.isDefault ? 'most similar default' : 'selected filters';
  return 'Peer Comparison: ' + n + ctx.label + ' institutions (' + kind + ')';
}

function peerLegendTag() {
  var ctx = state.peerCtxIpeds;
  if (!ctx || ctx.blocked || ctx.peerN == null) return 'Peer avg';
  return 'Peer avg (N=' + Math.round(ctx.peerN) + ')';
}

function peerBubbleLegend() {
  var ctx = state.peerCtxIpeds;
  if (!ctx || ctx.blocked || ctx.peerN == null) return 'Peers';
  return 'Peers (N=' + Math.round(ctx.peerN) + ')';
}

function peerDefinitionLine() {
  var ctx = state.peerCtxIpeds;
  if (!ctx || ctx.blocked || !ctx.label) return 'Peers: not set';
  var line = 'Peers: ' + ctx.label;
  if (ctx.peerN != null) line += ', N=' + Math.round(ctx.peerN);
  return line;
}

function peerGroupSize() {
  var ctx = state.peerCtxIpeds;
  if (!ctx || ctx.blocked || ctx.peerN == null) return null;
  return Math.round(ctx.peerN);
}

function setChartSubtitle(canvasId, text) {
  var canvas = $(canvasId);
  var panel = canvas && canvas.closest ? canvas.closest('.panel') : null;
  var sub = panel ? panel.querySelector('.box-subtitle') : null;
  if (sub) sub.textContent = text;
}

function updatePeerBanner() {
  var el = $('peer-context-banner');
  if (!el) return;
  if (!state.institution) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }
  var on = state.peerCompareOn !== false;
  var text = on ? (peerContextSentence() || 'Peer Comparison: finding the most similar institutions') : 'Comparison is off';
  el.classList.remove('hidden');
  el.innerHTML =
    '<button type="button" class="peer-context-text" id="peer-context-text">' + escapeHtml(text) + '</button>' +
    '<span class="peer-switch-wrap">' +
      '<button type="button" class="peer-switch" id="peer-context-toggle" role="switch" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="Comparison ' + (on ? 'on' : 'off') + '">' +
        '<span class="peer-switch-knob"></span>' +
      '</button>' +
      '<span class="peer-switch-label">' + (on ? 'On' : 'Off') + '</span>' +
    '</span>';
}

function clearComparisonFilters() {
  ADMISSIONS_COMPARISON_KEYS.forEach(function (key) {
    state.filters[key] = [];
    if (state.draft) state.draft[key] = [];
  });
  if (typeof populateFilters === 'function') populateFilters();
}

function setPeerCompare(on) {
  state.peerCompareOn = !!on;
  if (!on) clearComparisonFilters();
  applyDraft();
}

function openComparisonFilters() {
  var details = $('filter-comparisons-details');
  if (!details) return;
  details.open = true;
  if (details.scrollIntoView) details.scrollIntoView({ block: 'nearest' });
}

function useDefaultPeers() {
  state.peerCompareOn = true;
  clearComparisonFilters();
  applyDraft();
}

function resolvePeerContexts(sample) {
  var surveyYear = state.year || (sample && str(sample.SURVEY_YEAR)) || '';
  if (state.peerCompareOn === false) {
    state.peerCtxIpeds = { blocked: true, where: '', label: '', isDefault: true, peerN: null, tooBroad: false };
    state.peerCtxMigration = blockedMigrationPeerContext();
    state.peerQueryBlocked = true;
    return Promise.resolve();
  }
  if (!activeFilterCount()) {
    var migrationCtxPromise = state.connected.migration
      ? resolveDefaultPeerContext(sample, CONFIG.migrationAlias, state.migrationColumns)
      : Promise.resolve(blockedMigrationPeerContext());
    return Promise.all([
      resolveDefaultPeerContext(sample, CONFIG.ipedsAlias, state.columns),
      migrationCtxPromise
    ]).then(function (parts) {
      state.peerCtxIpeds = parts[0];
      state.peerCtxMigration = parts[1];
      state.peerQueryBlocked = !!(state.peerCtxIpeds && state.peerCtxIpeds.blocked);
    });
  }
  state.peerCtxIpeds = resolveExplicitPeerContext(state.columns);
  state.peerCtxMigration = state.connected.migration
    ? resolveExplicitPeerContext(state.migrationColumns)
    : blockedMigrationPeerContext();
  state.peerQueryBlocked = !!(state.peerCtxIpeds && state.peerCtxIpeds.blocked);
  if (state.peerCtxIpeds.blocked || !state.peerCtxIpeds.where) {
    state.peerQueryBlocked = true;
    return Promise.resolve();
  }
  return countPeerInstitutions(CONFIG.ipedsAlias, state.peerCtxIpeds.where, surveyYear).then(function (peerN) {
    state.peerCtxIpeds.peerN = peerN;
  });
}

function peerWhereIpedsResolved() {
  if (state.peerCtxIpeds && !state.peerCtxIpeds.blocked && state.peerCtxIpeds.where) return state.peerCtxIpeds.where;
  if (activeFilterCount()) return peerWhereForColumns(state.columns);
  return '';
}

function peerWhereMigrationResolved() {
  if (state.peerCtxMigration && !state.peerCtxMigration.blocked && state.peerCtxMigration.where) return state.peerCtxMigration.where;
  if (activeFilterCount()) return peerWhereForColumns(state.migrationColumns);
  return '';
}

function formatComparisonBanner() {
  var parts = [];
  if (state.peerError) parts.push('Comparison data: ' + state.peerError);
  if (state.top10Error) parts.push('Top 10 comparison: ' + state.top10Error);
  return parts.join(' ');
}

function residenceSelectList() {
  var cols = [];
  ['INSTNM', 'MYINSTNAME', 'EFRES01', 'EFCSTATE_LABEL', 'EFCSTATE_TITLE', 'STABBR_VALUE', 'SURVEY_YEAR'].forEach(function (col) {
    if (migrationHasColumn(col) && cols.indexOf(col) === -1) cols.push(col);
  });
  if (!cols.length) return '*';
  if (cols.indexOf('EFRES01') === -1 && migrationResidenceCountColumn()) cols.push(migrationResidenceCountColumn());
  return cols.join(', ');
}

function residenceRowCount(row) {
  var col = migrationResidenceCountColumn();
  return col ? num(row[col]) : num(row.EFRES01);
}

function peerYearInList(mineRows) {
  var seen = {};
  (mineRows || []).forEach(function (row) {
    var year = str(row.SURVEY_YEAR);
    if (year) seen[year] = true;
  });
  return Object.keys(seen).sort().map(function (year) {
    return "'" + escapeSql(year) + "'";
  }).join(', ');
}

function sqlPairRatio(numeratorCol, denominatorCol, outAlias) {
  return 'CASE WHEN SUM(CASE WHEN ' + denominatorCol + ' IS NOT NULL AND ' + numeratorCol + ' IS NOT NULL THEN ' + denominatorCol + ' END) > 0 ' +
    'THEN SUM(CASE WHEN ' + denominatorCol + ' IS NOT NULL AND ' + numeratorCol + ' IS NOT NULL THEN ' + numeratorCol + ' END) * 1.0 / ' +
    'SUM(CASE WHEN ' + denominatorCol + ' IS NOT NULL AND ' + numeratorCol + ' IS NOT NULL THEN ' + denominatorCol + ' END) END AS ' + outAlias;
}

function sqlWeightedMean(rateCol, weightCol, outAlias) {
  return 'CASE WHEN SUM(CASE WHEN ' + weightCol + ' IS NOT NULL AND ' + rateCol + ' IS NOT NULL THEN ' + weightCol + ' END) > 0 ' +
    'THEN SUM(CASE WHEN ' + weightCol + ' IS NOT NULL AND ' + rateCol + ' IS NOT NULL THEN ' + weightCol + ' * ' + rateCol + ' END) * 1.0 / ' +
    'SUM(CASE WHEN ' + weightCol + ' IS NOT NULL AND ' + rateCol + ' IS NOT NULL THEN ' + weightCol + ' END) END AS ' + outAlias;
}

function detectColumnScale(rows, column) {
  if (!column) return 'unknown';
  var hasUnit = false;
  var hasPercent = false;
  rows.forEach(function (row) {
    var value = num(row[column]);
    if (value == null) return;
    if (value <= 1.5) hasUnit = true;
    else hasPercent = true;
  });
  if (hasUnit && hasPercent) return 'mixed';
  if (hasUnit) return 'unit';
  if (hasPercent) return 'percent';
  return 'unknown';
}

function resolvePeerRateScales(mineRows) {
  var scales = {
    admit: detectColumnScale(mineRows, field('admitRate')),
    yield: detectColumnScale(mineRows, field('yieldRate') || 'YIELD_RATE'),
    discount: detectColumnScale(mineRows, field('discount')),
    pell: detectColumnScale(mineRows, field('pell'))
  };
  var mixed = [];
  Object.keys(scales).forEach(function (key) {
    if (scales[key] === 'mixed') mixed.push(key);
  });
  if (mixed.length) {
    state.peerRateScales = scales;
    return { mixed: mixed, scales: scales };
  }
  state.peerRateScales = scales;
  return { mixed: [], scales: scales };
}

function scaleSqlRatioToInstitution(value, scaleKey) {
  if (value == null) return null;
  var scale = state.peerRateScales[scaleKey];
  if (scale === 'percent') return value * 100;
  return value;
}

function normalizePeerAggregateRows(rows) {
  var admitCol = field('admitRate') || 'ADMIT_RATE';
  var yieldCol = field('yieldRate') || 'YIELD_RATE';
  return rows.map(function (row) {
    var copy = Object.assign({}, row);
    if (copy[admitCol] != null) copy[admitCol] = scaleSqlRatioToInstitution(num(copy[admitCol]), 'admit');
    if (copy[yieldCol] != null) copy[yieldCol] = scaleSqlRatioToInstitution(num(copy[yieldCol]), 'yield');
    if (copy.ENDOWMENT_PER_FTE != null) copy.ENDOWMENT_PER_FTE = num(copy.ENDOWMENT_PER_FTE);
    return copy;
  });
}

function peerCountNote(rows) {
  var counts = rows.map(function (row) { return num(row.PEER_N); }).filter(function (value) { return value != null; });
  if (!counts.length) return '';
  var min = Math.min.apply(null, counts);
  var max = Math.max.apply(null, counts);
  if (min === max) {
    return 'Peer institutions (excludes selected): ' + min + ' per year.';
  }
  return 'Peer institution count varies by year (' + min + '–' + max + '). Selected institution excluded.';
}

function sqlDistinctReportCount(column, outAlias) {
  return 'COUNT(DISTINCT CASE WHEN ' + column + ' IS NOT NULL THEN INSTNM END) AS ' + outAlias;
}

function buildPeerAggregateSql(sample, mineRows) {
  if (state.peerQueryBlocked) return '';
  var where = peerWhereIpedsResolved();
  var years = peerYearInList(mineRows);
  if (!where || !years) return '';
  var apps = field('applications');
  var adm = field('admissions');
  var enr = field('enrollment');
  var admitOut = field('admitRate') || 'ADMIT_RATE';
  var yieldOut = field('yieldRate') || 'YIELD_RATE';
  var tuition = field('tuition');
  var ntr = field('ntr');
  var discount = field('discount');
  var pell = field('pell');
  var endow = field('endowment');
  var giving = field('giving');
  var fte = field('fte');
  var opex = field('opex');
  var phil = field('philanthropic') || giving;
  var selects = ['SURVEY_YEAR', 'COUNT(DISTINCT INSTNM) AS PEER_N'];
  if (apps) selects.push('AVG(' + apps + ') AS ' + apps);
  if (adm) selects.push('AVG(' + adm + ') AS ' + adm);
  if (enr) selects.push('AVG(' + enr + ') AS ' + enr);
  if (apps && adm) selects.push(sqlPairRatio(adm, apps, admitOut));
  if (enr && adm) selects.push(sqlPairRatio(enr, adm, yieldOut));
  if (tuition) selects.push('AVG(' + tuition + ') AS ' + tuition);
  if (ntr) selects.push('AVG(' + ntr + ') AS ' + ntr);
  if (discount && enr) {
    selects.push(sqlWeightedMean(discount, enr, discount));
    selects.push(sqlDistinctReportCount(discount, 'DISCOUNT_REPORT_N'));
  }
  if (pell && enr) {
    selects.push(sqlWeightedMean(pell, enr, pell));
    selects.push(sqlDistinctReportCount(pell, 'PGRNT_REPORT_N'));
  }
  if (endow) selects.push('AVG(' + endow + ') AS ' + endow);
  if (giving) selects.push('AVG(' + giving + ') AS ' + giving);
  if (fte) selects.push('AVG(' + fte + ') AS ' + fte);
  if (endow && fte) selects.push(sqlPairRatio(endow, fte, 'ENDOWMENT_PER_FTE'));
  if (opex) selects.push('AVG(' + opex + ') AS ' + opex);
  if (phil && phil !== giving) selects.push('AVG(' + phil + ') AS ' + phil);
  return 'SELECT ' + selects.join(', ') + ' FROM ' + CONFIG.ipedsAlias +
    ' WHERE ' + where + ' AND SURVEY_YEAR IN (' + years + ') GROUP BY SURVEY_YEAR ORDER BY SURVEY_YEAR';
}

function activeFilterCount() {
  return FILTERS.reduce(function (sum, def) {
    if (def.single) return sum;
    return sum + ((state.filters[def.key] && state.filters[def.key].length) || 0);
  }, 0);
}

function metricColumns() {
  var cols = ['INSTNM', 'SURVEY_YEAR'];
  Object.keys(state.fields).forEach(function (key) {
    if (state.fields[key] && cols.indexOf(state.fields[key]) === -1) cols.push(state.fields[key]);
  });
  ['STABBR_VALUE', 'CONTROL_VALUE', 'OBEREG_VALUE', 'CONFERENCE', 'SELECTIVITY_CATEGORY'].forEach(function (col) {
    if (hasColumn(col) && cols.indexOf(col) === -1) cols.push(col);
  });
  return cols.join(', ');
}

function prepare(rows) {
  var admit = field('admitRate');
  var yieldCol = field('yieldRate');
  var apps = field('applications');
  var adm = field('admissions');
  var enr = field('enrollment');
  var endow = field('endowment');
  var fte = field('fte');
  var admitOut = admit || 'ADMIT_RATE';
  var yieldOut = yieldCol || 'YIELD_RATE';
  return rows.map(function (row) {
    var copy = Object.assign({}, row);
    if (!admit && apps && adm && copy[admitOut] == null) {
      var applications = num(copy[apps]);
      var admissions = num(copy[adm]);
      copy[admitOut] = applications == null || !applications ? null : admissions / applications;
    }
    if (!yieldCol && adm && copy[yieldOut] == null) {
      var enrolled = num(copy[enr]);
      var admitted = num(copy[adm]);
      copy[yieldOut] = enrolled == null || !admitted ? null : enrolled / admitted;
    }
    if (endow && fte && num(copy[fte])) {
      var endowment = num(copy[endow]);
      copy.ENDOWMENT_PER_FTE = endowment == null ? null : endowment / num(copy[fte]);
    }
    return copy;
  });
}

function rowsForYear(rows, year) {
  if (!year) return rows;
  return rows.filter(function (row) { return str(row.SURVEY_YEAR) === String(year); });
}

function series(rows, column) {
  return rows.map(function (row) { return num(row[column]); });
}

function asPercent(values) {
  var max = 0;
  values.forEach(function (value) { if (value != null && value > max) max = value; });
  var scale = max > 0 && max <= 1.5;
  return values.map(function (value) { return value == null ? null : (scale ? value * 100 : value); });
}

function yearsOf(rows) {
  return rows.map(function (row) { return str(row.SURVEY_YEAR); });
}

function surveyYearSortKey(label) {
  var n = parseInt(String(label).replace(/\D/g, ''), 10);
  return isFinite(n) ? n : 0;
}

function tableIndicesNewestYearFirst(labels) {
  return labels.map(function (_, index) { return index; }).sort(function (a, b) {
    return surveyYearSortKey(labels[b]) - surveyYearSortKey(labels[a]);
  });
}

function chartColors() {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return dark
    ? [cssVar('--cat-1'), cssVar('--series-institution'), cssVar('--series-admitted')]
    : [cssVar('--text-dim'), cssVar('--series-institution'), cssVar('--series-peer')];
}

function chartBarColor(index, total, isPeer) {
  var inst = [cssVar('--series-institution'), cssVar('--series-institution-2'), cssVar('--series-institution-3')];
  var peer = [cssVar('--series-peer'), cssVar('--series-peer-2'), cssVar('--series-peer-3')];
  var palette = isPeer ? peer : inst;
  if (total <= 1) return palette[0];
  return palette[index % palette.length];
}

function chartAdvPalette(isPeer) {
  var bar = isPeer
    ? [cssVar('--series-peer'), cssVar('--series-peer-2'), cssVar('--series-peer-3')]
    : [cssVar('--series-institution'), cssVar('--series-institution-2'), cssVar('--series-institution-3')];
  return {
    bar: bar,
    line: isPeer ? cssVar('--series-peer-3') : cssVar('--series-peer'),
    area: isPeer ? 'rgba(111, 191, 176, 0.28)' : 'rgba(255, 209, 0, 0.18)',
    accent: bar[0]
  };
}

function formatChartCurrency(value) {
  if (value == null || !isFinite(value)) return '';
  var n = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(n)) return '';
  var abs = Math.abs(n);
  if (abs >= 1e9) return '$' + (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1e3) return '$' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return '$' + Math.round(n).toLocaleString();
}

function formatCompactCount(value) {
  if (value == null || !isFinite(value)) return '';
  var n = Number(value);
  var abs = Math.abs(n);
  var trim = function (text) { return String(text).replace(/\.0$/, ''); };
  if (abs >= 1e9) return trim((n / 1e9).toFixed(1)) + 'B';
  if (abs >= 1e6) return trim((n / 1e6).toFixed(1)) + 'M';
  if (abs >= 1e3) return trim((n / 1e3).toFixed(1)) + 'K';
  return Math.round(n).toLocaleString();
}

function formatAxisValue(value, format) {
  if (value == null || !isFinite(Number(value))) return '';
  if (format === 'currency') return formatChartCurrency(value);
  if (format === 'percent') return Number(value).toFixed(1).replace(/\.0$/, '') + '%';
  return formatCompactCount(value);
}

function valueFormatFor(item) {
  if (!item) return 'count';
  if (item.format) return item.format;
  if (item.percent) return 'percent';
  var blob = ((item.label || '') + ' ' + (item.column || '')).toLowerCase();
  if (/tuition|endow|giving|revenue|expense|opex|philanthrop|ntr|dollar/.test(blob)) return 'currency';
  return 'count';
}

function peerSeriesLabel(label, isCmp) {
  if (!isCmp) return label;
  if (/peer average/i.test(label)) return label;
  return label + ' · ' + peerLegendTag();
}

function seriesSpikeNote(labels, values) {
  var nums = values.filter(function (v) { return v != null && isFinite(v); });
  if (nums.length < 4) return '';
  var sorted = nums.slice().sort(function (a, b) { return a - b; });
  var mid = sorted[Math.floor(sorted.length / 2)];
  var max = Math.max.apply(null, nums);
  if (!mid || max < mid * 2.5) return '';
  var idx = values.indexOf(max);
  if (idx < 0) return '';
  return 'Note: ' + labels[idx] + ' sits well above the other years in this series.';
}


function paddedExtent(values, pad) {
  var nums = (values || []).filter(function (value) { return value != null && isFinite(value); });
  if (!nums.length) return null;
  var min = Math.min.apply(null, nums);
  var max = Math.max.apply(null, nums);
  var span = max - min;
  if (!span) span = Math.abs(max) || 1;
  var portion = pad == null ? 0.05 : pad;
  return { min: min - span * portion, max: max + span * portion };
}

function positiveCapExtent(values) {
  var nums = (values || []).filter(function (value) { return value != null && isFinite(value) && value >= 0; });
  if (!nums.length) return { min: 0, max: 1, cap: null };
  var sorted = nums.slice().sort(function (a, b) { return a - b; });
  var max = sorted[sorted.length - 1];
  var index = Math.max(0, Math.ceil(sorted.length * 0.9) - 1);
  var typical = sorted[index];
  var cap = max > typical * 1.6 ? typical : null;
  var axisMax = cap ? typical * 1.18 : (max * 1.08 || 1);
  return { min: 0, max: axisMax, cap: cap };
}

function niceCeiling(value) {
  if (!(value > 0) || !isFinite(value)) return 1;
  var exp = Math.floor(Math.log10(value));
  var pow = Math.pow(10, exp);
  var steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  var i;
  for (i = 0; i < steps.length; i++) {
    var candidate = steps[i] * pow;
    if (candidate >= value * 0.995) return candidate;
  }
  return 10 * pow;
}

function logTickValues(min, max) {
  var ticks = [];
  if (!(min > 0) || !(max > 0)) return ticks;
  var exp = Math.floor(Math.log10(min));
  var limit = Math.ceil(Math.log10(max));
  var e;
  for (e = exp; e <= limit; e++) {
    [1, 3].forEach(function (mult) {
      var value = mult * Math.pow(10, e);
      if (value >= min * 0.98 && value <= max * 1.02) ticks.push(value);
    });
  }
  return ticks;
}

function buildTableHtmlFromSpec(spec) {
  if (!spec) return '';
  if (spec.kind === 'horizontal') {
    var table = '<table class="preview-table"><thead><tr><th>Institution</th><th>' +
      escapeHtml(spec.valueLabel || 'Value') + '</th></tr></thead><tbody>';
    (spec.labels || []).forEach(function (name, index) {
      var value = spec.values[index];
      table += '<tr><td>' + escapeHtml(name) + '</td><td>' +
        (value == null ? '—' : escapeHtml(formatAxisValue(value, spec.format || 'count'))) + '</td></tr>';
    });
    return table + '</tbody></table>';
  }
  if (spec.kind === 'trend') {
    return overlayTableHtml(spec.labels || [], (spec.datasets || []).map(function (item) {
      var map = yearValueMap(spec.rows || [], item.column, !!item.percent);
      return {
        label: item.label,
        percent: !!item.percent,
        values: (spec.labels || []).map(function (year) { return map[year] == null ? null : map[year]; })
      };
    }), spec.peerNote || '');
  }
  return '';
}

function setDetailTable(canvasId, html) {
  if (!detailStore[canvasId]) detailStore[canvasId] = {};
  detailStore[canvasId].tableHtml = html || '';
  detailStore[canvasId].baseTableHtml = html || '';
}

function stashTableSpec(canvasId, spec) {
  if (!detailStore[canvasId]) detailStore[canvasId] = {};
  detailStore[canvasId].tableSpec = spec;
  setDetailTable(canvasId, buildTableHtmlFromSpec(spec));
}

function getDetailTableHtml(canvasId) {
  var spec = detailStore[canvasId];
  if (!spec || spec.empty || spec.error) return '';
  if (spec.tableHtml) return spec.tableHtml;
  if (spec.baseTableHtml) return spec.baseTableHtml;
  if (spec.tableSpec) {
    spec.tableHtml = buildTableHtmlFromSpec(spec.tableSpec);
    spec.baseTableHtml = spec.tableHtml;
    return spec.tableHtml;
  }
  return '';
}

function bindTrendDetailStore(canvasId, rows, labels, datasetDefs, opts) {
  opts = opts || {};
  var isCmp = canvasId.slice(-4) === '-cmp';
  var hasPeerN = rows.some(function (row) { return row.PEER_N != null; });
  if (!detailStore[canvasId]) detailStore[canvasId] = {};
  detailStore[canvasId].explore = {
    kind: 'trend',
    datasetDefs: datasetDefs.map(function (item) {
      return {
        label: item.label,
        column: item.column,
        percent: !!item.percent,
        axis: item.axis || 'y'
      };
    }),
    percent: !!opts.percent
  };
  delete detailStore[canvasId].detailCompareConfig;
  stashTableSpec(canvasId, {
    kind: 'trend',
    labels: labels,
    datasets: datasetDefs.map(function (item) {
      return { label: item.label, column: item.column, percent: !!item.percent };
    }),
    rows: rows,
    percent: !!opts.percent,
    peerNote: hasPeerN ? peerCountNote(rows) : '',
    showPeerMethodology: isCmp,
    coverageSpec: opts.coverageSpec || null
  });
}

function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
  if (id === 'chart-nested') destroyChart('chart-nested-enrolled');
}

function chartBarRadius(horizontal) {
  if (horizontal) {
    return { topRight: 1, bottomRight: 1, topLeft: 0, bottomLeft: 0 };
  }
  return { topLeft: 1, topRight: 1, bottomLeft: 0, bottomRight: 0 };
}

var chartDrawSequence = 0;

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function barMotionDelay(ctx, delayBase, staggerMs, profile) {
  if (ctx.type !== 'data') return 0;
  var datasetPad = ctx.datasetIndex * Math.round(staggerMs * 0.75);
  var step = profile === 'detail' ? Math.round(staggerMs * 0.55) : staggerMs;
  return delayBase + ctx.dataIndex * step + datasetPad;
}

function buildBarChartAnimations(horizontal, duration, staggerMs, delayBase, profile) {
  var prop = horizontal ? 'x' : 'y';
  var scaleId = horizontal ? 'x' : 'y';
  var growEasing = 'easeOutQuart';
  var delayFn = function (ctx) {
    return barMotionDelay(ctx, delayBase, staggerMs, profile);
  };
  return {
    [prop]: {
      type: 'number',
      properties: [prop],
      from: function (ctx) {
        if (ctx.type !== 'data') return;
        var scale = ctx.chart.scales[scaleId];
        if (!scale) return;
        var base = scale.getPixelForValue(0);
        if (horizontal) return base - 10;
        return base + 8;
      },
      duration: duration,
      delay: delayFn,
      easing: growEasing
    }
  };
}

function applyBarChartMotion(config, motion) {
  if (!config || config.type !== 'bar') return;
  motion = motion || { profile: 'panel', delayBase: 0 };
  config.options = config.options || {};
  if (prefersReducedMotion()) {
    config.options.animation = false;
    config.options.animations = {};
    return;
  }
  var profile = motion.profile || 'panel';
  var delayBase = motion.delayBase || 0;
  var duration = profile === 'detail' ? 680 : profile === 'replay' ? 520 : 480;
  var stagger = profile === 'detail' ? 28 : 20;
  var tail = profile === 'detail' ? 320 : profile === 'replay' ? 180 : 160;
  config.options.animation = {
    duration: duration + delayBase + tail,
    easing: 'easeOutQuart'
  };
  var horizontal = !!(config.options.indexAxis === 'y');
  config.options.animations = Object.assign(
    {},
    config.options.animations || {},
    buildBarChartAnimations(horizontal, duration, stagger, delayBase, profile)
  );
}

function polishBarChartConfig(config, motion) {
  if (!config || config.type !== 'bar' || !config.data || !config.data.datasets) return;
  var horizontal = !!(config.options && config.options.indexAxis === 'y');
  var count = config.data.datasets.length || 1;
  config.data.datasets.forEach(function (ds, index) {
    if (ds.type && ds.type !== 'bar') return;
    if (!ds.borderRadius) ds.borderRadius = chartBarRadius(horizontal);
    ds.borderSkipped = horizontal ? 'left' : 'bottom';
    ds.borderWidth = ds.borderWidth == null ? 0 : ds.borderWidth;
    if (ds.maxBarThickness == null) {
      ds.maxBarThickness = horizontal ? 26 : (count > 2 ? 20 : count > 1 ? 26 : 34);
    }
    if (!ds.hoverBackgroundColor && ds.backgroundColor) ds.hoverBackgroundColor = ds.backgroundColor;
  });
  config.options = config.options || {};
  config.options.datasets = config.options.datasets || {};
  config.options.datasets.bar = Object.assign({
    barPercentage: count > 3 ? 0.7 : 0.78,
    categoryPercentage: count > 1 ? 0.8 : 0.74,
    inflateAmount: 'auto'
  }, config.options.datasets.bar || {});
  config.options.layout = Object.assign({ padding: { top: 6, right: 10, bottom: 2, left: 6 } }, config.options.layout || {});
  config.options.interaction = Object.assign({ mode: 'index', intersect: false }, config.options.interaction || {});
  applyBarChartMotion(config, motion);
}

function chartHoverTipEl() {
  var el = document.getElementById('chart-hover-tip');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'chart-hover-tip';
  el.className = 'chart-hover-tip';
  el.setAttribute('role', 'tooltip');
  el.hidden = true;
  document.body.appendChild(el);
  return el;
}

function chartHoverTooltipExternal(context) {
  var tip = chartHoverTipEl();
  var tt = context.tooltip;
  if (!tt || tt.opacity === 0 || !tt.dataPoints || !tt.dataPoints.length) {
    tip.hidden = true;
    return;
  }
  var title = (tt.title || []).map(function (line) { return escapeHtml(String(line)); }).join('<br>');
  var body = (tt.body || []).map(function (item, index) {
    var colors = tt.labelColors && tt.labelColors[index];
    var fill = colors && colors.backgroundColor;
    var stroke = colors && colors.borderColor;
    if (!fill || fill === 'transparent') fill = stroke || 'transparent';
    var swatch = '<i style="background:' + fill + ';border-color:' + (stroke || fill) + '"></i>';
    var lines = (item.lines || []).map(function (line) { return escapeHtml(String(line)); }).join('<br>');
    return '<div class="chart-hover-tip-row">' + swatch + '<span>' + lines + '</span></div>';
  }).join('');
  tip.innerHTML = (title ? '<div class="chart-hover-tip-title">' + title + '</div>' : '') + body;
  tip.hidden = false;
  var rect = context.chart.canvas.getBoundingClientRect();
  var left = rect.left + tt.caretX + 16;
  var top = rect.top + tt.caretY - tip.offsetHeight / 2;
  if (left + tip.offsetWidth > window.innerWidth - 8) left = rect.left + tt.caretX - tip.offsetWidth - 16;
  if (left < 8) left = 8;
  if (top + tip.offsetHeight > window.innerHeight - 8) top = window.innerHeight - tip.offsetHeight - 8;
  if (top < 8) top = 8;
  tip.style.left = Math.round(left) + 'px';
  tip.style.top = Math.round(top) + 'px';
}

function themeChart(config, motion) {
  var color = cssVar('--text');
  var mute = cssVar('--text-mute');
  var grid = cssVar('--border');
  var chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: color,
          boxWidth: 12,
          font: { family: 'Inter, Roboto, sans-serif', size: 13 },
          padding: 14,
          usePointStyle: true,
          pointStyle: 'rectRounded'
        }
      },
      tooltip: {
        backgroundColor: cssVar('--header-bg'),
        titleColor: cssVar('--header-text'),
        bodyColor: cssVar('--header-text'),
        padding: 10,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        ticks: { color: mute, maxRotation: 0, autoSkip: true, padding: 8 },
        grid: { display: false },
        border: { display: false }
      },
      y: {
        ticks: { color: mute, padding: 8 },
        grid: { color: grid, drawBorder: false, lineWidth: 1, tickLength: 0 },
        border: { display: false }
      }
    }
  };
  if (config.type === 'line') {
    chartDefaults.animation = { duration: 560, easing: 'easeOutQuart' };
  } else if (config.type !== 'bar') {
    chartDefaults.animation = false;
  }
  config.options = Object.assign(chartDefaults, config.options || {});
  config.options.plugins = config.options.plugins || {};
  var ownTip = config.options.plugins.tooltip || {};
  var tipDefaults = {
    animation: false,
    backgroundColor: cssVar('--header-bg'),
    titleColor: cssVar('--header-text'),
    bodyColor: cssVar('--header-text'),
    padding: 10,
    cornerRadius: 10,
    displayColors: true,
    boxPadding: 4
  };
  if (!ownTip.external) {
    tipDefaults.enabled = false;
    tipDefaults.external = chartHoverTooltipExternal;
  }
  config.options.plugins.tooltip = Object.assign(tipDefaults, ownTip);
  var looseHover = config.type !== 'bubble' && config.type !== 'scatter';
  var hover = looseHover
    ? { mode: 'index', axis: 'x', intersect: false }
    : { mode: 'nearest', intersect: false };
  config.options.interaction = Object.assign(hover, config.options.interaction || {});
  config.options.interaction.intersect = false;
  config.options.hover = Object.assign({}, hover, config.options.hover || {});
  config.options.hover.intersect = false;
  (config.data.datasets || []).forEach(function (ds) {
    if (ds.pointHitRadius == null) ds.pointHitRadius = looseHover ? 24 : 14;
  });
  var needsRight = (config.data.datasets || []).some(function (set) { return set.yAxisID === 'y1'; });
  if (needsRight && config.options.scales) {
    config.options.scales.y1 = Object.assign({
      position: 'right',
      beginAtZero: true,
      ticks: { color: mute, padding: 8 },
      grid: { drawOnChartArea: false },
      border: { display: false }
    }, config.options.scales.y1 || {});
  }
  if (config.type === 'bar') polishBarChartConfig(config, motion);
  applyAnalyticalScales(config);
  return config;
}

function applyAnalyticalScales(config) {
  if (!config.options) config.options = {};
  if (!config.options.scales) config.options.scales = {};
  var labels = (config.data && config.data.labels) || [];
  var yearAxis = labels.length && labels.every(function (label) { return /^\d{4}$/.test(String(label)); });
  var font = { family: 'Inter, Roboto, sans-serif', size: 13 };
  ['x', 'y', 'y1'].forEach(function (key) {
    if (!config.options.scales[key] && key === 'y1') return;
    if (!config.options.scales[key]) config.options.scales[key] = {};
    var axis = config.options.scales[key];
    var explicitTickColor = axis.ticks && axis.ticks.color;
    axis.ticks = axis.ticks || {};
    axis.ticks.color = explicitTickColor || axisInk();
    axis.ticks.font = font;
    axis.ticks.padding = axis.ticks.padding || 6;
    axis.border = { display: false };
    if (key === 'x') {
      axis.grid = { display: false };
      if (yearAxis) {
        axis.ticks.autoSkip = false;
        axis.ticks.maxRotation = 0;
      }
      if (config.options.indexAxis === 'y' && axis.beginAtZero !== false) axis.beginAtZero = true;
    } else {
      var categoryAxis = config.options.indexAxis === 'y' && key === 'y';
      if (!categoryAxis && axis.beginAtZero !== false) axis.beginAtZero = true;
      if (key === 'y') {
        var grid = axis.grid || {};
        if (typeof grid.color !== 'function') grid.color = cssVar('--border');
        grid.drawBorder = false;
        if (typeof grid.lineWidth !== 'function') grid.lineWidth = 1;
        grid.tickLength = 0;
        if (grid.display == null) grid.display = true;
        axis.grid = grid;
      }
    }
  });
  config.options.plugins = config.options.plugins || {};
  config.options.plugins.legend = config.options.plugins.legend || {};
  config.options.plugins.legend.labels = Object.assign({
    color: cssVar('--text'),
    boxWidth: 10,
    padding: 10,
    font: font
  }, config.options.plugins.legend.labels || {});
  config.options.plugins.legend.labels.font = config.options.plugins.legend.compact
    ? { family: 'Inter, Roboto, sans-serif', size: 11 }
    : font;
  var sets = (config.data && config.data.datasets) || [];
  if (sets.length < 2 && config.options.plugins.legend.display == null) {
    config.options.plugins.legend.display = false;
  }
}

function animateChartWrapEnter(canvas) {
  if (!canvas || prefersReducedMotion()) return;
  var wrap = canvas.parentNode;
  if (!wrap || !wrap.classList.contains('chart-wrap')) return;
  wrap.classList.remove('chart-wrap--animate-in');
  void wrap.offsetWidth;
  wrap.classList.add('chart-wrap--animate-in');
}

function pulseDetailChartWrap() {
  if (prefersReducedMotion()) return;
  var wrap = $('detail-chart-wrap');
  if (!wrap) return;
  wrap.classList.remove('is-chart-enter');
  void wrap.offsetWidth;
  wrap.classList.add('is-chart-enter');
}

function createDetailBarChart(config) {
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
  detailChart = new Chart($('detail-canvas'), themeChart(config, { profile: 'detail' }));
  pulseDetailChartWrap();
  return detailChart;
}

function replayPanelChartMotion(canvasId) {
  if (!canvasId || prefersReducedMotion()) return;
  var chart = charts[canvasId];
  if (!chart) return;
  var canvas = $(canvasId);
  var panel = canvas && canvas.closest('.panel');
  if (panel) {
    panel.classList.remove('panel--chart-focus');
    void panel.offsetWidth;
    panel.classList.add('panel--chart-focus');
    window.setTimeout(function () { panel.classList.remove('panel--chart-focus'); }, 720);
  }
  try {
    chart.stop();
    chart.reset();
    chart.update();
  } catch (err) { /* Chart may be mid-teardown */ }
}

function applyThemeToChartInstance(chart) {
  if (!chart || !chart.options) return;
  var color = cssVar('--text');
  var mute = cssVar('--text-mute');
  var grid = cssVar('--border');
  var legend = chart.options.plugins && chart.options.plugins.legend;
  if (legend && legend.labels) legend.labels.color = color;
  var scales = chart.options.scales;
  if (scales) {
    ['x', 'y', 'y1'].forEach(function (key) {
      var axis = scales[key];
      if (!axis) return;
      if (axis.ticks) axis.ticks.color = mute;
      if (axis.grid) {
        if (key === 'x') axis.grid.display = false;
        else if (key === 'y1') axis.grid.drawOnChartArea = false;
        else axis.grid.color = grid;
      }
    });
  }
  chart.update('none');
}

function repaintChartsForTheme() {
  var enrolledColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#D5D3CC' : '#5C5C66';
  Object.keys(charts).forEach(function (id) {
    var chart = charts[id];
    if (chart && chart.rowCharts) {
      chart.rowCharts.forEach(applyThemeToChartInstance);
      return;
    }
    if (id === 'chart-nested-enrolled') {
      (chart.data.datasets || []).forEach(function (ds) {
        ds.borderColor = enrolledColor;
        ds.pointBackgroundColor = enrolledColor;
      });
    }
    applyThemeToChartInstance(chart);
  });
  [detailChart, detailNestedChart].forEach(function (chart) {
    if (!chart) return;
    if (chart.canvas && chart.canvas.id === 'detail-nested-enrolled') {
      (chart.data.datasets || []).forEach(function (ds) {
        ds.borderColor = enrolledColor;
        ds.pointBackgroundColor = enrolledColor;
      });
    }
    applyThemeToChartInstance(chart);
  });
}

function loadingDotsInner(label) {
  return '<span class="chart-loading-dot" aria-hidden="true"></span>' +
    '<span class="chart-loading-dot" aria-hidden="true"></span>' +
    '<span class="chart-loading-dot" aria-hidden="true"></span>' +
    '<span class="chart-loading-label">' + escapeHtml(label || 'Loading') + '</span>';
}

function loadingDotsMarkup(label) {
  return '<div class="chart-loading" role="status" aria-label="' + escapeHtml(label || 'Loading') + '">' +
    loadingDotsInner(label) + '</div>';
}

function clearChartLoading(id) {
  var canvas = $(id);
  if (!canvas) return;
  var wrap = canvas.parentNode;
  if (!wrap) return;
  var loader = wrap.querySelector('.chart-loading');
  if (loader) loader.remove();
  wrap.removeAttribute('aria-busy');
}

function showChartLoading(id) {
  var canvas = $(id);
  if (!canvas) return;
  destroyChart(id);
  canvas.style.display = 'none';
  var wrap = canvas.parentNode;
  if (!wrap) return;
  var empty = wrap.querySelector('.chart-empty');
  if (empty) empty.remove();
  var loader = wrap.querySelector('.chart-loading');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'chart-loading';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-label', 'Loading chart');
    loader.innerHTML = loadingDotsInner('Loading');
    wrap.appendChild(loader);
  }
  wrap.setAttribute('aria-busy', 'true');
  syncChartWrapState(id, 'loading');
}

var CHART_LOAD_STAGGER_MS = 52;

function isDashboardDataPage(page) {
  return page === 'admissions' || page === 'advancement' || page === 'keymetrics';
}

function chartIdsForPage(page) {
  if (page === 'keymetrics') return [];
  if (page === 'advancement') {
    return ['chart-adv-top'];
  }
  if (page === 'admissions') {
    return [
      'chart-index', 'chart-nested', 'chart-yield', 'chart-yield-rate',
      'chart-top', 'chart-discount', 'chart-discount-yoy', 'chart-pell', 'chart-pell-yoy', 'chart-price',
      'chart-residence'
    ];
  }
  return [];
}

function beginChartLoadingWave(page) {
  chartDrawSequence = 0;
  var ids = chartIdsForPage(page);
  ids.forEach(function (id, index) {
    window.setTimeout(function () { showChartLoading(id); }, index * CHART_LOAD_STAGGER_MS);
  });
  if (page === 'advancement') showAdvancementPeerDependentLoading();
}

function beginDashboardChartLoadingWave() {
  chartDrawSequence = 0;
  var tick = 0;
  ['admissions', 'advancement'].forEach(function (page) {
    chartIdsForPage(page).forEach(function (id) {
      var delay = tick * CHART_LOAD_STAGGER_MS;
      tick += 1;
      window.setTimeout(function () { showChartLoading(id); }, delay);
    });
  });
  showAdvancementPeerDependentLoading();
}

function advancementPeerListPending() {
  return !!state.peerInstitutionRowsPending;
}

function advancementPeerListErrorMessage() {
  if (state.peerCompareOn === false) return 'Comparison is off.';
  if (state.peerQueryBlocked) return state.peerError || PEER_PICK_FILTERS_MSG;
  return state.top10Error || '';
}

function showAdvancementPeerDependentLoading() {
  var stand = $('adv-stand-mount');
  if (stand) {
    stand.className = 'adv-stand-mount adv-stand-mount--loading';
    stand.setAttribute('aria-busy', 'true');
    stand.innerHTML = loadingDotsMarkup('Loading peer comparison');
  }
  var kpi = $('advancement-kpi-strip');
  if (kpi) {
    kpi.classList.remove('hidden');
    kpi.classList.add('kpi-strip--loading');
    kpi.setAttribute('aria-busy', 'true');
    kpi.innerHTML = loadingDotsMarkup('Loading peer comparison');
  }
  var takeStand = $('adv-takeaway-stand');
  var takeChange = $('adv-takeaway-change');
  if (takeStand) takeStand.textContent = '';
  if (takeChange) takeChange.textContent = '';
  var explorerWrap = $('adv-explorer-chart-wrap');
  if (explorerWrap) {
    explorerWrap.classList.add('adv-explorer-chart-wrap--loading');
    explorerWrap.setAttribute('aria-busy', 'true');
    explorerWrap.innerHTML = loadingDotsMarkup('Loading trend data');
  }
  var side = $('adv-explorer-side');
  if (side) side.innerHTML = '';
}

function showAdvancementPeerDependentError(message) {
  message = message || 'Peer data could not load.';
  var stand = $('adv-stand-mount');
  if (stand) {
    stand.className = 'adv-stand-mount adv-stand-mount--error';
    stand.removeAttribute('aria-busy');
    stand.innerHTML = '<p class="chart-empty">' + escapeHtml(message) + '</p>';
  }
  var kpi = $('advancement-kpi-strip');
  if (kpi) {
    kpi.classList.remove('kpi-strip--loading');
    kpi.removeAttribute('aria-busy');
    kpi.classList.remove('hidden');
    kpi.innerHTML = '<p class="chart-empty">' + escapeHtml(message) + '</p>';
  }
}

function positionChartHoverTipClient(clientX, clientY) {
  var tip = chartHoverTipEl();
  tip.hidden = false;
  var left = clientX + 16;
  var top = clientY - tip.offsetHeight / 2;
  if (left + tip.offsetWidth > window.innerWidth - 8) left = clientX - tip.offsetWidth - 16;
  if (left < 8) left = 8;
  if (top + tip.offsetHeight > window.innerHeight - 8) top = window.innerHeight - tip.offsetHeight - 8;
  if (top < 8) top = 8;
  tip.style.left = Math.round(left) + 'px';
  tip.style.top = Math.round(top) + 'px';
}

function hideChartHoverTip() {
  var tip = chartHoverTipEl();
  tip.hidden = true;
}

function peerAverageFromValues(peerValues) {
  var nums = sortedNums(peerValues);
  if (!nums.length) return null;
  return nums.reduce(function (sum, value) { return sum + value; }, 0) / nums.length;
}

function failChartLoadingWave(page, message) {
  chartIdsForPage(page).forEach(function (id) {
    showChartError(id, message || 'Query failed.');
  });
}

function failDashboardChartLoadingWave(message) {
  ['admissions', 'advancement'].forEach(function (page) {
    failChartLoadingWave(page, message);
  });
  if (advancementPeerListPending()) {
    showAdvancementPeerDependentError('Peer data couldn\'t load: ' + (message || 'Query failed.'));
  }
}

function ensureAnalyticalPlugin() {
  if (window.__ipedsMarks || typeof Chart === 'undefined') return;
  window.__ipedsMarks = true;
  Chart.register({
    id: 'ipedsAnalyticalMarks',
    afterDatasetsDraw: function (chart) {
      var opts = chart.options.plugins && chart.options.plugins.ipedsMarks;
      if (!opts) return;
      var ctx = chart.ctx;
      var horizontal = chart.options.indexAxis === 'y';
      chart.data.datasets.forEach(function (ds, di) {
        var meta = chart.getDatasetMeta(di);
        if (!meta || meta.hidden) return;
        var lastIdx = -1;
        (ds.data || []).forEach(function (v, i) {
          if (v != null && typeof v !== 'object') lastIdx = i;
        });
        meta.data.forEach(function (el, i) {
          var v = ds.data[i];
          if (!el || v == null) return;
          if (opts.pointNames && v && v.name && (opts.pointNames !== 'institution' || di === chart.data.datasets.length - 1)) {
            ctx.save();
            ctx.fillStyle = cssVar('--text');
            ctx.font = '11px Inter, Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(v.name), el.x + (v.r || 6) + 4, el.y);
            ctx.restore();
            return;
          }
          if (typeof v === 'object') return;
          var show = (opts.barEnds && horizontal) ||
            (opts.labelDataset === di) ||
            (opts.latest && !horizontal && i === lastIdx && (ds.endLabel || opts.allSeries || di === 0));
          if (!show) return;
          var text = formatAxisValue(v, opts.format || 'count');
          ctx.save();
          ctx.fillStyle = cssVar('--text');
          ctx.font = '11px Inter, Roboto, sans-serif';
          if (opts.corner && !horizontal) {
            var corner = chart.chartArea;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text, corner.right - 4, corner.top - 22);
            ctx.restore();
            return;
          }
          if (opts.stagger) {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, el.x + 8, el.y + (di - 1.5) * 12);
          } else if (opts.labelDataset === di && !horizontal) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text, el.x, el.y - 3);
          } else if (!horizontal) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text, el.x, el.y - 8);
          } else {
            var xScale = chart.scales.x;
            var beyond = xScale && isFinite(xScale.max) && v > xScale.max * 1.001;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            if (beyond) {
              var edge = Math.min(el.x, chart.chartArea.right);
              ctx.strokeStyle = cssVar('--text');
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(edge - 8, el.y - 5);
              ctx.lineTo(edge - 3, el.y);
              ctx.lineTo(edge - 8, el.y + 5);
              ctx.moveTo(edge - 4, el.y - 5);
              ctx.lineTo(edge + 1, el.y);
              ctx.lineTo(edge - 4, el.y + 5);
              ctx.stroke();
              ctx.fillText(text, edge + 6, el.y);
            } else {
              ctx.fillText(text, el.x + 6, el.y);
            }
          }
          ctx.restore();
        });
      });
      if (opts.meanLine != null && isFinite(opts.meanLine) && horizontal && chart.scales.x) {
        var meanX = chart.scales.x.getPixelForValue(opts.meanLine);
        var area = chart.chartArea;
        ctx.save();
        ctx.strokeStyle = '#6FBFB0';
        ctx.fillStyle = '#5AA895';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(meanX, area.top);
        ctx.lineTo(meanX, area.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '11px Inter, Roboto, sans-serif';
        var meanLabel = opts.meanLabel || 'Peer avg';
        var meanLabelWidth = ctx.measureText(meanLabel).width;
        ctx.textBaseline = 'bottom';
        if (meanX + meanLabelWidth + 8 > area.right) {
          ctx.textAlign = 'right';
          ctx.fillText(meanLabel, meanX - 6, area.top - 2);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(meanLabel, meanX + 6, area.top - 2);
        }
        ctx.restore();
      }
    }
  });
  Chart.register({
    id: 'ipedsNotes',
    afterDatasetsDraw: function (chart) {
      var opts = chart.options.plugins && chart.options.plugins.ipedsNotes;
      if (!opts || prefersReducedMotion() && opts.skip) return;
      var ds = chart.data.datasets && chart.data.datasets[0];
      var meta = chart.getDatasetMeta(0);
      if (!ds || !meta || !meta.data || !chart.scales.x || !chart.scales.y) return;
      var ctx = chart.ctx;
      var points = [];
      (ds.data || []).forEach(function (value, index) {
        var el = meta.data[index];
        if (value == null || !el) return;
        points.push({ index: index, value: value, x: el.x, y: el.y });
      });
      if (points.length < 2) return;
      ctx.save();
      ctx.font = '11px Inter, Roboto, sans-serif';
      ctx.fillStyle = cssVar('--text-dim');
      ctx.strokeStyle = cssVar('--text-mute');
      if (opts.trend) {
        var n = points.length;
        var sumX = 0;
        var sumY = 0;
        var sumXY = 0;
        var sumXX = 0;
        points.forEach(function (pt) {
          sumX += pt.index;
          sumY += pt.value;
          sumXY += pt.index * pt.value;
          sumXX += pt.index * pt.index;
        });
        var denom = n * sumXX - sumX * sumX;
        if (denom) {
          var slope = (n * sumXY - sumX * sumY) / denom;
          var intercept = (sumY - slope * sumX) / n;
          var yScale = chart.scales.y;
          var x0 = chart.scales.x.getPixelForValue(points[0].index);
          var x1 = chart.scales.x.getPixelForValue(points[points.length - 1].index);
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(x0, yScale.getPixelForValue(intercept + slope * points[0].index));
          ctx.lineTo(x1, yScale.getPixelForValue(intercept + slope * points[points.length - 1].index));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      if (opts.outlier) {
        var nums = points.map(function (pt) { return pt.value; }).sort(function (a, b) { return a - b; });
        var mid = nums[Math.floor(nums.length / 2)];
        points.forEach(function (pt) {
          if (mid && pt.value > mid * 2.5) {
            var year = chart.data.labels[pt.index];
            ctx.fillText(String(year) + ' spike', pt.x + 6, pt.y - 8);
          }
        });
      }
      if (opts.yoy && points.length >= 2) {
        var last = points[points.length - 1];
        var prev = points[points.length - 2];
        if (prev.value) {
          var pct = ((last.value - prev.value) / Math.abs(prev.value)) * 100;
          var pctText = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
          if (opts.corner && chart.chartArea) {
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(pctText, chart.chartArea.right - 4, chart.chartArea.top - 6);
          } else {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(pctText, last.x, last.y + 12);
          }
        }
      }
      ctx.restore();
    }
  });
}


function drawChart(id, config) {
  ensureAnalyticalPlugin();
  destroyChart(id);
  var canvas = $(id);
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    showEmpty(id, 'Chart library did not load. Refresh the page or republish the card.');
    return;
  }
  var wrap = canvas.parentNode;
  clearChartLoading(id);
  var empty = wrap.querySelector('.chart-empty');
  if (empty) empty.remove();
  canvas.style.display = '';
  syncChartWrapState(id, 'data');
  var motionDelay = chartDrawSequence * 48;
  chartDrawSequence += 1;
  var plainData = cloneChartData(config.data);
  var chartType = config.type;
  var chartOptions = config.options || {};
  charts[id] = new Chart(canvas, themeChart(config, { profile: 'panel', delayBase: motionDelay }));
  animateChartWrapEnter(canvas);
  if (!detailStore[id] || detailStore[id].empty || detailStore[id].error) detailStore[id] = {};
  delete detailStore[id].empty;
  delete detailStore[id].error;
  detailStore[id].config = { type: chartType };
  detailStore[id].build = function () {
    return {
      type: chartType,
      data: cloneChartData(plainData),
      options: chartOptions
    };
  };
  clearAppBusyEarly();
}

function cloneChartData(data) {
  try {
    return JSON.parse(JSON.stringify(data || { labels: [], datasets: [] }));
  } catch (err) {
    return { labels: (data && data.labels) ? data.labels.slice() : [], datasets: [] };
  }
}

function showDetailFailure(message) {
  var table = $('detail-table');
  var wrap = $('detail-chart-wrap');
  if (wrap) wrap.style.display = 'none';
  if (table) {
    table.innerHTML = '<div class="detail-empty chart-empty chart-empty--error"><span class="chart-state-tag">Error</span><span class="chart-state-text">' +
      escapeHtml(message || 'This detail view could not be opened.') + '</span></div>';
  }
}

function emptyComparisonDraft() {
  var draft = {};
  ADMISSIONS_COMPARISON_KEYS.forEach(function (key) { draft[key] = []; });
  return draft;
}

function syncDetailExploreDraftFromFilters() {
  state.detailExploreDraft = emptyComparisonDraft();
  ADMISSIONS_COMPARISON_KEYS.forEach(function (key) {
    state.detailExploreDraft[key] = (state.filters[key] || []).slice();
  });
}

function detailExploreSupported(canvasId) {
  var spec = detailStore[canvasId];
  return !!(spec && spec.explore && spec.explore.kind === 'trend' && state.institution && state.connected.ipeds);
}

function detailInstitutionLocation() {
  var cache = state.paintCache;
  if (!cache || !cache.mine || !cache.mine.length) return '';
  for (var i = cache.mine.length - 1; i >= 0; i--) {
    var row = cache.mine[i];
    var loc = str(row.STABBR_VALUE) || str(row.STABBR);
    if (loc) return loc;
  }
  return '';
}

function detailTitleInstitutionPhrase() {
  if (!state.institution) return '';
  var loc = detailInstitutionLocation();
  return loc ? (state.institution + ', ' + loc) : state.institution;
}

function detailModalMetricTitle(canvasId) {
  var spec = detailStore[canvasId];
  if (spec && spec.title) return titleCaseLabel(spec.title);
  var source = $(canvasId);
  var card = source && source.closest('.panel');
  var raw = card && card.querySelector('.box-title')
    ? card.querySelector('.box-title').textContent.trim()
    : 'Details';
  return titleCaseLabel(raw);
}

function detailComparisonPartsFromDraft(draft) {
  var items = [];
  ADMISSIONS_COMPARISON_KEYS.forEach(function (key) {
    var def = filterByKey(key);
    if (!def) return;
    var vals = (draft && draft[key]) || [];
    if (!vals.length) return;
    var label = def.label.replace(/\s*-\s*Comparison\s*$/i, '');
    items.push({ label: label, text: vals.join('; ') });
  });
  return items;
}

function detailComparisonDisplay(draft, defaultPeerLabel) {
  var items = detailComparisonPartsFromDraft(draft);
  var lines = items.map(function (it) { return it.label + ': ' + it.text; });
  if (!items.length) {
    if (defaultPeerLabel) {
      return { vsShort: defaultPeerLabel, lines: ['Peer group: ' + defaultPeerLabel], multiple: false };
    }
    return {
      vsShort: 'peer group',
      lines: ['Default peer group from conference, state, and control.'],
      multiple: false
    };
  }
  var dimensionCount = items.length;
  var multiValue = items.some(function (it) { return it.text.indexOf(';') !== -1; });
  var joined = lines.join(' · ');
  if (dimensionCount > 1 || multiValue || joined.length > 56) {
    return { vsShort: titleCaseLabel('Multiple comparisons'), lines: lines, multiple: true };
  }
  return { vsShort: items[0].text, lines: lines, multiple: false };
}

function refreshDetailModalTitle(canvasId, comparing, defaultPeerLabel) {
  var titleEl = $('detail-title');
  if (!titleEl) return;
  var metric = detailModalMetricTitle(canvasId);
  var inst = detailTitleInstitutionPhrase();
  var base = inst ? (metric + ' - ' + inst) : metric;
  titleEl.innerHTML = '';
  titleEl.removeAttribute('data-export-title');
  if (!comparing) {
    titleEl.textContent = base;
    titleEl.setAttribute('data-export-title', base);
    return;
  }
  var comp = detailComparisonDisplay(state.detailExploreDraft, defaultPeerLabel);
  var vsShort = comp.vsShort;
  var fullTitle = base + " vs '" + vsShort + "'";
  titleEl.setAttribute('data-export-title', fullTitle);
  var textSpan = document.createElement('span');
  textSpan.className = 'detail-title-text';
  textSpan.textContent = fullTitle;
  titleEl.appendChild(textSpan);
  if (comp.multiple && comp.lines.length) {
    var wrap = document.createElement('span');
    wrap.className = 'detail-compare-info-wrap';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'detail-compare-info';
    btn.setAttribute('aria-label', 'Show comparison filters');
    btn.textContent = '?';
    var pop = document.createElement('span');
    pop.className = 'detail-compare-popover';
    pop.setAttribute('role', 'tooltip');
    comp.lines.forEach(function (line) {
      var row = document.createElement('div');
      row.className = 'detail-compare-popover-line';
      row.textContent = line;
      pop.appendChild(row);
    });
    wrap.appendChild(btn);
    wrap.appendChild(pop);
    titleEl.appendChild(document.createTextNode(' '));
    titleEl.appendChild(wrap);
  }
}

function detailFilterFieldMarkup(def) {
  return '<div class="field field-multi field-multi--comparison">' +
    '<span class="field-label" id="label-detail-' + def.key + '">' + escapeHtml(titleCaseLabel(def.label)) + '</span>' +
    '<div class="multi-select">' +
      '<button type="button" class="multi-select-trigger" id="trigger-detail-' + def.key + '" aria-expanded="false" aria-controls="menu-detail-' + def.key + '" aria-labelledby="label-detail-' + def.key + '">' +
        '<span id="trigger-label-detail-' + def.key + '">' + escapeHtml(def.allLabel) + '</span>' +
        '<span class="multi-select-caret" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="multi-select-menu" id="menu-detail-' + def.key + '" hidden role="group" aria-label="' + escapeHtml(titleCaseLabel(def.label)) + '"></div>' +
    '</div></div>';
}

function refreshDetailExploreMenus() {
  if (!state.detailExploreDraft) return;
  ADMISSIONS_COMPARISON_KEYS.forEach(function (key) {
    var def = filterByKey(key);
    if (!def) return;
    renderMultiMenu(def, optionsFor(def), 'detail');
    updateMultiLabel($('trigger-label-detail-' + def.key), state.detailExploreDraft[key] || [], def.allLabel, def.noun);
  });
}

function mountDetailExplorePanel(canvasId) {
  var host = $('detail-explore');
  if (!host) return;
  if (!detailExploreSupported(canvasId)) {
    host.classList.add('hidden');
    host.innerHTML = '';
    detailExploreMountedFor = '';
    return;
  }
  syncDetailExploreDraftFromFilters();
  state.detailExplorePeerRows = null;
  var html = ADMISSIONS_COMPARISON_KEYS.map(function (key) {
    var def = filterByKey(key);
    return def ? detailFilterFieldMarkup(def) : '';
  }).join('');
  host.innerHTML =
    '<div class="detail-explore-head">' +
      '<h3 class="detail-explore-title">' + escapeHtml(titleCaseLabel('Comparison explorer')) + '</h3>' +
      '<p class="detail-explore-lead">These filters compare <strong>' + escapeHtml(state.institution) +
      '</strong> in this chart only. They do not change the dashboard until you set the same filters above and click Apply. Solid marks are the institution. Dashed lines are the peer average.</p>' +
    '</div>' +
    '<div class="detail-explore-actions">' +
      '<div class="field-filter-actions detail-explore-buttons">' +
        '<button type="button" id="detail-apply-comparison" class="filter-btn filter-btn--apply">Apply</button>' +
        '<button type="button" id="detail-reset-comparison" class="filter-btn filter-btn--reset">Reset</button>' +
      '</div>' +
    '</div>' +
    '<div id="detail-filter-fields" class="filter-fields detail-filter-fields">' + html + '</div>' +
    '<p id="detail-explore-status" class="detail-explore-status" role="status"></p>';
  host.classList.remove('hidden');
  bindFilterMenus($('detail-filter-fields'));
  refreshDetailExploreMenus();
  var applyBtn = $('detail-apply-comparison');
  var resetBtn = $('detail-reset-comparison');
  if (applyBtn) applyBtn.addEventListener('click', function () { applyDetailComparison(true); });
  if (resetBtn) resetBtn.addEventListener('click', function () { resetDetailComparison(); });
  detailExploreMountedFor = canvasId;
  var openStatus = $('detail-explore-status');
  if (openStatus) {
    openStatus.classList.remove('detail-explore-status--error');
    openStatus.textContent = peerContextSentence() || 'Institution only. Add comparison filters here to overlay a peer average.';
  }
}

function renderDetailContent(canvasId, spec) {
  spec = spec || detailStore[canvasId] || {};
  var table = $('detail-table');
  var wrap = $('detail-chart-wrap');
  if (!table || !wrap) return;
  clearDetailChartLoading();
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
  if (detailNestedChart) {
    detailNestedChart.destroy();
    detailNestedChart = null;
  }
  var staleNested = $('detail-nested-host');
  if (staleNested) staleNested.remove();
  if ($('detail-canvas')) $('detail-canvas').style.display = '';
  if (!spec.build && spec.tableHtml && !spec.error && !spec.empty) {
    wrap.style.display = 'none';
    table.innerHTML = spec.tableHtml;
    if ($('detail-export')) $('detail-export').disabled = detailTableMatrix().length < 2;
    if ($('detail-export-csv')) $('detail-export-csv').disabled = detailTableMatrix().length < 2;
    return;
  }
  if (spec.error || spec.empty || (!spec.build && !spec.config) || typeof Chart === 'undefined') {
    wrap.style.display = 'none';
    var detailMsg = spec.error || spec.empty || 'No rows for this selection.';
    var detailKind = spec.error ? 'error' : chartMessageKind(detailMsg, spec.error ? 'error' : 'empty');
    table.innerHTML =
      '<div class="detail-empty chart-empty chart-empty--' + detailKind + '">' +
      '<span class="chart-state-tag">' + escapeHtml(chartStateLabel(detailKind)) + '</span>' +
      '<span class="chart-state-text">' + escapeHtml(detailMsg) + '</span></div>';
    if ($('detail-export')) $('detail-export').disabled = true;
    if ($('detail-export-csv')) $('detail-export-csv').disabled = true;
    return;
  }
  if (spec.volumePanels) {
    wrap.style.display = '';
    wrap.style.height = '480px';
    table.innerHTML = getDetailTableHtml(canvasId) || '';
    $('detail-canvas').style.display = 'none';
    renderVolumeDetail(spec.volumePanels);
    var volumeExportReady = detailTableMatrix().length < 2;
    if ($('detail-export')) $('detail-export').disabled = volumeExportReady;
    if ($('detail-export-csv')) $('detail-export-csv').disabled = volumeExportReady;
    return;
  }
  if (spec.detailCompareConfig && detailExploreSupported(canvasId)) {
    wrap.style.display = '';
    wrap.style.height = '420px';
    table.innerHTML = (spec.tableHtml || getDetailTableHtml(canvasId) || '') + PEER_METHODOLOGY_HTML;
    createDetailBarChart(spec.build ? spec.build() : spec.detailCompareConfig);
  } else {
    wrap.style.display = '';
    var built = spec.build ? spec.build() : spec.config;
    var labels = (built.data && built.data.labels) || [];
    var horizontal = built.options && built.options.indexAxis === 'y';
    wrap.style.height = (horizontal ? Math.min(720, Math.max(360, labels.length * 32)) : 480) + 'px';
    var tableHtml = getDetailTableHtml(canvasId) || '';
    table.innerHTML = tableHtml;
    $('detail-canvas').style.display = '';
    if (built.options && built.options.plugins && built.options.plugins.legend) built.options.plugins.legend.display = true;
    createDetailBarChart(built);
  }
  var exportReady = detailTableMatrix().length < 2;
  var exportBtn = $('detail-export');
  if (exportBtn) exportBtn.disabled = exportReady;
  if ($('detail-export-csv')) $('detail-export-csv').disabled = exportReady;
}

function refreshDetailView(canvasId) {
  if (!canvasId) return;
  var modal = $('detail-modal');
  if (!modal || modal.hidden) return;
  if (canvasId !== openDetailId) {
    openDetail(canvasId);
    return;
  }
  var spec = detailStore[canvasId] || {};
  var source = $(canvasId);
  var card = source && source.closest('.panel');
  var subEl = $('detail-subtitle');
  if (subEl) {
    subEl.textContent = card && card.querySelector('.box-subtitle')
      ? card.querySelector('.box-subtitle').textContent
      : (spec.subtitle || '');
  }
  if (detailExploreSupported(canvasId)) {
    if (detailExploreMountedFor !== canvasId) {
      mountDetailExplorePanel(canvasId);
    } else {
      refreshDetailExploreMenus();
    }
  }
  renderDetailContent(canvasId, spec);
  var showingCompare = !!(spec.detailCompareConfig && detailExploreSupported(canvasId));
  refreshDetailModalTitle(canvasId, showingCompare, '');
}

function showDetailChartLoading() {
  var wrap = $('detail-chart-wrap');
  if (!wrap) return;
  wrap.classList.add('detail-chart-wrap--loading');
  wrap.setAttribute('aria-busy', 'true');
  var canvas = $('detail-canvas');
  if (canvas) {
    canvas.style.visibility = '';
    canvas.style.display = '';
  }
  var loader = wrap.querySelector('.detail-chart-loading');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'detail-chart-loading chart-loading';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-label', 'Loading comparison chart');
    loader.innerHTML = loadingDotsInner('Loading comparison');
    wrap.appendChild(loader);
  }
}

function clearDetailChartLoading() {
  var wrap = $('detail-chart-wrap');
  if (!wrap) return;
  wrap.classList.remove('detail-chart-wrap--loading');
  wrap.removeAttribute('aria-busy');
  var canvas = $('detail-canvas');
  if (canvas) canvas.style.visibility = '';
  var loader = wrap.querySelector('.detail-chart-loading');
  if (loader) loader.remove();
}

function restoreDetailBaseChart(canvasId) {
  clearDetailChartLoading();
  var spec = detailStore[canvasId];
  if (!spec || !spec.config || typeof Chart === 'undefined') return;
  delete spec.detailCompareConfig;
  spec.tableHtml = spec.baseTableHtml || '';
  state.detailExplorePeerRows = null;
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
  var wrap = $('detail-chart-wrap');
  wrap.style.display = '';
  var labels = (spec.config.data && spec.config.data.labels) || [];
  var horizontal = spec.config.options && spec.config.options.indexAxis === 'y';
  wrap.style.height = (horizontal ? Math.min(720, Math.max(360, labels.length * 32)) : 420) + 'px';
  $('detail-canvas').style.display = '';
  createDetailBarChart(spec.build ? spec.build() : spec.config);
  var tableHtml = getDetailTableHtml(canvasId) || '';
  if (!tableHtml && canvasId.slice(-4) === '-cmp') tableHtml = PEER_METHODOLOGY_HTML;
  $('detail-table').innerHTML = tableHtml;
  if ($('detail-export')) $('detail-export').disabled = detailTableMatrix().length < 2;
  if ($('detail-export-csv')) $('detail-export-csv').disabled = detailTableMatrix().length < 2;
}

function resetDetailComparison() {
  if (!openDetailId || !state.detailExploreDraft) return;
  syncDetailExploreDraftFromFilters();
  refreshDetailExploreMenus();
  var status = $('detail-explore-status');
  if (status) {
    status.classList.remove('detail-explore-status--error');
    status.textContent = peerContextSentence() || 'Showing the dashboard selection.';
  }
  restoreDetailBaseChart(openDetailId);
  refreshDetailModalTitle(openDetailId, false);
}

function comparisonFilterCount(filters) {
  return ADMISSIONS_COMPARISON_KEYS.reduce(function (sum, key) {
    return sum + ((filters[key] && filters[key].length) || 0);
  }, 0);
}

function withDetailPeerFilters(draft, fn) {
  var savedFilters = JSON.parse(JSON.stringify(state.filters));
  var savedCtx = state.peerCtxIpeds;
  var savedBlocked = state.peerQueryBlocked;
  ADMISSIONS_COMPARISON_KEYS.forEach(function (key) {
    state.filters[key] = (draft[key] || []).slice();
  });
  return fn().finally(function () {
    state.filters = savedFilters;
    state.peerCtxIpeds = savedCtx;
    state.peerQueryBlocked = savedBlocked;
  });
}

function renderDetailExploreChart(canvasId, instRows, peerRows, explore, peerTag) {
  var labels = unionSurveyYears(instRows, peerRows);
  var chartSets = [];
  var allRates = explore.datasetDefs.length && explore.datasetDefs.every(function (item) {
    return explore.percent || item.percent;
  });
  explore.datasetDefs.forEach(function (item, index) {
    var isRate = !!(explore.percent || item.percent);
    var mineMap = yearValueMap(instRows, item.column, isRate);
    var peerMap = yearValueMap(peerRows, item.column, isRate);
    var mineValues = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
    var peerValues = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
    var instColor = chartBarColor(index, explore.datasetDefs.length, false);
    var peerColor = chartBarColor(index, explore.datasetDefs.length, true);
    var instLabel = state.institution + ' · ' + item.label;
    var peerLabel = (peerTag || 'Peer avg') + ' · ' + item.label;
    if (mineValues.some(function (value) { return value != null; })) {
      if (isRate) {
        chartSets.push({
          type: 'line',
          label: instLabel,
          data: mineValues,
          borderColor: instColor,
          backgroundColor: 'transparent',
          pointBackgroundColor: instColor,
          pointRadius: 4,
          borderWidth: 2,
          tension: 0,
          fill: false,
          spanGaps: true
        });
      } else {
        chartSets.push({
          type: 'bar',
          label: instLabel,
          data: mineValues,
          backgroundColor: instColor,
          maxBarThickness: 22,
          borderWidth: 0
        });
      }
    }
    if (peerValues.some(function (value) { return value != null; })) {
      chartSets.push({
        type: 'line',
        label: peerLabel,
        data: peerValues,
        borderColor: peerColor,
        backgroundColor: 'transparent',
        pointBackgroundColor: peerColor,
        pointRadius: 3,
        borderWidth: 2,
        borderDash: [6, 4],
        tension: 0,
        fill: false,
        spanGaps: true
      });
    }
  });
  var format = allRates ? 'percent' : valueFormatFor(explore.datasetDefs[0] || {});
  var config = {
    type: chartSets.some(function (set) { return set.type === 'bar'; }) ? 'bar' : 'line',
    data: { labels: labels, datasets: chartSets },
    options: {
      plugins: { legend: { display: chartSets.length > 1 } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return formatAxisValue(v, format); } }
        }
      }
    }
  };
  clearDetailChartLoading();
  var wrap = $('detail-chart-wrap');
  wrap.style.display = '';
  wrap.style.height = '420px';
  $('detail-canvas').style.visibility = '';
  createDetailBarChart(config);
  detailStore[canvasId].detailCompareConfig = config;
  detailStore[canvasId].tableHtml = buildTrendCompareTableHtml(labels, instRows, peerRows, explore, peerTag);
  $('detail-table').innerHTML = detailStore[canvasId].tableHtml + PEER_METHODOLOGY_HTML;
  if ($('detail-export')) $('detail-export').disabled = false;
  if ($('detail-export-csv')) $('detail-export-csv').disabled = false;
}

function buildTrendCompareTableHtml(labels, instRows, peerRows, explore, peerTag) {
  var html = '<table class="preview-table"><thead><tr><th>Year</th>';
  explore.datasetDefs.forEach(function (item) {
    html += '<th>' + escapeHtml(state.institution + ' · ' + item.label) + '</th>';
    html += '<th>' + escapeHtml((peerTag || 'Peer avg') + ' · ' + item.label) + '</th>';
  });
  html += '</tr></thead><tbody>';
  tableIndicesNewestYearFirst(labels).forEach(function (index) {
    var label = labels[index];
    html += '<tr><td>' + escapeHtml(label) + '</td>';
    explore.datasetDefs.forEach(function (item) {
      var isRate = !!(explore.percent || item.percent);
      var mineMap = yearValueMap(instRows, item.column, isRate);
      var peerMap = yearValueMap(peerRows, item.column, isRate);
      var instVal = mineMap[label];
      var peerVal = peerMap[label];
      var money = !isRate && valueFormatFor(item) === 'currency';
      function cell(value) {
        if (value == null) return '—';
        if (isRate) return Number(value).toFixed(1) + '%';
        if (money) return formatChartCurrency(value);
        return formatCompactCount(value);
      }
      html += '<td>' + escapeHtml(cell(instVal)) + '</td>';
      html += '<td>' + escapeHtml(cell(peerVal)) + '</td>';
    });
    html += '</tr>';
  });
  return html + '</tbody></table>';
}

function detailComparisonErrorMessage(err) {
  var msg = domoErrorMessage(err) || (err && err.message) || '';
  if (msg) return msg;
  return 'Could not load the peer comparison. Check comparison filters and try again.';
}

function applyDetailComparison(showErrors, canvasId) {
  if (showErrors === undefined) showErrors = true;
  canvasId = canvasId || openDetailId;
  if (!canvasId || !detailExploreSupported(canvasId)) return Promise.resolve();
  var explore = detailStore[canvasId] && detailStore[canvasId].explore;
  var cache = state.paintCache;
  if (!explore || !cache || !cache.mine || !cache.mine.length) {
    var statusMissing = $('detail-explore-status');
    if (statusMissing) {
      statusMissing.textContent = 'Institution data is not loaded yet. Close and reopen after the dashboard finishes updating.';
      if (showErrors) statusMissing.classList.add('detail-explore-status--error');
    }
    return Promise.resolve();
  }
  var applyBtn = $('detail-apply-comparison');
  var resetBtn = $('detail-reset-comparison');
  var status = $('detail-explore-status');
  if (applyBtn) applyBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;
  if (status) {
    status.textContent = '';
    status.classList.remove('detail-explore-status--error');
  }
  showDetailChartLoading();
  var sample = cache.mine[cache.mine.length - 1];
  return withDetailPeerFilters(state.detailExploreDraft, function () {
    var peerDesc = '';
    return resolvePeerContexts(sample).then(function () {
      if (state.peerQueryBlocked) {
        throw new Error(PEER_PICK_FILTERS_MSG);
      }
      peerDesc = peerContextSentence() || describeExplicitPeerFilters();
      var peerTag = peerLegendTag();
      var defaultPeerLabel = peerGroupPhrase(state.peerCtxIpeds);
      return loadPeerAggregates(sample, cache.mine).catch(function (err) {
        throw new Error(detailComparisonErrorMessage(err));
      }).then(function (rows) {
        return { rows: rows || [], peerDesc: peerDesc, defaultPeerLabel: defaultPeerLabel, peerTag: peerTag };
      });
    });
  }).then(function (result) {
    if (!result) {
      throw new Error('Peer comparison did not return data. Try Reset, then Apply with fewer filters.');
    }
    state.detailExplorePeerRows = result.rows || [];
    renderDetailExploreChart(canvasId, cache.mine, state.detailExplorePeerRows, explore, result.peerTag);
    refreshDetailModalTitle(canvasId, true, result.defaultPeerLabel || '');
    var statusEl = $('detail-explore-status');
    if (statusEl) {
      statusEl.classList.remove('detail-explore-status--error');
      var desc = result.peerDesc || 'Peer average for the filters in this view.';
      if (!state.detailExplorePeerRows.length) {
        desc = 'No peer aggregate rows for this group. ' + desc;
      }
      statusEl.textContent = desc;
    }
  }).catch(function (err) {
    clearDetailChartLoading();
    if (status) status.textContent = detailComparisonErrorMessage(err);
    if (showErrors && status) status.classList.add('detail-explore-status--error');
  }).finally(function () {
    if (applyBtn) applyBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
  });
}

function openDetail(canvasId) {
  if (openDetailId !== canvasId) detailExploreMountedFor = '';
  openDetailId = canvasId;
  var source = $(canvasId);
  var card = source && source.closest('.panel');
  document.querySelectorAll('.panel--detail-source').forEach(function (el) {
    el.classList.remove('panel--detail-source');
  });
  if (card) card.classList.add('panel--detail-source');
  var subEl = $('detail-subtitle');
  if (subEl) {
    var storedSub = detailStore[canvasId] && detailStore[canvasId].subtitle;
    subEl.textContent = card && card.querySelector('.box-subtitle')
      ? card.querySelector('.box-subtitle').textContent
      : (storedSub || '');
  }
  if ($('detail-overlay')) $('detail-overlay').hidden = false;
  if ($('detail-modal')) {
    $('detail-modal').hidden = false;
    $('detail-modal').classList.remove('is-enter');
    void $('detail-modal').offsetWidth;
    $('detail-modal').classList.add('is-enter');
  }
  try {
    mountDetailExplorePanel(canvasId);
    renderDetailContent(canvasId);
    var spec = detailStore[canvasId] || {};
    refreshDetailModalTitle(canvasId, !!(spec.detailCompareConfig && detailExploreSupported(canvasId)), '');
  } catch (err) {
    showDetailFailure(err && err.message ? err.message : 'This detail view could not be opened.');
  }
}

function closeDetail() {
  var fromCanvasId = openDetailId;
  var tip = document.getElementById('nested-volume-tip');
  if (tip) tip.hidden = true;
  var hoverTip = document.getElementById('chart-hover-tip');
  if (hoverTip) hoverTip.hidden = true;
  clearDetailChartLoading();
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
  if (detailNestedChart) {
    detailNestedChart.destroy();
    detailNestedChart = null;
  }
  var nestedHost = $('detail-nested-host');
  if (nestedHost) nestedHost.remove();
  if ($('detail-canvas')) $('detail-canvas').style.display = '';
  if ($('detail-chart-wrap')) $('detail-chart-wrap').style.height = '';
  state.detailExploreDraft = null;
  state.detailExplorePeerRows = null;
  $('detail-overlay').hidden = true;
  $('detail-modal').hidden = true;
  document.querySelectorAll('.panel--detail-source').forEach(function (el) {
    el.classList.remove('panel--detail-source');
  });
  openDetailId = '';
  detailExploreMountedFor = '';
  if (fromCanvasId) replayPanelChartMotion(fromCanvasId);
}

function detailTableMatrix() {
  var table = document.querySelector('#detail-table table');
  if (!table) return [];
  return Array.prototype.map.call(table.rows, function (row) {
    return Array.prototype.map.call(row.cells, function (cell) {
      return cell.textContent.replace(/\s+/g, ' ').trim();
    });
  });
}

function matrixToCsv(matrix) {
  return matrix.map(function (row) {
    return row.map(function (cell) {
      var text = String(cell == null ? '' : cell).replace(/"/g, '""');
      return /[",\n]/.test(text) ? '"' + text + '"' : text;
    }).join(',');
  }).join('\r\n');
}

function slugifyExportName(text) {
  return String(text || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'export';
}

function downloadText(filename, text, type) {
  var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function reportDocumentStyles() {
  return 'body{margin:0;background:#E7E4D8;color:#18181A;font-family:Inter,sans-serif}' +
    '.report-sheet{width:min(920px,100%);margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(20,20,20,.08)}' +
    '.report-hero{padding:28px 32px 22px;background:linear-gradient(90deg,#6FBFB0 0%,#FFDE3D 58%,#FFD100 100%) top/100% 4px no-repeat,linear-gradient(150deg,#FFFEF6 0%,#FFFFFF 50%,#F7FBFA 100%) padding-box}' +
    '.report-kicker{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#7A7A74}' +
    'h1{font-family:Inter,sans-serif;font-weight:700;font-size:34px;letter-spacing:-.035em;margin:8px 0 0}' +
    '.report-institution{font-size:20px;margin:10px 0 0}' +
    '.report-meta{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0;padding:0;list-style:none}' +
    '.report-meta li{padding:6px 10px;border-radius:999px;background:#F6F4EE;border:1px solid #E8E6E0;font-size:12px}' +
    '.report-body{padding:8px 32px 32px}.report-section{margin-top:28px}' +
    '.report-section h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#6A6A64;border-bottom:2px solid #FFD100;padding-bottom:6px;margin:0 0 14px}' +
    '.report-block{margin:0 0 22px}.report-block h3{font-size:18px;margin:0;line-height:1.3}.report-block p{color:#56565A;font-size:13px;margin:6px 0 12px}' +
    '.report-block img{display:block;width:100%;max-height:320px;object-fit:contain;margin:0 0 16px;background:#FAFAF8;border:1px solid #E8E6E0;border-radius:10px}' +
    '.report-block table,.report-block .preview-table{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}' +
    '.report-block th,.report-block td{padding:8px 10px;text-align:right;border-bottom:1px solid #EFEDE6}' +
    '.report-block th:first-child,.report-block td:first-child{text-align:left}' +
    '.report-block th{background:#18181A;color:#FFD100;font-size:11px;letter-spacing:.06em;text-transform:uppercase}' +
    '.peer-note{margin:10px 0 0;font-size:12px;color:#56565A}' +
    '.peer-methodology{margin-top:16px;padding:12px 14px;border-radius:10px;background:#FAFAF8;border:1px solid #E8E6E0;font-size:12px;line-height:1.45;color:#56565A}' +
    '.peer-methodology p{margin:0 0 6px;color:#18181A}' +
    '.peer-methodology ul{margin:0;padding-left:18px}' +
    '.report-foot{padding:16px 32px 22px;border-top:1px solid #EFEDE6;color:#7A7A74;font-size:12px}' +
    '.report-empty{color:#56565A;font-size:13px}';
}

function buildReportHtmlDocument(pageTitle, sheetHtml) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>' + escapeHtml(pageTitle) +
    '</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>' +
    reportDocumentStyles() + '</style></head><body>' + sheetHtml + '</body></html>';
}

function reportFootHtml() {
  return '<footer class="report-foot">IPEDS · wegotthis@3enrollment.com</footer>';
}

function detailReportMarkup() {
  var titleEl = $('detail-title');
  var title = (titleEl && (titleEl.getAttribute('data-export-title') || titleEl.textContent)) || 'Chart detail';
  title = String(title).replace(/\s+/g, ' ').trim();
  var subtitleEl = $('detail-subtitle');
  var subtitle = subtitleEl ? subtitleEl.textContent.replace(/\s+/g, ' ').trim() : '';
  var pageName = state.page === 'advancement' ? 'Advancement' : (state.page === 'keymetrics' ? 'Key metrics' : (state.page === 'admissions' ? 'Admissions' : 'IPEDS Insights'));
  var meta = reportMeta().map(function (item) {
    return '<li><strong>' + escapeHtml(item[0]) + '</strong> ' + escapeHtml(item[1]) + '</li>';
  }).join('');
  var image = '';
  try {
    var canvas = $('detail-canvas');
    if (canvas && canvas.style.display !== 'none' && canvas.width && detailChart) {
      image = canvas.toDataURL('image/png');
    }
  } catch (e) { image = ''; }
  var tableHost = $('detail-table');
  var tableHtml = tableHost ? tableHost.innerHTML : '';
  var block =
    '<article class="report-block"><h3>' + escapeHtml(title) + '</h3>' +
    (subtitle ? '<p>' + escapeHtml(subtitle) + '</p>' : '') +
    (image ? '<img alt="" src="' + image + '">' : '') +
    tableHtml + '</article>';
  return '<div class="report-sheet"><header class="report-hero"><p class="report-kicker">3 Enrollment Marketing</p><h1>3E IPEDS Insights</h1><p class="report-institution">' +
    escapeHtml(state.institution || 'Institution not selected') + ' · ' + escapeHtml(pageName) + ' · Detail view</p><ul class="report-meta">' + meta +
    '</ul></header><div class="report-body"><section class="report-section"><h2>Chart &amp; supporting data</h2>' + block +
    '</section></div>' + reportFootHtml() + '</div>';
}

function exportDetailCsv() {
  var matrix = detailTableMatrix();
  if (matrix.length < 2) return;
  var titleEl = $('detail-title');
  var title = (titleEl && (titleEl.getAttribute('data-export-title') || titleEl.textContent)) || 'chart-detail';
  title = String(title).replace(/\s+/g, ' ').trim();
  var name = slugifyExportName(title);
  if (state.institution) name = slugifyExportName(state.institution) + '-' + name;
  downloadText(name + '.csv', '\uFEFF' + matrixToCsv(matrix), 'text/csv;charset=utf-8');
}

function exportDetailTable() {
  if (detailTableMatrix().length < 2) return;
  var titleEl = $('detail-title');
  var title = (titleEl && (titleEl.getAttribute('data-export-title') || titleEl.textContent)) || 'chart-detail';
  title = String(title).replace(/\s+/g, ' ').trim();
  var name = slugifyExportName(title);
  if (state.institution) name = slugifyExportName(state.institution) + '-' + name;
  var docTitle = '3E IPEDS Insights — ' + title;
  downloadText(name + '.html', buildReportHtmlDocument(docTitle, detailReportMarkup()), 'text/html;charset=utf-8');
}

function reportAllowed() {
  return !!state.institution && isDashboardDataPage(state.page);
}

function syncReportButton() {
  var button = $('btn-export-report');
  if (!button) return;
  var allowed = reportAllowed();
  button.disabled = !allowed;
  if (!state.institution) button.title = 'Select an institution before exporting a report.';
  else if (state.page === 'faq') button.title = 'Open Admissions or Advancement to export that page.';
  else button.title = 'Export this page as a report.';
}

function reportMeta() {
  var items = [];
  if (state.partition) items.push(['Partition', state.partition]);
  if (state.year) items.push(['Survey year', state.year]);
  if (state.institution) items.push(['Institution', state.institution]);
  ['comparisons', 'conference', 'region', 'state', 'control', 'selectivity'].forEach(function (key) {
    var values = state.filters[key] || [];
    if (!values.length) return;
    var def = filterByKey(key);
    items.push([def ? def.label : key, values.join(', ')]);
  });
  if (state.page === 'admissions' && state.originState) items.push(['Origin state', state.originState]);
  items.push(['Prepared', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })]);
  return items;
}

function reportSections() {
  var view = $('view-' + state.page);
  if (!view) return [];
  var sections = [];
  var current = { label: '', items: [] };
  function pushCurrent() {
    if (current.items.length) sections.push(current);
  }
  Array.prototype.forEach.call(view.children, function (node) {
    if (node.classList && node.classList.contains('section-label')) {
      pushCurrent();
      current = { label: node.textContent.trim(), items: [] };
      return;
    }
    var groups = node.querySelectorAll ? node.querySelectorAll('.key-metric-group') : [];
    Array.prototype.forEach.call(groups, function (group) {
      var table = group.querySelector('table');
      var title = group.querySelector('.key-metric-group-title');
      if (!table || !title) return;
      current.items.push({
        title: title.textContent,
        subtitle: 'Selected survey year',
        tableHtml: table.outerHTML,
        image: ''
      });
    });
    var panels = node.classList && node.classList.contains('panel') ? [node] : (node.querySelectorAll ? node.querySelectorAll('.panel') : []);
    Array.prototype.forEach.call(panels, function (panel) {
      var canvas = panel.querySelector('canvas');
      if (!canvas) return;
      var spec = detailStore[canvas.id] || {};
      var tableHtml = getDetailTableHtml(canvas.id);
      if (!tableHtml || spec.empty) return;
      var image = '';
      try {
        if (charts[canvas.id] && canvas.style.display !== 'none' && canvas.width) image = canvas.toDataURL('image/png');
      } catch (e) { image = ''; }
      current.items.push({
        title: panel.querySelector('.box-title').textContent,
        subtitle: panel.querySelector('.box-subtitle').textContent,
        tableHtml: tableHtml,
        image: image
      });
    });
  });
  pushCurrent();
  return sections;
}

function reportMarkup() {
  var pageName = state.page === 'advancement' ? 'Advancement' : (state.page === 'keymetrics' ? 'Key metrics' : 'Admissions');
  var meta = reportMeta().map(function (item) {
    return '<li><strong>' + escapeHtml(item[0]) + '</strong> ' + escapeHtml(item[1]) + '</li>';
  }).join('');
  var sections = reportSections();
  var body = sections.length ? sections.map(function (section) {
    var blocks = section.items.map(function (item) {
      return '<article class="report-block"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.subtitle) + '</p>' +
        (item.image ? '<img alt="" src="' + item.image + '">' : '') + item.tableHtml + '</article>';
    }).join('');
    return '<section class="report-section"><h2>' + escapeHtml(section.label || pageName) + '</h2>' + blocks + '</section>';
  }).join('') : '<p class="report-empty">No tables are ready for this selection yet.</p>';
  return '<header class="report-hero"><p class="report-kicker">3 Enrollment Marketing</p><h1>3E IPEDS Insights</h1><p class="report-institution">' +
    escapeHtml(state.institution) + ' · ' + escapeHtml(pageName) + '</p><ul class="report-meta">' + meta + '</ul></header><div class="report-body">' +
    body + '</div>' + reportFootHtml();
}

function openReport() {
  if (!reportAllowed()) return;
  $('report-sheet').innerHTML = reportMarkup();
  $('report-overlay').hidden = false;
  document.body.classList.add('report-open');
}

function closeReport() {
  var overlay = $('report-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  document.body.classList.remove('report-open');
}

function downloadReport() {
  if (!reportAllowed()) return;
  if ($('report-overlay').hidden) $('report-sheet').innerHTML = reportMarkup();
  var html = buildReportHtmlDocument(
    '3E IPEDS Insights — ' + state.institution,
    $('report-sheet').outerHTML
  );
  downloadText('3e-ipeds-' + slugifyExportName(state.page) + '-' + slugifyExportName(state.institution) + '.html', html, 'text/html;charset=utf-8');
}

function syncChartWrapState(canvasId, mode) {
  var canvas = $(canvasId);
  if (!canvas) return;
  var wrap = canvas.parentNode;
  if (!wrap || !wrap.classList.contains('chart-wrap')) return;
  wrap.classList.remove('chart-wrap--empty', 'chart-wrap--loading', 'chart-wrap--data', 'chart-wrap--error', 'chart-wrap--idle');
  if (mode) wrap.classList.add('chart-wrap--' + mode);
}

function showChartIdle(id) {
  destroyChart(id);
  var canvas = $(id);
  if (!canvas) return;
  canvas.style.display = 'none';
  var wrap = canvas.parentNode;
  if (!wrap) return;
  clearChartLoading(id);
  var empty = wrap.querySelector('.chart-empty');
  if (empty) empty.remove();
  syncChartWrapState(id, 'idle');
  detailStore[id] = {};
  clearAppBusyEarly();
}

function chartMessageKind(message, kind) {
  if (kind === 'error') return 'error';
  if (kind === 'setup') return 'setup';
  if (kind === 'empty') return 'empty';
  var msg = String(message || '');
  if (/query failed|did not load|could not/i.test(msg)) return 'error';
  if (/^Select an institution|^Set a comparison|^Choose comparison|^Select a FROM|^Map VW_/i.test(msg)) return 'setup';
  return 'empty';
}

function chartStateLabel(kind) {
  if (kind === 'error') return 'Error';
  if (kind === 'setup') return 'Setup';
  return 'No Data';
}

function showChartMessage(id, message, kind) {
  destroyChart(id);
  var canvas = $(id);
  if (!canvas) return;
  canvas.style.display = 'none';
  var wrap = canvas.parentNode;
  clearChartLoading(id);
  var resolved = chartMessageKind(message, kind);
  syncChartWrapState(id, resolved === 'error' ? 'error' : 'empty');
  var note = wrap.querySelector('.chart-empty');
  if (!note) {
    note = document.createElement('div');
    note.className = 'chart-empty';
    wrap.appendChild(note);
  }
  note.className = 'chart-empty chart-empty--' + resolved;
  var peerHelp = /comparison|peer average|no peer|set a comparison|choose comparison/i.test(message);
  note.innerHTML =
    '<span class="chart-state-tag">' + escapeHtml(chartStateLabel(resolved)) + '</span>' +
    '<span class="chart-state-text">' + escapeHtml(peerHelp
      ? 'No comparison is loaded for this chart. Use the default peer group, or open Comparison Filters.'
      : message) + '</span>' +
    (peerHelp ? '<button type="button" class="use-default-peers">Use default peers</button>' : '');
  if (resolved === 'error') detailStore[id] = { error: message };
  else detailStore[id] = { empty: message };
  clearAppBusyEarly();
}

function showEmpty(id, message) {
  showChartMessage(id, message, 'empty');
}

function showChartError(id, message) {
  showChartMessage(id, message, 'error');
}

function panel(title, subtitle, canvasId, wide, chartSize, inset, lite) {
  var cls = 'panel';
  if (inset) cls += ' panel--inset';
  if (lite) cls += ' panel--lite';
  if (wide) cls += ' panel-wide';
  if (chartSize) cls += ' panel--' + chartSize;
  if (canvasId && canvasId.slice(-4) === '-cmp') cls += ' panel--peer-chart';
  else if (canvasId && canvasId.indexOf('chart-') === 0) cls += ' panel--inst-chart';
  var headCls = lite ? ' box-head box-head--compact' : ' box-head';
  return '<article class="' + cls + '"><div class="' + headCls + '"><span class="box-head-accent" aria-hidden="true"></span><div class="box-head-text"><h2 class="box-title">' +
    escapeHtml(titleCaseLabel(title)) + '</h2><p class="box-subtitle">' + escapeHtml(subtitle) +
    '</p></div><button type="button" class="btn-text panel-tools" data-detail="' + canvasId + '" title="' + escapeHtml('Open a larger chart. Filters chosen here do not change the dashboard until you set them in the filter bar and click Apply.') + '">Details</button></div><div class="chart-wrap chart-wrap--data"><canvas id="' +
    canvasId + '"></canvas></div><div class="table-scroll hidden" id="table-' + canvasId + '"></div></article>';
}


function splitChartPanel(title, subtitle, blocks, chartSize) {
  var cls = 'panel panel--inset panel--lite panel--split panel--' + chartSize;
  var body = blocks.map(function (block) {
    return '<div class="chart-split"><div class="chart-split-head"><p class="chart-split-label">' + escapeHtml(block.label) + '</p>' +
      '<button type="button" class="btn-text panel-tools" data-detail="' + block.id + '" title="Open a larger chart. Filters chosen here do not change the dashboard until you set them in the filter bar and click Apply.">Details</button></div>' +
      '<div class="chart-wrap chart-wrap--data"><canvas id="' + block.id + '"></canvas></div></div>';
  }).join('');
  return '<article class="' + cls + '"><div class="box-head box-head--compact"><span class="box-head-accent" aria-hidden="true"></span><div class="box-head-text"><h2 class="box-title">' +
    escapeHtml(titleCaseLabel(title)) + '</h2><p class="box-subtitle">' + escapeHtml(subtitle) + '</p></div></div>' + body + '</article>';
}

function pair(metricTitle, canvasId, chartSize) {
  var inst = state.institution || 'Select an institution';
  return panel(metricTitle, inst, canvasId, false, chartSize, true, true).replace(
    'class="box-subtitle"',
    'class="box-subtitle" data-peer-sub="1"'
  );
}

function band(html, mod) {
  return '<section class="metric-band' + (mod ? ' metric-band--' + mod : '') + '">' + html + '</section>';
}

function sectionOverviewKeys() {
  return {
    admissions: true,
    aid: true,
    'advancement-changing': true
  };
}

function sectionOverviewDefinition(key) {
  var admit = field('admitRate') || 'ADMIT_RATE';
  var yieldCol = field('yieldRate') || 'YIELD_RATE';
  var givingCol = field('giving');
  var opexCol = field('opex');
  var defs = {
    admissions: {
      title: 'Admissions & Yield',
      note: 'Solid bars and lines are your institution; dashed lines are peer averages. Left axis: counts. Right axis: rates.',
      series: [
        { label: 'Applications', column: field('applications'), kind: 'volume', graph: 'bar' },
        { label: 'Admissions', column: field('admissions'), kind: 'volume', graph: 'bar' },
        { label: 'Enrollment', column: field('enrollment'), kind: 'volume', graph: 'bar' },
        { label: 'Admit rate', column: admit, kind: 'rate', graph: 'line', percent: true },
        { label: 'Yield', column: yieldCol, kind: 'rate', graph: 'line', percent: true }
      ]
    },
    aid: {
      title: 'Tuition & Aid',
      note: 'Combined price and aid metrics. Currency on the left; discount and Pell eligibility on the right (%).',
      series: [
        { label: 'Published tuition', column: field('tuition'), kind: 'volume', graph: 'bar' },
        { label: 'Net tuition revenue', column: field('ntr'), kind: 'volume', graph: 'bar' },
        { label: 'Discount rate', column: field('discount'), kind: 'rate', graph: 'line', percent: true },
        { label: 'Pell eligibility', column: field('pell'), kind: 'rate', graph: 'line', percent: true }
      ]
    },
    'advancement-core': {
      title: 'Endowment & Philanthropy',
      note: 'Endowment and giving (left axis) with endowment per FTE trend (right axis).',
      series: [
        { label: 'Endowment', column: field('endowment'), kind: 'volume', graph: 'bar' },
        { label: 'Private giving', column: givingCol, kind: 'volume', graph: 'bar' },
        { label: 'Endowment per FTE', column: 'ENDOWMENT_PER_FTE', kind: 'rate', graph: 'line' }
      ]
    },
    'advancement-scale': {
      title: 'Scale & Efficiency',
      note: 'Enrollment scale and endowment per student. Endowment and private giving are charted in the section above.',
      series: [
        { label: 'FTE', column: field('fte'), kind: 'volume', graph: 'bar' },
        { label: 'Endowment per FTE', column: 'ENDOWMENT_PER_FTE', kind: 'rate', graph: 'line' }
      ]
    },
    'advancement-changing': {
      title: 'How it\'s changing',
      note: 'Indexed to the first survey year = 100. Solid lines are your institution; dashed lines are peer medians.'
    },
    'advancement-ops': {
      title: 'Operating & Financial Mix',
      note: 'Operating expenses on the left. Philanthropic intensity, private giving divided by operating expenses, is on the right.',
      series: [
        { label: 'Operating expenses', column: opexCol, kind: 'volume', graph: 'bar' },
        { label: 'Philanthropic contribution', column: field('philanthropic') || givingCol, kind: 'volume', graph: 'bar' },
        {
          label: 'Philanthropic intensity',
          kind: 'rate',
          graph: 'line',
          percent: true,
          values: function (rows) {
            if (!givingCol || !opexCol) return rows.map(function () { return null; });
            return rows.map(function (row) {
              var g = num(row[givingCol]);
              var o = num(row[opexCol]);
              if (g == null || o == null || !o) return null;
              return (g / o) * 100;
            });
          }
        }
      ]
    }
  };
  return defs[key] || null;
}

function sectionOverviewSeriesValues(rows, def) {
  if (def.values) return def.values(rows);
  if (!def.column) return rows.map(function () { return null; });
  var vals = series(rows, def.column);
  if (def.percent) vals = asPercent(vals);
  return vals;
}

function sectionOverviewPalette(isPeer) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isPeer) {
    return dark
      ? ['#A8A8A4', '#FFE566', '#9ED9CE', '#A8D8F0']
      : ['#56565A', '#C4A800', '#5AA895', '#5B9BD5'];
  }
  return dark
    ? ['#EDEDE9', '#FFD100', '#7FCBBC', '#9ECAE8']
    : ['#2D2D30', '#FFD100', '#6FBFB0', '#7CB9E8'];
}

function sectionOverviewColor(index, isPeer) {
  var palette = sectionOverviewPalette(isPeer);
  return palette[index % palette.length];
}

function buildSectionOverviewChartConfig(def, mine, peers) {
  if (!def || !mine.length) return null;
  var labels = yearsOf(mine);
  var datasets = [];
  var colorIdx = 0;
  def.series.forEach(function (s) {
    var instVals = sectionOverviewSeriesValues(mine, s);
    if (!instVals.some(function (v) { return v != null; })) return;
    var isRate = s.kind === 'rate';
    var instColor = sectionOverviewColor(colorIdx, false);
    var graphType = s.graph || (isRate ? 'line' : 'bar');
    var shortInst = state.institution.length > 28
      ? state.institution.slice(0, 26) + '…'
      : state.institution;
    datasets.push({
      type: graphType,
      label: s.label + ' · ' + shortInst,
      data: instVals,
      yAxisID: isRate ? 'y1' : 'y',
      backgroundColor: graphType === 'line' ? 'transparent' : instColor,
      borderColor: instColor,
      borderWidth: graphType === 'line' ? 2.5 : 1,
      tension: 0,
      fill: false,
      order: graphType === 'line' ? 1 : 2,
      maxBarThickness: graphType === 'bar' ? 16 : undefined,
      pointRadius: graphType === 'line' ? 4 : 0,
      pointHoverRadius: graphType === 'line' ? 6 : 0
    });
    if (peers.length && !state.peerQueryBlocked) {
      var peerVals = sectionOverviewSeriesValues(peers, s);
      if (peerVals.some(function (v) { return v != null; })) {
        var peerColor = sectionOverviewColor(colorIdx, true);
        datasets.push({
          type: 'line',
          label: s.label + ' · Peer average',
          data: peerVals,
          yAxisID: isRate ? 'y1' : 'y',
          borderColor: peerColor,
          backgroundColor: 'transparent',
          borderDash: [7, 5],
          borderWidth: 2.5,
          tension: 0,
          pointRadius: 0,
          order: 0
        });
      }
    }
    colorIdx += 1;
  });
  if (!datasets.length) return null;
  return {
    type: 'bar',
    data: { labels: labels, datasets: datasets },
    options: {
      layout: { padding: { top: 16, right: 20, bottom: 8, left: 8 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            boxWidth: 28,
            boxHeight: 8,
            padding: 14,
            generateLabels: function (chart) {
              var items = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              items.forEach(function (item) {
                var ds = chart.data.datasets[item.datasetIndex];
                if (!ds) return;
                var isLine = ds.type === 'line';
                item.pointStyle = isLine ? 'line' : 'rectRounded';
                item.lineWidth = isLine ? 2.5 : 0;
                item.strokeStyle = ds.borderColor;
                item.fillStyle = isLine ? ds.borderColor : ds.backgroundColor;
              });
              return items;
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var val = ctx.parsed.y;
              if (val == null) return ctx.dataset.label + ': —';
              if (ctx.dataset.yAxisID === 'y1') {
                var pct = ctx.dataset.label.indexOf('rate') !== -1 ||
                  ctx.dataset.label.indexOf('Pell') !== -1 ||
                  ctx.dataset.label.indexOf('share') !== -1 ||
                  ctx.dataset.label.indexOf('Discount') !== -1;
                if (pct || val <= 100) return ctx.dataset.label + ': ' + val.toFixed(1) + '%';
                return ctx.dataset.label + ': ' + formatChartCurrency(val);
              }
              return ctx.dataset.label + ': ' + formatChartCurrency(val);
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function (v) { return formatChartCurrency(v); }
          }
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            callback: function (v) {
              if (Math.abs(v) <= 1000 && v % 1 !== 0) return v.toFixed(1) + '%';
              return formatChartCurrency(v);
            }
          }
        }
      }
    }
  };
}

function openSectionOverview(sectionKey) {
  var def = sectionOverviewDefinition(sectionKey);
  if (sectionKey === 'advancement-changing') {
    def = def || { title: 'How it\'s changing' };
  }
  if (!def) return;
  if (!state.institution || !state.connected.ipeds) {
    setBanner('Select an institution to open the combined section chart.', 'info');
    return;
  }
  var cache = state.paintCache;
  var mine = (cache && cache.mine) || [];
  var peers = (cache && cache.peerAggregates) || [];
  var config = sectionKey === 'advancement-changing'
    ? buildAdvancementChangingOverviewConfig(mine, (cache && cache.peerInstitutionRows) || [], 'indexed')
    : buildSectionOverviewChartConfig(def, mine, peers);
  var modal = $('section-overview-modal');
  var overlay = $('section-overview-overlay');
  if (!modal || !overlay) return;
  $('section-overview-title').textContent = titleCaseLabel(def.title);
  $('section-overview-lead').textContent = state.institution;
  var noteEl = $('section-overview-note');
  if (noteEl) noteEl.textContent = def.note || '';
  var wrap = $('section-overview-chart-wrap');
  if (sectionOverviewChart) {
    sectionOverviewChart.destroy();
    sectionOverviewChart = null;
  }
  if (!config) {
    if (wrap) wrap.innerHTML = '<div class="chart-empty chart-empty--empty"><span class="chart-state-text">No metrics in this section are available for the current selection.</span></div>';
  } else {
    if (wrap && !wrap.querySelector('#section-overview-canvas')) {
      wrap.innerHTML = '<canvas id="section-overview-canvas"></canvas>';
    }
    var canvas = $('section-overview-canvas');
    if (canvas && typeof Chart !== 'undefined') {
      sectionOverviewChart = new Chart(canvas, themeChart(config, { profile: 'detail' }));
    }
  }
  overlay.hidden = false;
  modal.hidden = false;
  modal.classList.remove('is-enter');
  void modal.offsetWidth;
  modal.classList.add('is-enter');
}

function closeSectionOverview() {
  if (sectionOverviewChart) {
    sectionOverviewChart.destroy();
    sectionOverviewChart = null;
  }
  var modal = $('section-overview-modal');
  var overlay = $('section-overview-overlay');
  if (modal) modal.hidden = true;
  if (overlay) overlay.hidden = true;
}

function analyticsSection(title, lead, bodyHtml, mod, opts) {
  opts = opts || {};
  var modCls = mod ? ' analytics-section--' + mod : '';
  var overviewKeys = sectionOverviewKeys();
  var overviewBtn = mod && overviewKeys[mod]
    ? '<button type="button" class="section-overview-btn" data-section-overview="' + escapeHtml(mod) + '">' +
      'Combined chart</button>'
    : '';
  var headAside = opts.headAside || '';
  var headActions = '';
  if (overviewBtn || headAside) {
    headActions = '<div class="analytics-section-head-actions">' + overviewBtn + headAside + '</div>';
  }
  return '<section class="analytics-section' + modCls + '">' +
    '<header class="analytics-section-head">' +
      '<div class="analytics-section-head-main">' +
        '<div class="analytics-section-title-row">' +
          '<h2 class="analytics-section-title">' + escapeHtml(titleCaseLabel(title)) + '</h2>' +
          headActions +
        '</div>' +
        (lead ? '<p class="analytics-section-lead">' + escapeHtml(lead) + '</p>' : '') +
      '</div>' +
    '</header><div class="analytics-section-body">' + bodyHtml + '</div>' +
    (mod && mod !== 'oos' ? '<p class="analytics-section-foot" data-section-foot="' + escapeHtml(mod) + '"></p>' : '') +
    '</section>';
}

function syncComparisonFiltersPanel() {
  var details = $('filter-comparisons-details');
  if (!details) return;
  var any = ADMISSIONS_COMPARISON_KEYS.some(function (key) {
    return (state.draft[key] || []).length;
  });
  if (any) details.open = true;
}

var ORIGIN_DEF = {
  key: 'origin',
  label: 'From state',
  allLabel: 'Select a state',
  noun: 'states',
  single: true
};

function keyMetricColumnFormat(seriesDef) {
  if (seriesDef.percent) return { percent: true };
  if (seriesDef.kind === 'rate') return { format: 'currency' };
  if (/application|admit|enroll|fte/i.test(seriesDef.label) && seriesDef.label.indexOf('per FTE') === -1) return { format: 'count' };
  return { format: 'currency' };
}

function keyMetricCharts() {
  var admissions = sectionOverviewDefinition('admissions');
  var aid = sectionOverviewDefinition('aid');
  var finance = sectionOverviewDefinition('advancement-core');
  var scale = sectionOverviewDefinition('advancement-scale');
  var ops = sectionOverviewDefinition('advancement-ops');
  return [
    {
      canvasId: 'chart-key-admissions',
      title: 'Admissions',
      subtitle: 'Applications, admits, and enrollment on the left. Admit rate and yield on the right.',
      note: admissions.note,
      series: admissions.series.map(function (seriesDef) {
        return seriesDef.label === 'Admissions' ? Object.assign({}, seriesDef, { label: 'Admitted' }) : seriesDef;
      })
    },
    {
      canvasId: 'chart-key-aid',
      title: 'Tuition & aid',
      subtitle: 'Published tuition and net tuition revenue on the left. Discount rate and Pell eligibility on the right.',
      note: aid.note,
      series: aid.series
    },
    {
      canvasId: 'chart-key-finance',
      title: 'Endowment & philanthropy',
      subtitle: '',
      note: finance.note,
      series: finance.series.concat(scale.series.filter(function (seriesDef) { return seriesDef.label === 'FTE'; }))
    },
    {
      canvasId: 'chart-key-ops',
      title: 'Operating mix',
      subtitle: '',
      note: 'Philanthropic intensity is private giving divided by operating expenses.',
      series: ops.series.filter(function (seriesDef) {
        return seriesDef.label === 'Operating expenses' || seriesDef.label === 'Philanthropic intensity';
      })
    }
  ];
}

function keyMetricYearMap(rows, seriesDef) {
  var values = sectionOverviewSeriesValues(rows || [], seriesDef);
  var map = {};
  yearsOf(rows || []).forEach(function (year, index) {
    if (year) map[year] = values[index];
  });
  return map;
}

function keyMetricYears(rows) {
  var seen = {};
  return yearsOf(rows || []).filter(function (year) {
    if (!year || seen[year]) return false;
    seen[year] = true;
    return true;
  }).sort(function (a, b) { return surveyYearSortKey(a) - surveyYearSortKey(b); });
}

function keyMetricSnapshot(map, labels, year) {
  var chosen = year && Object.prototype.hasOwnProperty.call(map, year) && map[year] != null ? String(year) : '';
  if (!chosen) {
    for (var i = labels.length - 1; i >= 0; i--) {
      if (map[labels[i]] != null) { chosen = labels[i]; break; }
    }
  }
  var curr = chosen ? map[chosen] : null;
  var prev = null;
  var index = chosen ? labels.indexOf(chosen) : -1;
  for (var j = index - 1; j >= 0; j--) {
    if (map[labels[j]] != null) { prev = map[labels[j]]; break; }
  }
  return { year: chosen, curr: curr, prev: prev };
}

function keyMetricChangeHtml(curr, prev, format) {
  if (curr == null || prev == null || !isFinite(curr) || !isFinite(prev)) return '—';
  return yoyMarkup(curr, prev, format.percent ? 'points' : 'relative') || '—';
}

function renderKeyMetrics(mine, peers) {
  var host = $('key-metrics-board');
  if (!host) return;
  var rows = mine || [];
  if (!rows.length) {
    host.innerHTML = '<p class="key-metrics-empty">' + escapeHtml(trendMessage()) + '</p>';
    return;
  }
  var peerRows = state.peerQueryBlocked ? [] : (peers || []);
  var labels = keyMetricYears(rows);
  var focusYear = state.year ? String(state.year) : '';
  host.innerHTML = keyMetricCharts().map(function (def) {
    var body = def.series.map(function (seriesDef) {
      var format = keyMetricColumnFormat(seriesDef);
      var kind = format.percent ? 'percent' : (format.format === 'count' ? 'count' : 'currency');
      var instMap = keyMetricYearMap(rows, seriesDef);
      var peerMap = keyMetricYearMap(peerRows, seriesDef);
      var inst = keyMetricSnapshot(instMap, labels, focusYear);
      var peerValue = inst.year && peerMap[inst.year] != null ? peerMap[inst.year] : null;
      return '<tr><th scope="row">' + escapeHtml(seriesDef.label) + '</th>' +
        '<td class="key-metric-value">' + escapeHtml(metricDisplay(inst.curr, kind)) + '</td>' +
        '<td>' + keyMetricChangeHtml(inst.curr, inst.prev, format) + '</td>' +
        '<td>' + escapeHtml(metricDisplay(peerValue, kind)) + '</td></tr>';
    }).join('');
    return '<section class="key-metric-group"><h3 class="key-metric-group-title">' + escapeHtml(titleCaseLabel(def.title)) + '</h3>' +
      '<table class="key-metric-table"><thead><tr>' +
        '<th>Metric</th><th>Institution</th><th>Change</th><th>' + escapeHtml(peerLegendTag()) + '</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></section>';
  }).join('');
}

function renderShells() {
  var admissions = $('view-admissions');
  var advancement = $('view-advancement');
  var inst = state.institution || 'Select an institution';
  admissions.innerHTML =
    analyticsSection(
      'Admissions & yield',
      'Application growth is indexed to the first year. Admit rate and yield are read against the peer average. Enrollment is a line on its own scale beside applications and admits.',
      '<div id="admissions-funnel" class="adm-funnel" aria-live="polite"></div>' +
      '<div class="layout-grid layout-grid--admissions">' +
        '<div class="span-7 layout-cell layout-cell--stretch">' +
          panel('Application growth', 'First survey year = 100. ' + PEER_CMP_SUBTITLE, 'chart-index', false, 'chart-featured', true, true).replace(
            'class="panel panel--inset',
            'class="panel panel--inset panel--fluid'
          ) +
        '</div>' +
        '<div class="span-5 layout-cell layout-cell--stretch">' +
          splitChartPanel('Admit & yield rate', 'Each rate has its own scale, tightened around the data, with the peer average dashed.', [
            { id: 'chart-yield', label: 'Admit rate' },
            { id: 'chart-yield-rate', label: 'Yield' }
          ], 'chart-featured') +
        '</div>' +
        '<div class="span-12 layout-cell">' +
          panel('Applications, admitted, enrolled', 'Applications and admits are bars. Enrolled and year-over-year change are shown below.', 'chart-nested', false, 'chart-featured', true, true).replace(
            'class="panel panel--inset',
            'class="panel panel--inset panel--fluid'
          ) +
        '</div>' +
        '<div id="admissions-heat" class="span-12 layout-cell heat-host"></div>' +
      '</div>',
      'admissions'
    ) +
    analyticsSection(
      'Comparison institutions',
      'Ranked by application volume for the selected survey year.',
      '<div class="layout-grid"><div class="span-12 layout-cell">' +
        panel('Top 10 by applications', 'Rank and peer group', 'chart-top', true, 'chart-rank', true).replace(
          'class="box-subtitle"',
          'class="box-subtitle" data-rank-sub="admissions"'
        ) +
      '</div></div>',
      'ranking'
    ) +
    analyticsSection(
      'Tuition & aid',
      'Price, discount, and Pell eligibility, with the peer average on the same chart.',
      '<div class="layout-grid layout-grid--aid">' +
        '<div class="span-7 layout-cell layout-cell--stretch">' + pair('Discount rate', 'chart-discount', 'chart-featured') + '</div>' +
        '<div class="span-5 layout-cell layout-cell--stretch">' +
          panel('Discount rate change', 'Year-over-year percent. ' + PEER_CMP_SUBTITLE, 'chart-discount-yoy', false, 'chart-compact', true, true).replace(
            'class="panel panel--inset',
            'class="panel panel--inset panel--fluid'
          ) +
        '</div>' +
        '<div class="span-7 layout-cell layout-cell--stretch">' + pair('Pell eligibility', 'chart-pell', 'chart-featured') + '</div>' +
        '<div class="span-5 layout-cell layout-cell--stretch">' +
          panel('Pell eligibility change', 'Year-over-year percent. ' + PEER_CMP_SUBTITLE, 'chart-pell-yoy', false, 'chart-compact', true, true).replace(
            'class="panel panel--inset',
            'class="panel panel--inset panel--fluid'
          ) +
        '</div>' +
        '<div class="span-12 layout-cell layout-cell--stretch">' +
          panel('Sticker and net price', 'Published tuition and net tuition revenue. ' + PEER_CMP_SUBTITLE, 'chart-price', false, 'chart-featured', true, true).replace(
            'class="panel panel--inset',
            'class="panel panel--inset panel--fluid'
          ).replace(
            '</article>',
            '<footer class="panel-footer"><a href="https://marketiq.3enrollment.com/" target="_blank" rel="noopener">3E MarketIQ</a></footer></article>'
          ) +
        '</div>' +
      '</div>',
      'aid'
    ) +
    analyticsSection(
      'Migration',
      'Where this institution’s first-time freshmen lived in the selected survey year. The map below answers a different question: where students from the home state enrolled, at any school.',
      '<div class="layout-grid layout-grid--migration">' +
        '<div class="span-7 layout-cell layout-cell--stretch">' + pair('State of residence', 'chart-residence', 'chart-featured') + '</div>' +
        '<section class="span-5 layout-cell oos-card oos-card--map">' +
          '<div class="oos-card-head">' +
            '<h3 class="oos-card-title" id="oos-map-title">Where students from the home state enroll</h3>' +
            '<button type="button" class="btn-text" data-detail="oos-reach">Details</button>' +
          '</div>' +
          '<p class="oos-card-lead" id="oos-map-lead"></p>' +
          '<div id="oos-map" class="oos-map"></div>' +
          '<p class="oos-legend" id="oos-legend"></p>' +
        '</section>' +
      '</div>',
      'migration'
    ) +
    analyticsSection(
      'Home-state enrollment',
      'Every student from the institution’s home state, and the schools where they enrolled. This is not the selected institution’s roster. The residence chart above is where this institution’s freshmen lived.',
      '<div class="origin-row" id="filter-origin-wrap"></div>' +
      '<div id="oos-board" class="oos-board">' +
        '<div id="oos-kpis" class="oos-kpis"></div>' +
        '<div class="layout-grid layout-grid--oos">' +
          '<section class="span-5 layout-cell oos-card oos-card--states">' +
            '<div class="oos-card-head">' +
              '<h3 class="oos-card-title">States</h3>' +
              '<p class="oos-card-meta" id="oos-state-meta"></p>' +
            '</div>' +
            '<div id="oos-states" class="oos-states"></div>' +
          '</section>' +
          '<section class="span-7 layout-cell oos-card oos-card--schools">' +
            '<div class="oos-card-head"><h3 class="oos-card-title" id="oos-schools-title">Schools</h3></div>' +
            '<div id="oos-schools" class="oos-schools"></div>' +
          '</section>' +
        '</div>' +
      '</div>',
      'oos'
    );

  advancement.innerHTML =
    '<div id="advancement-kpi-strip" class="kpi-strip kpi-strip--finance" aria-live="polite"></div>' +
    analyticsSection(
      'Where ' + inst + ' stands',
      '',
      '<p class="adv-takeaway" id="adv-takeaway-stand" aria-live="polite"></p>' +
      '<div id="adv-stand-mount" class="adv-stand-mount" role="list" aria-label="Percentile standing among comparison peers"></div>',
      'advancement-stand',
      {
        headAside: '<a class="section-head-link section-head-link--advancement" href="https://fundraising.3enrollment.com/#contact" target="_blank" rel="noopener">Fundraising contact</a>'
      }
    ) +
    analyticsSection(
      'How it\'s changing',
      '',
      '<p class="adv-takeaway" id="adv-takeaway-change" aria-live="polite"></p>' +
      '<div class="adv-explorer" id="adv-explorer">' +
        '<div class="adv-explorer-toolbar">' +
          '<div class="adv-metric-chips" role="tablist" aria-label="Metric">' + advancementTrendChipMarkup() + '</div>' +
          '<div class="adv-mode-toggle" role="group" aria-label="Value display">' +
            '<button type="button" class="adv-mode-btn is-active" data-adv-mode="actual">Actual</button>' +
            '<button type="button" class="adv-mode-btn" data-adv-mode="indexed">Indexed to first year</button>' +
          '</div>' +
        '</div>' +
        '<div class="adv-explorer-body">' +
          '<div class="adv-explorer-chart-col">' +
            '<div class="adv-explorer-chart-head">' +
              '<p class="adv-explorer-chart-title" id="adv-explorer-chart-title">Trend</p>' +
              '<button type="button" class="btn-text panel-tools" data-detail="chart-adv-explorer">Details</button>' +
            '</div>' +
            '<div id="adv-explorer-chart-wrap" class="adv-explorer-chart-wrap chart-wrap chart-wrap--data">' +
              '<canvas id="chart-adv-explorer" aria-label="Advancement trend chart"></canvas>' +
            '</div>' +
          '</div>' +
          '<aside class="adv-explorer-side" id="adv-explorer-side" aria-live="polite"></aside>' +
        '</div>' +
      '</div>' +
      '<div id="advancement-heat" class="heat-host"></div>',
      'advancement-changing'
    ) +
    analyticsSection(
      'Who ' + inst + ' is compared to',
      '',
      panel('Top 10 by endowment', 'Rank among comparison peers', 'chart-adv-top', true, 'chart-rank', true).replace(
        'class="box-subtitle"',
        'class="box-subtitle" data-rank-sub="advancement"'
      ),
      'advancement-ranking'
    );

  $('view-keymetrics').innerHTML =
    analyticsSection(
      'Key metrics',
      'Headline numbers for the selected survey year, with the change from the prior year and the peer average.',
      '<div id="key-metrics-board" class="key-metrics-board" aria-live="polite"></div>',
      'keymetrics'
    );

  $('view-faq').innerHTML =
    analyticsSection(
      'FAQ & glossary',
      'How to use this card and what each headline metric means.',
      '<div class="help-hub">' +
        '<div class="help-hub-nav faq-subtabs-wrap">' +
          '<div class="page-tabs help-hub-tabs" role="tablist" aria-label="Help topics">' +
            '<button type="button" class="page-tab faq-subtab is-active" role="tab" aria-selected="true" aria-controls="faq-subpanel-faq" id="faq-subtab-faq" data-faq-panel="faq">FAQ</button>' +
            '<button type="button" class="page-tab faq-subtab" role="tab" aria-selected="false" aria-controls="faq-subpanel-glossary" id="faq-subtab-glossary" tabindex="-1" data-faq-panel="glossary">Glossary</button>' +
          '</div>' +
        '</div>' +
        '<article class="panel panel--inset panel--static help-panel help-panel--faq faq-subpanel" id="faq-subpanel-faq" role="tabpanel" aria-labelledby="faq-subtab-faq">' +
          '<header class="help-panel-head">' +
            '<span class="help-panel-accent help-panel-accent--accent" aria-hidden="true"></span>' +
            '<div class="help-panel-head-text">' +
              '<h2 class="help-panel-title">Product FAQ</h2>' +
              '<p class="help-panel-lead">Using filters, peers, and the Admissions, Advancement, and migration views.</p>' +
            '</div>' +
          '</header>' +
          '<div class="help-panel-scroll" tabindex="0">' +
            '<ol class="faq-list" id="faq-list"></ol>' +
          '</div>' +
        '</article>' +
        '<article class="panel panel--inset panel--static help-panel help-panel--glossary faq-subpanel hidden" id="faq-subpanel-glossary" role="tabpanel" aria-labelledby="faq-subtab-glossary" aria-hidden="true" hidden>' +
          '<header class="help-panel-head">' +
            '<span class="help-panel-accent help-panel-accent--mint" aria-hidden="true"></span>' +
            '<div class="help-panel-head-text">' +
              '<h2 class="help-panel-title">Metric glossary</h2>' +
              '<p class="help-panel-lead">Definitions for labels used across Admissions, Advancement, and key metrics.</p>' +
            '</div>' +
          '</header>' +
          '<div class="help-panel-scroll" tabindex="0">' +
            '<dl class="glossary" id="glossary-list"></dl>' +
          '</div>' +
        '</article>' +
      '</div>',
      'faq'
    );
  setFaqPanel(state.faqPanel);

  $('faq-list').innerHTML = FAQS.map(function (item, index) {
    return '<li class="faq-item">' +
      '<p class="faq-item-q"><span class="faq-item-num" aria-hidden="true">' + (index + 1) + '</span>' + escapeHtml(item[0]) + '</p>' +
      '<p class="faq-item-a">' + escapeHtml(item[1]) + '</p></li>';
  }).join('');
  $('glossary-list').innerHTML = GLOSSARY.map(function (item) {
    return '<div class="glossary-row"><dt>' + escapeHtml(item[0]) + '</dt><dd>' + escapeHtml(item[1]) + '</dd></div>';
  }).join('');
}

function setFaqPanel(panel) {
  if (panel !== 'faq' && panel !== 'glossary') panel = 'faq';
  state.faqPanel = panel;
  document.querySelectorAll('.faq-subtab').forEach(function (btn) {
    var on = btn.getAttribute('data-faq-panel') === panel;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    btn.setAttribute('tabindex', on ? '0' : '-1');
  });
  ['faq', 'glossary'].forEach(function (name) {
    var el = $('faq-subpanel-' + name);
    if (!el) return;
    var show = name === panel;
    el.classList.toggle('hidden', !show);
    el.hidden = !show;
    el.setAttribute('aria-hidden', show ? 'false' : 'true');
  });
}

function resizeChartsInView(page) {
  var view = $('view-' + page);
  if (!view) return;
  view.querySelectorAll('canvas').forEach(function (canvas) {
    var chart = charts[canvas.id];
    if (chart && typeof chart.resize === 'function') chart.resize();
  });
}

function pageChartsReady(page) {
  var ids = chartIdsForPage(page).filter(function (id) { return !!$(id); });
  if (!ids.length) return false;
  return ids.every(function (id) {
    if (charts[id]) return true;
    var spec = detailStore[id];
    return !!(spec && (spec.empty || spec.error) && !spec.build);
  });
}

function setPage(page) {
  if (!page || page === state.page) return;
  if (openDetailId) {
    var canvas = $(openDetailId);
    var nextView = $('view-' + page);
    if (!canvas || !nextView || !nextView.contains(canvas)) closeDetail();
  }
  state.page = page;
  document.querySelectorAll('.page-tab').forEach(function (btn) {
    var on = btn.getAttribute('data-page') === page;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    btn.setAttribute('tabindex', on ? '0' : '-1');
  });
  ['admissions', 'advancement', 'keymetrics', 'faq'].forEach(function (name) {
    var view = $('view-' + name);
    if (!view) return;
    var show = name === page;
    view.classList.toggle('hidden', !show);
    view.setAttribute('aria-hidden', show ? 'false' : 'true');
  });
  var filterWrap = document.querySelector('.filter-bar-wrap');
  var guide = document.querySelector('.guide-line');
  var filtersOnPage = isDashboardDataPage(page);
  if (filterWrap) filterWrap.classList.toggle('hidden', !filtersOnPage);
  if (guide) {
    guide.classList.toggle('hidden', page === 'faq');
    if (page === 'admissions') {
      guide.textContent = 'Choose an institution. Comparison starts on the most similar default group. Open comparison filters to change it, then Apply. Reset restores the default institution and that default group.';
    } else if (page === 'advancement') {
      guide.textContent = 'Choose an institution. Comparison starts on the most similar default group. Change the comparison filters, then Apply.';
    }
  }
  if (page === 'faq') setFaqPanel(state.faqPanel);
  syncReportButton();
  requestAnimationFrame(function () {
    if (state.page !== page) return;
    if (filtersOnPage) {
      var host = $('filter-fields');
      if (!host || !host.childElementCount) {
        mountFilters();
        populateFilters();
      }
    }
    if (isDashboardDataPage(page)) {
      var fresh = state.pageSerial[page] === state.paintSerial && pageChartsReady(page);
      if (!fresh) {
        var cache = state.paintCache;
        var coreOnly = page === 'admissions' && cache && !cache.migrationReady && state.connected.migration;
        renderPaintedCharts({ coreOnly: coreOnly, preserveOther: true });
      }
      resizeChartsInView(page);
    }
  });
}

var menuSearchQueries = {};
var MENU_RENDER_CAP = 80;
var INSTITUTION_MENU_RENDER_CAP = 400;
var institutionOptionsPromise = null;

function fillSelect(select, values, placeholder, selected) {
  if (!select) return;
  var html = '<option value="">' + escapeHtml(placeholder) + '</option>';
  values.forEach(function (value) {
    html += '<option value="' + escapeHtml(value) + '"' + (String(value) === String(selected) ? ' selected' : '') + '>' + escapeHtml(value) + '</option>';
  });
  select.innerHTML = html;
}

function emptyDraft() {
  var draft = {};
  FILTERS.forEach(function (def) { draft[def.key] = []; });
  draft.origin = [];
  return draft;
}

function filterKeysForPage(page) {
  if (isDashboardDataPage(page)) return ADMISSIONS_FILTER_KEYS.slice();
  return [];
}

function visibleFilters() {
  var page = state.page || 'admissions';
  var keys = filterKeysForPage(page);
  return keys.map(filterByKey).filter(function (def) {
    if (!def || def.hidden) return false;
    if (!state.columns.length) return true;
    if (def.column === 'INSTNM') return hasColumn(def.column);
    return hasColumn(def.column);
  });
}

function sortValues(values, desc) {
  return values.slice().sort(function (a, b) {
    var cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    return desc ? -cmp : cmp;
  });
}

function isComparisonFilterKey(key) {
  return ADMISSIONS_COMPARISON_KEYS.indexOf(key) !== -1;
}

function rowMatchesExcept(row, exceptKey) {
  var i;
  for (i = 0; i < FILTERS.length; i++) {
    var def = FILTERS[i];
    if (def.key === exceptKey) continue;
    if (def.key === 'comparisons' && exceptKey === 'institution') continue;
    if (def.key === 'institution' && exceptKey === 'comparisons') continue;
    var selected = state.draft[def.key] || [];
    if (!selected.length) continue;
    if (selected.indexOf(str(row[def.column])) === -1) return false;
  }
  return true;
}

function rowMatchesComparisonOptions(row, exceptKey) {
  var i;
  for (i = 0; i < FILTERS.length; i++) {
    var def = FILTERS[i];
    if (!isComparisonFilterKey(def.key)) continue;
    if (def.key === exceptKey) continue;
    var selected = state.draft[def.key] || [];
    if (!selected.length) continue;
    if (selected.indexOf(str(row[def.column])) === -1) return false;
  }
  return true;
}

function globalOptionsForComparison(def) {
  var source = def.key === 'comparisons'
    ? (state.options.institutions || [])
    : (state.options[def.key] || []);
  if (!source.length) return null;
  var values = [];
  var seen = {};
  var chosenInst = state.draft.institution && state.draft.institution[0];
  source.forEach(function (value) {
    var v = str(value);
    if (!v || seen[v]) return;
    if (def.key === 'comparisons' && chosenInst && v === chosenInst) return;
    seen[v] = true;
    values.push(v);
  });
  return sortValues(values, def.sort === 'desc');
}

function optionsFor(def) {
  if (def.key === 'institution') {
    return sortValues((state.options.institutions || []).slice(), def.sort === 'desc');
  }
  if (def.key === 'partition') {
    return sortValues((state.options.partition || []).slice(), def.sort === 'desc');
  }
  if (def.key === 'year') {
    return sortValues((state.options.years || []).slice(), true);
  }
  if (isComparisonFilterKey(def.key)) {
    var globalOpts = globalOptionsForComparison(def);
    if (globalOpts && globalOpts.length) return globalOpts;
  }
  var values = [];
  var seen = {};
  if (state.lookup.length) {
    state.lookup.forEach(function (row) {
      if (isComparisonFilterKey(def.key)) {
        if (!rowMatchesComparisonOptions(row, def.key)) return;
      } else if (!rowMatchesExcept(row, def.key)) return;
      var value = str(row[def.column]);
      if (!value || seen[value]) return;
      if (def.key === 'comparisons') {
        var chosen = state.draft.institution && state.draft.institution[0];
        if (chosen && value === chosen) return;
      }
      seen[value] = true;
      values.push(value);
    });
    return sortValues(values, def.sort === 'desc');
  }
  var fallback = def.key === 'year' ? state.options.years
    : (def.key === 'institution' || def.key === 'comparisons' ? state.options.institutions : state.options[def.key]);
  (fallback || []).forEach(function (value) {
    if (!value || seen[value]) return;
    if (def.key === 'comparisons' && state.draft.institution && state.draft.institution[0] === value) return;
    seen[value] = true;
    values.push(value);
  });
  return sortValues(values, def.sort === 'desc');
}

function pruneDraft() {
  var pass;
  for (pass = 0; pass < 3; pass++) {
    visibleFilters().forEach(function (def) {
      var allow = {};
      optionsFor(def).forEach(function (value) { allow[value] = true; });
      state.draft[def.key] = (state.draft[def.key] || []).filter(function (value) { return allow[value]; });
    });
  }
}

function updateMultiLabel(labelEl, selected, allLabel, noun) {
  if (!labelEl) return;
  if (!selected.length) {
    labelEl.textContent = allLabel;
    return;
  }
  if (selected.length === 1) {
    labelEl.textContent = selected[0];
    return;
  }
  labelEl.textContent = selected.length + ' ' + noun + ' selected';
}

function anyFilterMenuOpen() {
  var menus = document.querySelectorAll('.multi-select-menu');
  for (var i = 0; i < menus.length; i++) {
    if (!menus[i].hidden) return true;
  }
  return false;
}

function closeMenusOnOutsideScroll(event) {
  if (!anyFilterMenuOpen()) return;
  var target = event.target;
  if (target && target.closest && target.closest('.multi-select-menu')) return;
  closeMenus(null);
}

function closeMenus(exceptId) {
  document.querySelectorAll('.multi-select-menu').forEach(function (menu) {
    if (exceptId && menu.id === exceptId) return;
    menu.hidden = true;
    var trigger = document.querySelector('[aria-controls="' + menu.id + '"]');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', 'false');
    var field = trigger.closest('.field-multi');
    if (field) field.classList.remove('is-open');
  });
}

function toggleMenu(trigger) {
  var menuId = trigger.getAttribute('aria-controls');
  var menu = $(menuId);
  if (!menu) return;
  var willOpen = !!menu.hidden;
  closeMenus(willOpen ? menuId : null);
  menu.hidden = !willOpen;
  trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  var field = trigger.closest('.field-multi');
  if (field) field.classList.toggle('is-open', willOpen);
  if (willOpen) {
    if (menuId === 'menu-institution') {
      if ((!state.options.institutions || !state.options.institutions.length) && state.lookup.length) {
        mergeInstitutionsFromLookup();
        refreshFilterMenu('institution');
      }
      if (!state.options.institutions || state.options.institutions.length < 2) {
        ensureInstitutionOptions().then(function () {
          refreshFilterMenu('institution');
        });
      }
    } else if (menuId === 'menu-partition') {
      ensurePartitionOptions().then(function () {
        if (state.options.partition && state.options.partition.length) populateFilters();
      });
    } else if (menuId === 'menu-year') {
      ensureSurveyYearOptions().then(function () {
        if (state.options.years && state.options.years.length) populateFilters();
      });
    } else if (menuId === 'menu-origin') {
      loadOriginStateOptions().then(function () {
        refreshOriginMenu();
        var mine = state.paintCache && state.paintCache.mine;
        var sample = mine && mine.length ? mine[mine.length - 1] : null;
        if (sample) syncOriginToInstitution(sample, true);
      });
    }
    var search = menu.querySelector('.multi-select-search-input');
    if (search) search.focus();
  }
}

function renderMultiMenu(def, options, menuScope) {
  menuScope = menuScope || 'main';
  var menuId = menuScope === 'detail' ? ('menu-detail-' + def.key) : ('menu-' + def.key);
  var menuEl = $(menuId);
  if (!menuEl) return;
  var draftBag = menuScope === 'detail' ? state.detailExploreDraft : state.draft;
  if (menuScope === 'detail' && !draftBag) state.detailExploreDraft = draftBag = emptyComparisonDraft();
  var selected = draftBag[def.key] || [];
  var selectedMap = {};
  selected.forEach(function (value) { selectedMap[value] = true; });
  var prevQuery = menuSearchQueries[menuEl.id] || '';
  var searchWasFocused = menuEl.contains(document.activeElement) &&
    document.activeElement.classList &&
    document.activeElement.classList.contains('multi-select-search-input');
  menuEl.innerHTML = '';

  var searchWrap = document.createElement('div');
  searchWrap.className = 'multi-select-search multi-select-menu-head';
  var searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'multi-select-search-input';
  searchInput.placeholder = 'Search…';
  searchInput.value = prevQuery;
  searchInput.setAttribute('autocomplete', 'off');
  searchInput.setAttribute('aria-label', 'Search ' + def.label);
  searchInput.addEventListener('click', function (event) { event.stopPropagation(); });
  searchInput.addEventListener('keydown', function (event) {
    event.stopPropagation();
    if (event.key === 'Enter') event.preventDefault();
  });
  searchWrap.appendChild(searchInput);

  var actions = document.createElement('div');
  actions.className = 'multi-select-actions';
  var clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'multi-select-clear-section';
  clearBtn.textContent = def.key === 'origin' ? 'Clear selection' : 'Clear selection';
  clearBtn.disabled = !selected.length;
  clearBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    draftBag[def.key] = [];
    menuSearchQueries[menuEl.id] = '';
    keepMenusOpen = true;
    if (menuScope === 'detail') refreshDetailExploreMenus();
    else if (def.key === 'origin') applyOriginPick([]);
    else populateFilters();
  });
  actions.appendChild(clearBtn);
  searchWrap.appendChild(actions);
  menuEl.appendChild(searchWrap);

  var listEl = document.createElement('div');
  listEl.className = 'multi-select-options';
  menuEl.appendChild(listEl);

  function paintOptions(query) {
    listEl.textContent = '';
    if (!options.length) {
      var empty = document.createElement('div');
      empty.className = 'multi-select-empty';
      empty.textContent = 'No options';
      listEl.appendChild(empty);
      return;
    }
    var q = str(query).toLowerCase();
    var selectedHits = [];
    var otherHits = [];
    options.forEach(function (value) {
      if (q && value.toLowerCase().indexOf(q) === -1) return;
      if (selectedMap[value]) selectedHits.push(value);
      else otherHits.push(value);
    });
    var shown = selectedHits.concat(otherHits);
    if (!shown.length) {
      var none = document.createElement('div');
      none.className = 'multi-select-empty';
      none.textContent = 'No matches';
      listEl.appendChild(none);
      return;
    }
    var matchCount = shown.length;
    var cap = def.key === 'institution' ? INSTITUTION_MENU_RENDER_CAP : MENU_RENDER_CAP;
    var capped = shown.length > cap;
    if (capped) shown = shown.slice(0, cap);
    var frag = document.createDocumentFragment();
    shown.forEach(function (value) {
      var row = document.createElement('label');
      row.className = 'multi-select-option';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.value = value;
      input.checked = !!selectedMap[value];
      input.addEventListener('change', function () {
        var list = (draftBag[def.key] || []).slice();
        if (def.single) {
          draftBag[def.key] = input.checked ? [value] : [];
        } else if (input.checked) {
          if (list.indexOf(value) === -1) list.push(value);
          draftBag[def.key] = list;
        } else {
          draftBag[def.key] = list.filter(function (item) { return item !== value; });
        }
        if (menuScope === 'detail') refreshDetailExploreMenus();
        else onFilterDraftChange(def);
      });
      var text = document.createElement('span');
      text.textContent = value;
      row.appendChild(input);
      row.appendChild(text);
      frag.appendChild(row);
    });
    if (capped) {
      var more = document.createElement('div');
      more.className = 'multi-select-more';
      more.textContent = 'Showing ' + cap + ' of ' + matchCount + '. Keep typing to narrow.';
      frag.appendChild(more);
    }
    listEl.appendChild(frag);
  }

  searchInput.addEventListener('input', function () {
    menuSearchQueries[menuEl.id] = searchInput.value;
    paintOptions(searchInput.value);
  });
  paintOptions(prevQuery);
  if (searchWasFocused) searchInput.focus();
}

function filterFieldMarkup(def, extraClass) {
  var wide = def.wide ? ' field-multi--wide' : '';
  extraClass = extraClass || '';
  return '<div class="field field-multi' + wide + extraClass + '">' +
    '<span class="field-label" id="label-' + def.key + '">' + escapeHtml(titleCaseLabel(def.label)) + '</span>' +
    '<div class="multi-select">' +
      '<button type="button" class="multi-select-trigger" id="trigger-' + def.key + '" aria-expanded="false" aria-controls="menu-' + def.key + '" aria-labelledby="label-' + def.key + '">' +
        '<span id="trigger-label-' + def.key + '">' + escapeHtml(def.allLabel) + '</span>' +
        '<span class="multi-select-caret" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="multi-select-menu" id="menu-' + def.key + '" hidden role="group" aria-label="' + escapeHtml(titleCaseLabel(def.label)) + '"></div>' +
    '</div></div>';
}

function bindFilterMenus(host) {
  if (!host) return;
  host.querySelectorAll('.multi-select-menu').forEach(function (menu) {
    menu.addEventListener('click', function (event) { event.stopPropagation(); });
  });
  host.querySelectorAll('.multi-select-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      toggleMenu(trigger);
    });
  });
}

function mountFilters() {
  var host = $('filter-fields');
  if (!host) return;
  var defs = visibleFilters();
  var actions =
    '<div class="field-filter-actions filter-bar-actions">' +
      '<button type="button" id="btn-reset-filters" class="filter-btn filter-btn--reset">Reset</button>' +
      '<button type="button" id="btn-apply-filters" class="filter-btn filter-btn--apply">Apply</button>' +
    '</div>';
  if (isDashboardDataPage(state.page)) {
    var byKey = {};
    defs.forEach(function (def) { byKey[def.key] = def; });
    var primary = (byKey.institution ? filterFieldMarkup(byKey.institution, ' field-multi--primary') : '') +
      (byKey.year ? filterFieldMarkup(byKey.year, ' field-multi--primary') : '');
    var comparisonHtml = ADMISSIONS_COMPARISON_KEYS.map(function (key) {
      return byKey[key] ? filterFieldMarkup(byKey[key], ' field-multi--comparison') : '';
    }).join('');
    host.innerHTML =
      '<div class="filter-layout filter-layout--admissions">' +
        '<div class="filter-layout-primary">' + primary + actions + '</div>' +
        '<details class="filter-comparisons-details" id="filter-comparisons-details">' +
          '<summary class="filter-comparisons-summary">' + escapeHtml(titleCaseLabel('Comparison filters')) +
            ' <span class="filter-comparisons-summary-hint">(' + escapeHtml(titleCaseLabel('optional')) + ')</span></summary>' +
          '<div class="filter-layout-comparisons">' + comparisonHtml + '</div>' +
        '</details>' +
      '</div>';
  } else {
    host.innerHTML =
      '<div class="filter-layout">' +
        '<div class="filter-layout-row">' +
          '<div class="filter-layout-fields filter-fields">' +
            defs.map(function (def) { return filterFieldMarkup(def); }).join('') +
          '</div>' +
          actions +
        '</div>' +
      '</div>';
  }
  bindFilterMenus(host);
}

function applyOriginPick(values) {
  state.draft.origin = (values || []).slice();
  state.originState = state.draft.origin[0] || '';
  state.originPinned = true;
  state.originInstitution = state.institution;
  state.oosFocus = '';
  refreshOriginMenu();
  if (!state.originState) {
    applyOriginData(null);
    return;
  }
  paintOosMessage('loading', 'Loading migration for ' + state.originState + '.');
  loadOrigin().then(function (rows) {
    applyOriginData(rows);
  });
}

function mountOriginPicker() {
  var host = $('filter-origin-wrap');
  if (!host) return;
  host.innerHTML = filterFieldMarkup(ORIGIN_DEF, ' field-multi--origin');
  bindFilterMenus(host);
  refreshOriginMenu();
}

function refreshOriginMenu() {
  if (!($('menu-origin'))) return;
  if (state.originState && !(state.draft.origin || []).length) {
    state.draft.origin = [state.originState];
  }
  renderMultiMenu(ORIGIN_DEF, state.options.originStates || []);
  updateMultiLabel($('trigger-label-origin'), state.draft.origin || [], ORIGIN_DEF.allLabel, ORIGIN_DEF.noun);
}

function applyPreferred(def, flagName, pick) {
  if (!def || state[flagName] || visibleFilters().indexOf(def) === -1) return;
  if ((state.draft[def.key] || []).length) {
    state[flagName] = true;
    return;
  }
  var chosen = pick(optionsFor(def));
  if (!chosen) return;
  state.draft[def.key] = [chosen];
  state[flagName] = true;
}

function namesForInstitutionDefault() {
  return (state.options.institutions || []).slice();
}

function preferredInstitutionName(names) {
  if (!names || !names.length) return '';
  var name = matchPreferred(names, DEFAULT_INSTITUTION) ||
    matchPreferred(names, 'High Point University') ||
    matchPreferred(names, 'HighPoint');
  if (name) return name;
  var plain = names.filter(function (n) { return str(n).indexOf(',') === -1; });
  return plain.length ? plain[0] : names[0];
}

function latestYearForSelection() {
  var years = [];
  var seen = {};
  var partCol = partitionColumn();
  var selectedPart = (state.draft.partition || [])[0] || '';
  var selectedInst = (state.draft.institution || [])[0] || '';
  if (state.lookup.length) {
    state.lookup.forEach(function (row) {
      if (selectedPart && partCol && str(row[partCol]) !== selectedPart) return;
      if (selectedInst && str(row.INSTNM) !== selectedInst) return;
      var year = str(row.SURVEY_YEAR);
      if (!year || seen[year]) return;
      seen[year] = true;
      years.push(year);
    });
    return sortValues(years, true)[0] || '';
  }
  return sortValues(state.options.years || [], true)[0] || '';
}

function allPartitionsFromLookup() {
  var col = partitionColumn();
  if (!col || !state.lookup.length) return [];
  var seen = {};
  state.lookup.forEach(function (row) {
    var value = str(row[col]);
    if (value) seen[value] = true;
  });
  return sortValues(Object.keys(seen), false);
}

function refreshFilterMenu(defKey) {
  var def = filterByKey(defKey);
  if (!def || visibleFilters().indexOf(def) === -1) return;
  pruneDraft();
  renderMultiMenu(def, optionsFor(def));
  updateMultiLabel($('trigger-label-' + def.key), state.draft[def.key] || [], def.allLabel, def.noun);
}

function onFilterDraftChange(def) {
  keepMenusOpen = true;
  if (def.key === 'origin') {
    applyOriginPick(state.draft.origin);
    return;
  }
  if (def.key === 'institution') {
    var chosen = state.draft.institution && state.draft.institution[0];
    if (chosen && state.draft.comparisons && state.draft.comparisons.length) {
      state.draft.comparisons = state.draft.comparisons.filter(function (v) { return v !== chosen; });
    }
    refreshFilterMenu('institution');
    if (visibleFilters().some(function (d) { return d.key === 'comparisons'; })) refreshFilterMenu('comparisons');
    return;
  }
  if (def.single) {
    refreshFilterMenu(def.key);
    return;
  }
  populateFilters();
}

function populateFilters() {
  var inst = filterByKey('institution');
  if (inst && !state.didDefaultInstitution && !(state.draft.institution || []).length && visibleFilters().indexOf(inst) !== -1) {
    var names = namesForInstitutionDefault();
    var name = preferredInstitutionName(names);
    if (name) {
      state.draft.institution = [name];
      state.didDefaultInstitution = true;
    }
  }
  if (!state.didDefaultYear && !(state.draft.year || []).length) {
    var year = latestYearForSelection();
    if (year) {
      state.draft.year = [year];
      state.didDefaultYear = true;
    }
  }
  pruneDraft();
  visibleFilters().forEach(function (def) {
    var options = optionsFor(def);
    renderMultiMenu(def, options);
    updateMultiLabel($('trigger-label-' + def.key), state.draft[def.key] || [], def.allLabel, def.noun);
  });
  syncComparisonFiltersPanel();
}

function formatKpiNumber(value) {
  if (value == null || !isFinite(value)) return '—';
  return Math.round(value).toLocaleString();
}

function formatKpiPercent(value) {
  if (value == null || !isFinite(value)) return '—';
  var n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!isFinite(n)) return '—';
  if (n <= 1.5) n *= 100;
  return n.toFixed(1) + '%';
}

function rowMatchingYear(rows, year) {
  if (!rows || !rows.length) return null;
  if (!year) return rows[rows.length - 1];
  var hits = rows.filter(function (row) { return str(row.SURVEY_YEAR) === String(year); });
  return hits.length ? hits[hits.length - 1] : null;
}

function priorYearRow(rows, year) {
  if (!rows || !rows.length || !year) return null;
  var key = surveyYearSortKey(year);
  var candidates = rows.filter(function (row) { return surveyYearSortKey(row.SURVEY_YEAR) < key; });
  if (!candidates.length) return null;
  candidates.sort(function (a, b) { return surveyYearSortKey(a.SURVEY_YEAR) - surveyYearSortKey(b.SURVEY_YEAR); });
  return candidates[candidates.length - 1];
}

function scaledPercent(value) {
  if (value == null || !isFinite(value)) return null;
  return value <= 1.5 ? value * 100 : value;
}

function yoyMarkup(curr, prev, mode) {
  if (curr == null || prev == null) return '';
  var delta = mode === 'points' ? (curr - prev) : (!prev ? null : ((curr - prev) / Math.abs(prev)) * 100);
  if (delta == null || !isFinite(delta)) return '';
  var cls = delta > 0.05 ? 'kpi-yoy-up' : (delta < -0.05 ? 'kpi-yoy-down' : '');
  var arrow = delta > 0.05 ? '▲' : (delta < -0.05 ? '▼' : '–');
  var unit = '% YoY';
  return '<span class="kpi-chip-meta ' + cls + '">' + arrow + ' ' + Math.abs(delta).toFixed(1) + unit + '</span>';
}

function sparklineSvg(values) {
  var nums = (values || []).filter(function (v) { return v != null && isFinite(v); });
  if (nums.length < 2) return '';
  var min = Math.min.apply(null, nums);
  var max = Math.max.apply(null, nums);
  var span = (max - min) || 1;
  var width = 120;
  var height = 22;
  var pts = nums.map(function (v, i) {
    var x = (i / (nums.length - 1)) * width;
    var y = height - ((v - min) / span) * (height - 2) - 1;
    return x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
  var stroke = document.documentElement.getAttribute('data-theme') === 'dark' ? '#FFE566' : '#8C6A00';
  return '<svg class="kpi-chip-spark" viewBox="0 0 ' + width + ' ' + height + '" aria-hidden="true"><polyline fill="none" stroke="' + stroke + '" stroke-width="1.75" points="' + pts + '"/></svg>';
}

function advancementNominalPeerN(peerRows, year) {
  var peerAgg = (state.paintCache && state.paintCache.peerAggregates) || [];
  var peerRow = rowMatchingYear(peerAgg, year || state.year);
  if (peerRow && peerRow.PEER_N != null) return Math.round(num(peerRow.PEER_N));
  var seen = {};
  rowsForYear(peerRows || [], year || state.year).forEach(function (row) {
    var name = str(row.INSTNM);
    if (!name || (state.institution && name === state.institution)) return;
    seen[name] = true;
  });
  return Object.keys(seen).length;
}

function peerOrdinalRank(institutionValue, peerValues) {
  var peers = sortedNums(peerValues);
  if (institutionValue == null || !peers.length) return null;
  return peers.filter(function (value) { return value > institutionValue; }).length + 1;
}

function peerCoveragePhrase(dataN, nominalN) {
  if (!dataN || !nominalN || dataN >= nominalN) return '';
  return ' (based on ' + dataN + ' of ' + nominalN + ' peers)';
}

function higherThanPeersLabel(percentile) {
  if (percentile == null || !isFinite(percentile)) return '';
  return 'Higher than ' + Math.round(percentile) + '% of peers';
}

function peerComparisonRankLabel(institutionValue, peerValues, nominalN) {
  var dataN = sortedNums(peerValues).length;
  if (institutionValue == null || dataN < 1) return '';
  var pct = percentileOf(institutionValue, peerValues);
  return higherThanPeersLabel(pct) + peerCoveragePhrase(dataN, nominalN || dataN);
}

function formatPeerRankSubtitle(rank, dataN, nominalN) {
  if (!rank || !dataN) return '';
  var text = 'Rank ' + rank + ' of ' + dataN + ' peers';
  if (nominalN && dataN < nominalN) text += ' (based on ' + dataN + ' of ' + nominalN + ' peers with data)';
  return text;
}

function peerMetricBundle(peerRows, mine, year, valueFn) {
  var nominalN = advancementNominalPeerN(peerRows, year);
  var peerValues = [];
  rowsForYear(peerRows || [], year).forEach(function (row) {
    if (state.institution && str(row.INSTNM) === state.institution) return;
    var value = valueFn(row);
    if (value != null && isFinite(value)) peerValues.push(value);
  });
  var instRow = rowMatchingYear(mine, year) || (mine && mine.length ? mine[mine.length - 1] : null);
  var instValue = instRow ? valueFn(instRow) : null;
  return {
    instValue: instValue,
    peerValues: peerValues,
    dataN: peerValues.length,
    nominalN: nominalN,
    percentile: instValue == null ? null : percentileOf(instValue, peerValues),
    rank: instValue == null ? null : peerOrdinalRank(instValue, peerValues),
    peerMedian: quantileSorted(sortedNums(peerValues), 0.5)
  };
}

function advancementStandMetricDefs() {
  var endowCol = field('endowment');
  var givingCol = field('giving');
  var fteCol = field('fte');
  var givingField = givingCol;
  var opexField = field('opex');
  return [
    { key: 'endowment', label: 'Endowment', format: 'currency', value: function (row) { return endowCol ? num(row[endowCol]) : null; } },
    { key: 'giving', label: 'Private giving', format: 'currency', value: function (row) { return givingField ? num(row[givingField]) : null; } },
    { key: 'fte', label: 'FTE', format: 'count', value: function (row) { return fteCol ? num(row[fteCol]) : null; } },
    {
      key: 'endow_fte',
      label: 'Endowment / FTE',
      format: 'currency',
      value: function (row) {
        var direct = num(row.ENDOWMENT_PER_FTE);
        if (direct != null) return direct;
        var fteVal = fteCol ? num(row[fteCol]) : null;
        var endowVal = endowCol ? num(row[endowCol]) : null;
        return fteVal ? endowVal / fteVal : null;
      }
    },
    {
      key: 'phil_intensity',
      label: 'Philanthropic intensity',
      format: 'percent',
      value: function (row) {
        if (!givingField || !opexField) return null;
        var gift = num(row[givingField]);
        var opex = num(row[opexField]);
        if (gift == null || !opex) return null;
        return (gift / opex) * 100;
      }
    }
  ];
}

function metricFormatDisplay(value, format) {
  if (value == null || !isFinite(value)) return '—';
  if (format === 'percent') return formatKpiPercent(value);
  if (format === 'currency') return formatChartCurrency(value);
  return formatKpiNumber(value);
}

function mountAdvPercentileStand(mine, peerRows) {
  var host = $('adv-stand-mount');
  if (!host) return;
  if (advancementPeerListPending()) {
    showAdvancementPeerDependentLoading();
    return;
  }
  var year = state.year;
  var inst = state.institution;
  if (!inst || !year) {
    host.className = 'adv-stand-mount';
    host.innerHTML = '<p class="chart-empty">Select an institution and survey year.</p>';
    return;
  }
  var errMsg = advancementPeerListErrorMessage();
  if (errMsg && !(peerRows && peerRows.length)) {
    showAdvancementPeerDependentError('Peer data couldn\'t load: ' + errMsg);
    return;
  }
  if (!peerRows || !peerRows.length) {
    host.className = 'adv-stand-mount';
    host.innerHTML = '<p class="chart-empty">No peer data for survey year ' + escapeHtml(year) + '.</p>';
    return;
  }
  var defs = advancementStandMetricDefs();
  var rowMeta = [];
  var rowsHtml = defs.map(function (def) {
    var bundle = peerMetricBundle(peerRows, mine, year, def.value);
    if (!bundle.dataN && bundle.instValue == null) {
      return '<div class="adv-pct-row adv-pct-row--empty" role="listitem"><span class="adv-pct-label">' + escapeHtml(def.label) + '</span><span class="adv-pct-missing">No peer data for ' + escapeHtml(year) + '.</span></div>';
    }
    if (bundle.instValue == null) {
      return '<div class="adv-pct-row adv-pct-row--empty" role="listitem" aria-label="' + escapeHtml(def.label + ': no institution data for ' + year) + '">' +
        '<span class="adv-pct-label">' + escapeHtml(def.label) + '</span>' +
        '<span class="adv-pct-missing">No data for ' + escapeHtml(year) + '.</span></div>';
    }
    var pct = bundle.percentile == null ? null : Math.max(0, Math.min(100, bundle.percentile));
    var higher = higherThanPeersLabel(bundle.percentile);
    var coverage = bundle.dataN < bundle.nominalN
      ? '<span class="adv-pct-coverage">Based on ' + bundle.dataN + ' of ' + bundle.nominalN + ' peers</span>'
      : '';
    var aria = def.label + ': ' + (higher || 'no peer comparison') + '. ' + inst + ' ' + metricFormatDisplay(bundle.instValue, def.format) +
      '. Peer median ' + metricFormatDisplay(bundle.peerMedian, def.format) + '.';
    if (bundle.dataN < bundle.nominalN) aria += ' Based on ' + bundle.dataN + ' of ' + bundle.nominalN + ' peers.';
    rowMeta.push({ def: def, bundle: bundle });
    var idx = rowMeta.length - 1;
    return '<div class="adv-pct-row adv-pct-row--data" role="listitem" aria-label="' + escapeHtml(aria) + '" data-adv-pct-row="' + idx + '" data-metric="' + escapeHtml(def.key) + '" tabindex="0">' +
      '<div class="adv-pct-label">' + escapeHtml(def.label) + '</div>' +
      '<div class="adv-pct-track-wrap">' +
        '<p class="adv-pct-track-hint">Percentile among peers (0 = lowest, 100 = highest)</p>' +
        '<div class="adv-pct-track">' +
          '<span class="adv-pct-median" aria-hidden="true"></span>' +
          '<span class="adv-pct-median-label">Peer median</span>' +
          (pct == null ? '' : '<span class="adv-pct-fill" style="width:' + pct.toFixed(1) + '%" aria-hidden="true"></span>') +
          (pct == null ? '' : '<span class="adv-pct-marker" style="left:' + pct.toFixed(1) + '%" aria-hidden="true"></span>') +
        '</div>' +
      '</div>' +
      '<div class="adv-pct-meta">' +
        '<p class="adv-pct-headline">' + escapeHtml(higher || '—') + coverage + '</p>' +
        '<p class="adv-pct-values"><span class="adv-pct-you"><span class="adv-pct-k">Your ' + escapeHtml(def.label.toLowerCase()) + '</span> ' + escapeHtml(metricFormatDisplay(bundle.instValue, def.format)) + '</span>' +
        '<span class="adv-pct-peer-med"><span class="adv-pct-k">Peer median</span> ' + escapeHtml(metricFormatDisplay(bundle.peerMedian, def.format)) + '</span></p>' +
      '</div>' +
    '</div>';
  }).join('');
  host.className = 'adv-stand-mount';
  host.removeAttribute('aria-busy');
  host.innerHTML =
    '<p class="adv-pct-lede">Each bar shows where you fall among comparison peers for ' + escapeHtml(year) + '. The center line is the peer median.</p>' +
    '<div class="adv-pct-axis" aria-hidden="true"><span>Lowest among peers</span><span class="adv-pct-axis-mid">Peer median</span><span>Highest among peers</span></div>' +
    rowsHtml;
  wireAdvPercentileRowTips(host, rowMeta, inst);
}

function advancementTrendMetricDefs() {
  var base = advancementStandMetricDefs();
  var opexCol = field('opex');
  var opexDef = {
    key: 'opex',
    label: 'Operating expenses',
    format: 'currency',
    value: function (row) { return opexCol ? num(row[opexCol]) : null; }
  };
  return base.slice(0, 4).concat([opexDef, base[4]]);
}

function advancementTrendDefByKey(key) {
  var defs = advancementTrendMetricDefs();
  for (var i = 0; i < defs.length; i++) {
    if (defs[i].key === key) return defs[i];
  }
  return defs[0];
}

function advancementTrendChipMarkup() {
  var active = (state.advExplorer && state.advExplorer.metric) || 'endowment';
  return advancementTrendMetricDefs().map(function (def) {
    var on = def.key === active;
    return '<button type="button" class="adv-metric-chip' + (on ? ' is-active' : '') + '" role="tab" aria-selected="' +
      (on ? 'true' : 'false') + '" data-adv-metric="' + escapeHtml(def.key) + '">' + escapeHtml(def.label) + '</button>';
  }).join('');
}

function peerValuesByYear(peerRows, valueFn) {
  var byYear = {};
  (peerRows || []).forEach(function (row) {
    var year = str(row.SURVEY_YEAR);
    if (!year) return;
    if (state.institution && str(row.INSTNM) === state.institution) return;
    var value = valueFn(row);
    if (value == null || !isFinite(value)) return;
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(value);
  });
  return byYear;
}

function seriesFromMine(mine, labels, valueFn) {
  return labels.map(function (year) {
    var row = rowMatchingYear(mine, year);
    return row ? valueFn(row) : null;
  });
}

function seriesPeerMedian(labels, byYear) {
  return labels.map(function (year) {
    var sorted = sortedNums(byYear[year] || []);
    return sorted.length ? quantileSorted(sorted, 0.5) : null;
  });
}

function seriesPeerIqr(labels, byYear) {
  return labels.map(function (year) {
    var sorted = sortedNums(byYear[year] || []);
    return {
      q1: sorted.length ? quantileSorted(sorted, 0.25) : null,
      q3: sorted.length ? quantileSorted(sorted, 0.75) : null
    };
  });
}

function mountAdvTrendExplorer(mine, peerRows) {
  var canvasId = 'chart-adv-explorer';
  if (!state.advExplorer) state.advExplorer = { metric: 'endowment', mode: 'actual' };
  var wrap = $('adv-explorer-chart-wrap');
  if (!wrap) return;
  if (advancementPeerListPending()) {
    wrap.classList.add('adv-explorer-chart-wrap--loading');
    wrap.innerHTML = loadingDotsMarkup('Loading trend data');
    return;
  }
  wrap.classList.remove('adv-explorer-chart-wrap--loading');
  wrap.removeAttribute('aria-busy');
  if (!wrap.querySelector('canvas')) {
    wrap.innerHTML = '<canvas id="chart-adv-explorer" aria-label="Advancement trend chart"></canvas>';
  }
  var canvas = $(canvasId);
  if (!canvas) return;
  var errMsg = advancementPeerListErrorMessage();
  if (errMsg && !(peerRows && peerRows.length)) {
    showEmpty(canvasId, 'Peer data couldn\'t load: ' + errMsg);
    return;
  }
  syncAdvExplorerModeButtons();
  document.querySelectorAll('.adv-metric-chips').forEach(function (host) {
    host.innerHTML = advancementTrendChipMarkup();
  });
  var def = advancementTrendDefByKey(state.advExplorer.metric);
  var titleEl = $('adv-explorer-chart-title');
  if (titleEl) titleEl.textContent = def.label + ' over time';
  var labels = unionSurveyYears(mine, []);
  if (!labels.length) {
    showEmpty(canvasId, trendMessage());
    updateAdvExplorerSidePanel(mine, peerRows, def, labels, []);
    return;
  }
  var byYear = peerValuesByYear(peerRows, def.value);
  var mineRaw = seriesFromMine(mine, labels, def.value);
  var peerMed = seriesPeerMedian(labels, byYear);
  var iqr = seriesPeerIqr(labels, byYear);
  var indexed = state.advExplorer.mode === 'indexed';
  var minePlot = indexed ? indexToFirst(mineRaw) : mineRaw;
  var peerPlot = indexed ? indexToFirst(peerMed) : peerMed;
  var q1Plot = indexed ? indexToFirst(iqr.map(function (b) { return b.q1; })) : iqr.map(function (b) { return b.q1; });
  var q3Plot = indexed ? indexToFirst(iqr.map(function (b) { return b.q3; })) : iqr.map(function (b) { return b.q3; });
  if (!minePlot.some(function (v) { return v != null; }) && !peerPlot.some(function (v) { return v != null; })) {
    showEmpty(canvasId, 'This metric is not available for the selected institution.');
    updateAdvExplorerSidePanel(mine, peerRows, def, labels, mineRaw);
    return;
  }
  var bandLo = q1Plot;
  var bandHi = q3Plot;
  var inst = state.institution || 'Institution';
  var sets = [
    {
      label: 'Peer 25th percentile',
      data: bandLo,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      pointRadius: 0,
      borderWidth: 0,
      tension: 0,
      spanGaps: true,
      order: 4
    },
    {
      label: 'Peer 75th percentile',
      data: bandHi,
      borderColor: 'transparent',
      backgroundColor: 'rgba(111,191,176,0.22)',
      fill: '-1',
      pointRadius: 0,
      borderWidth: 0,
      tension: 0,
      spanGaps: true,
      order: 3
    },
    {
      label: 'Peer median',
      data: peerPlot,
      raw: peerMed,
      borderColor: '#6FBFB0',
      backgroundColor: 'transparent',
      pointBackgroundColor: '#6FBFB0',
      pointRadius: 0,
      borderWidth: 2,
      borderDash: [6, 4],
      tension: 0.15,
      spanGaps: true,
      order: 2
    },
    {
      label: inst,
      data: minePlot,
      raw: mineRaw,
      borderColor: '#C4A000',
      backgroundColor: 'transparent',
      pointBackgroundColor: '#C4A000',
      pointRadius: 4,
      borderWidth: 2.5,
      tension: 0.15,
      spanGaps: true,
      order: 1
    }
  ];
  var yTitle = indexed ? 'Indexed, first year = 100' : (def.format === 'percent' ? 'Percent' : 'Value');
  drawChart(canvasId, {
    type: 'line',
    data: { labels: labels, datasets: sets },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: {
            filter: function (item) { return item.text.indexOf('percentile') === -1; },
            usePointStyle: true
          }
        },
        tooltip: { enabled: false, external: advTrendTooltipExternal },
        ipedsMarks: { latest: true, format: def.format === 'percent' ? 'percent' : (def.format || 'count'), labelDataset: 3 },
        ipedsNotes: { trend: false, yoy: false }
      },
      scales: {
        y: {
          beginAtZero: indexed,
          title: {
            display: true,
            text: indexed ? 'Index (first year = 100)' : (def.format === 'percent' ? 'Percent' : 'Value'),
            color: axisInk(),
            font: { size: 13, family: 'Inter, Roboto, sans-serif' }
          },
          ticks: {
            callback: function (v) {
              if (indexed) return Math.round(v);
              if (def.format === 'percent') return v.toFixed(0) + '%';
              return formatAxisValue(v, def.format);
            }
          }
        }
      },
      layout: { padding: { top: 8, right: 64, bottom: 12, left: 4 } }
    }
  });
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: inst, values: mineRaw, format: def.format === 'percent' ? 'percent' : def.format },
    { label: 'Peer median', values: peerMed, format: def.format === 'percent' ? 'percent' : def.format }
  ], indexed ? 'Chart shows indexed values; table shows actuals.' : ''));
  updateAdvExplorerSidePanel(mine, peerRows, def, labels, mineRaw);
}

function advTrendTooltipExternal(context) {
  var tip = chartHoverTipEl();
  var tt = context.tooltip;
  if (!tt || tt.opacity === 0 || !tt.dataPoints || !tt.dataPoints.length) {
    tip.hidden = true;
    return;
  }
  var year = (tt.title || [])[0] || '';
  var lines = [];
  tt.dataPoints.forEach(function (pt) {
    if (!pt.dataset || pt.dataset.label.indexOf('percentile') !== -1) return;
    var raw = pt.dataset.raw ? pt.dataset.raw[pt.dataIndex] : pt.parsed.y;
    var label = pt.dataset.label;
    var valText = raw == null ? '—' : metricFormatDisplay(raw, state.advExplorer.mode === 'indexed' ? 'count' : advancementTrendDefByKey(state.advExplorer.metric).format);
    if (state.advExplorer.mode === 'indexed' && pt.parsed.y != null) {
      valText = 'Index ' + Math.round(pt.parsed.y) + ' · ' + (raw == null ? '—' : metricFormatDisplay(raw, advancementTrendDefByKey(state.advExplorer.metric).format));
    }
    lines.push('<div class="chart-hover-tip-row"><span>' + escapeHtml(label) + ': ' + escapeHtml(valText) + '</span></div>');
  });
  var avgYear = peerValuesByYear(state.paintCache.peerInstitutionRows, advancementTrendDefByKey(state.advExplorer.metric).value);
  var peerYear = avgYear[year] || [];
  var avg = peerAverageFromValues(peerYear);
  if (avg != null) {
    var fmt = advancementTrendDefByKey(state.advExplorer.metric).format;
    lines.push('<div class="chart-hover-tip-row"><span>Peer average: ' + escapeHtml(metricFormatDisplay(avg, fmt)) + '</span></div>');
  }
  tip.innerHTML = '<div class="chart-hover-tip-title">' + escapeHtml(year) + '</div>' + lines.join('');
  var rect = context.chart.canvas.getBoundingClientRect();
  positionChartHoverTipClient(rect.left + tt.caretX, rect.top + tt.caretY);
}

function updateAdvExplorerSidePanel(mine, peerRows, def, labels, mineRaw) {
  var side = $('adv-explorer-side');
  if (!side) return;
  var year = state.year;
  if (!year) {
    side.innerHTML = '<p class="adv-side-empty">Select a survey year.</p>';
    return;
  }
  var bundle = peerMetricBundle(peerRows, mine, year, def.value);
  var row = rowMatchingYear(mine, year);
  var latest = row ? def.value(row) : null;
  var yoy = advancementRelativeYoy(mine, def.value);
  side.innerHTML =
    '<h3 class="adv-side-title">' + escapeHtml(def.label) + ' · ' + escapeHtml(year) + '</h3>' +
    '<dl class="adv-side-stats">' +
      '<div><dt>Your value</dt><dd>' + escapeHtml(metricFormatDisplay(latest, def.format)) + '</dd></div>' +
      '<div><dt>Year-over-year</dt><dd>' + (yoy == null ? '—' : escapeHtml((yoy >= 0 ? '+' : '') + yoy.toFixed(1) + '%')) + '</dd></div>' +
      '<div><dt>Peer median</dt><dd>' + escapeHtml(metricFormatDisplay(bundle.peerMedian, def.format)) + '</dd></div>' +
      '<div><dt>Among peers</dt><dd>' + escapeHtml(higherThanPeersLabel(bundle.percentile) || '—') +
        (bundle.dataN < bundle.nominalN ? '<span class="adv-pct-coverage">Based on ' + bundle.dataN + ' of ' + bundle.nominalN + ' peers</span>' : '') +
      '</dd></div>' +
    '</dl>';
}

function syncAdvExplorerModeButtons() {
  var mode = (state.advExplorer && state.advExplorer.mode) || 'actual';
  document.querySelectorAll('[data-adv-mode]').forEach(function (btn) {
    var on = btn.getAttribute('data-adv-mode') === mode;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function wireAdvExplorerControls() {
  var host = $('adv-explorer');
  if (!host || host.getAttribute('data-wired') === '1') return;
  host.setAttribute('data-wired', '1');
  host.addEventListener('click', function (evt) {
    var chip = evt.target.closest('[data-adv-metric]');
    if (chip) {
      state.advExplorer.metric = chip.getAttribute('data-adv-metric');
      var cache = state.paintCache;
      if (cache) mountAdvTrendExplorer(cache.mine, cache.peerInstitutionRows || []);
      return;
    }
    var modeBtn = evt.target.closest('[data-adv-mode]');
    if (modeBtn) {
      state.advExplorer.mode = modeBtn.getAttribute('data-adv-mode');
      syncAdvExplorerModeButtons();
      var cache = state.paintCache;
      if (cache) mountAdvTrendExplorer(cache.mine, cache.peerInstitutionRows || []);
    }
  });
}

function buildAdvancementChangingOverviewConfig(mine, peerRows, mode) {
  mode = mode || 'indexed';
  if (!mine || !mine.length) return null;
  var labels = unionSurveyYears(mine, []);
  var datasets = [];
  advancementTrendMetricDefs().forEach(function (def) {
    var byYear = peerValuesByYear(peerRows, def.value);
    var mineRaw = seriesFromMine(mine, labels, def.value);
    var peerMed = seriesPeerMedian(labels, byYear);
    if (!mineRaw.some(function (v) { return v != null; })) return;
    var minePlot = mode === 'indexed' ? indexToFirst(mineRaw) : mineRaw;
    var peerPlot = mode === 'indexed' ? indexToFirst(peerMed) : peerMed;
    var shortInst = state.institution.length > 24 ? state.institution.slice(0, 22) + '…' : state.institution;
    datasets.push({
      type: 'line',
      label: def.label + ' · ' + shortInst,
      data: minePlot,
      borderColor: '#C4A000',
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0,
      pointRadius: 3,
      spanGaps: true
    });
    if (peerPlot.some(function (v) { return v != null; })) {
      datasets.push({
        type: 'line',
        label: def.label + ' · Peer median',
        data: peerPlot,
        borderColor: '#6FBFB0',
        backgroundColor: 'transparent',
        borderDash: [6, 4],
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        spanGaps: true
      });
    }
  });
  if (!datasets.length) return null;
  return {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 28 } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              if (ctx.parsed.y == null) return ctx.dataset.label + ': —';
              if (mode === 'indexed') return ctx.dataset.label + ': ' + Math.round(ctx.parsed.y);
              return ctx.dataset.label + ': ' + formatAxisValue(ctx.parsed.y, 'currency');
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: mode === 'indexed' ? 'Index (first year = 100)' : 'Value' },
          ticks: { callback: function (v) { return mode === 'indexed' ? Math.round(v) : formatChartCurrency(v); } }
        }
      }
    }
  };
}

function verifyAdvancementShell() {
  var view = $('view-advancement');
  if (!view) return;
  if ($('chart-adv-bubble')) {
    console.error('[IPEDS Insights] Legacy Peer Distribution still present in DOM (chart-adv-bubble). Wrong build or cached HTML.');
  }
  var legacyCopy = view.querySelector('.box-subtitle');
  if (legacyCopy && /25th.?75th percentile/i.test(legacyCopy.textContent || '')) {
    console.error('[IPEDS Insights] Legacy peer distribution copy detected in Advancement view.');
  }
  var stand = $('adv-stand-mount');
  if (!stand) {
    var msg = 'Advancement section failed to load: missing #adv-stand-mount (old shell).';
    view.insertAdjacentHTML('afterbegin', '<p class="chart-empty chart-empty--error" role="alert">' + escapeHtml(msg) + '</p>');
    console.error(msg);
    return;
  }
  if (advancementPeerListPending()) return;
  var ok = stand.querySelector('.adv-pct-lede, .adv-pct-row, .chart-empty, .chart-loading');
  if (!ok) {
    var reason = 'percentile standing did not render';
    stand.innerHTML = '<p class="chart-empty chart-empty--error" role="alert">Advancement section failed to load: ' + escapeHtml(reason) + '.</p>';
    console.error('[IPEDS Insights]', reason);
  }
}

function wireAdvPercentileRowTips(host, rowMeta, inst) {
  if (!host || !rowMeta.length) return;
  host.querySelectorAll('.adv-pct-row--data').forEach(function (row) {
    var idx = Number(row.getAttribute('data-adv-pct-row'));
    var meta = rowMeta[idx];
    if (!meta) return;
    function showTip(evt) {
      var bundle = meta.bundle;
      var def = meta.def;
      var avg = peerAverageFromValues(bundle.peerValues);
      var tip = chartHoverTipEl();
      tip.innerHTML = '<div class="chart-hover-tip-title">' + escapeHtml(def.label) + '</div>' +
        '<div class="chart-hover-tip-row"><span>' + escapeHtml(inst) + ': ' + escapeHtml(metricFormatDisplay(bundle.instValue, def.format)) + '</span></div>' +
        '<div class="chart-hover-tip-row"><span>Peer median: ' + escapeHtml(metricFormatDisplay(bundle.peerMedian, def.format)) + '</span></div>' +
        '<div class="chart-hover-tip-row"><span>Peer average: ' + escapeHtml(metricFormatDisplay(avg, def.format)) + '</span></div>';
      positionChartHoverTipClient(evt.clientX, evt.clientY);
    }
    row.addEventListener('mouseenter', showTip);
    row.addEventListener('mousemove', showTip);
    row.addEventListener('mouseleave', hideChartHoverTip);
    row.addEventListener('focus', function (evt) {
      showTip({ clientX: row.getBoundingClientRect().left + 24, clientY: row.getBoundingClientRect().top + row.offsetHeight / 2 });
    });
    row.addEventListener('blur', hideChartHoverTip);
  });
}

function advancementRelativeYoy(mine, valueFn) {
  var year = state.year;
  if (!year || !mine || !mine.length) return null;
  var row = rowMatchingYear(mine, year);
  var prev = priorYearRow(mine, year);
  if (!row || !prev) return null;
  var curr = valueFn(row);
  var old = valueFn(prev);
  if (curr == null || old == null || !old) return null;
  return ((curr - old) / Math.abs(old)) * 100;
}

function updateAdvancementSectionTakeaways(mine, peerRows) {
  if (advancementPeerListPending()) return;
  var inst = state.institution || 'This institution';
  var year = state.year || '';
  var standEl = $('adv-takeaway-stand');
  var changeEl = $('adv-takeaway-change');
  if (!year) {
    if (standEl) standEl.textContent = 'Choose a survey year to see how you compare to peers.';
    if (changeEl) changeEl.textContent = 'Choose a survey year to see year-over-year change.';
    return;
  }
  var defs = advancementStandMetricDefs();
  var endowDef = defs[0];
  var givingDef = defs[1];
  var endBundle = peerMetricBundle(peerRows, mine, year, endowDef.value);
  var giveBundle = peerMetricBundle(peerRows, mine, year, givingDef.value);
  if (standEl) {
    var standLine = '';
    if (endBundle.instValue != null && endBundle.percentile != null) {
      standLine = 'In ' + year + ', ' + inst + ' is ' + lowerFirst(higherThanPeersLabel(endBundle.percentile)) + ' on endowment' +
        peerCoveragePhrase(endBundle.dataN, endBundle.nominalN) + '.';
    } else if (giveBundle.instValue != null && giveBundle.percentile != null) {
      standLine = 'In ' + year + ', ' + inst + ' is ' + lowerFirst(higherThanPeersLabel(giveBundle.percentile)) + ' on private giving' +
        peerCoveragePhrase(giveBundle.dataN, giveBundle.nominalN) + '.';
    } else {
      standLine = 'Comparison peer data is not available for ' + year + '.';
    }
    standEl.textContent = standLine;
  }
  if (changeEl) {
    var givingYoy = advancementRelativeYoy(mine, givingDef.value);
    var endYoy = advancementRelativeYoy(mine, endowDef.value);
    var changeLine = '';
    if (givingYoy != null || endYoy != null) {
      var useGiving = givingYoy != null && (endYoy == null || Math.abs(givingYoy) >= Math.abs(endYoy));
      var yoy = useGiving ? givingYoy : endYoy;
      var label = useGiving ? 'Private giving' : 'Endowment';
      changeLine = label + ' ' + (yoy >= 0 ? 'rose' : 'fell') + ' ' + Math.abs(yoy).toFixed(1) + '% year over year in ' + year + '.';
    } else {
      changeLine = 'Year-over-year change is not available for ' + year + '.';
    }
    changeEl.textContent = changeLine;
  }
  document.querySelectorAll('.analytics-section--advancement-stand .analytics-section-title').forEach(function (node) {
    node.textContent = titleCaseLabel('Where ' + inst + ' stands');
  });
  document.querySelectorAll('.analytics-section--advancement-ranking .analytics-section-title').forEach(function (node) {
    node.textContent = titleCaseLabel('Who ' + inst + ' is compared to');
  });
}

function lowerFirst(text) {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function kpiChip(label, display, yoyHtml, spark, peerMedianDisplay, rankText, peerAverageDisplay) {
  var avgTitle = peerAverageDisplay != null && peerAverageDisplay !== '—'
    ? ' title="Peer average ' + escapeHtml(peerAverageDisplay) + '"'
    : '';
  return '<div class="kpi-chip"><span class="kpi-chip-label">' + escapeHtml(titleCaseLabel(label)) + '</span>' +
    '<span class="kpi-chip-value">' + escapeHtml(display) + '</span>' +
    (yoyHtml || '') +
    (spark || '') +
    '<span class="kpi-chip-peer"' + avgTitle + '>Peer median ' + escapeHtml(peerMedianDisplay) + '</span>' +
    (rankText ? '<span class="kpi-rank">' + escapeHtml(rankText) + '</span>' : '') + '</div>';
}

function metricDisplay(value, kind) {
  if (value == null || !isFinite(value)) return '—';
  if (kind === 'percent') return formatKpiPercent(value);
  if (kind === 'currency') return formatChartCurrency(value);
  return formatKpiNumber(value);
}

function kpiFromColumn(mine, peerRow, prev, row, label, column, kind) {
  if (!column) return '';
  var curr = num(row[column]);
  var prevVal = prev ? num(prev[column]) : null;
  var peerVal = peerRow ? num(peerRow[column]) : null;
  var yoyCurr = kind === 'percent' ? scaledPercent(curr) : curr;
  var yoyPrev = kind === 'percent' ? scaledPercent(prevVal) : prevVal;
  var peerList = ((state.paintCache && state.paintCache.peerInstitutionRows) || []);
  var peerValues = rowsForYear(peerList, state.year).map(function (item) {
    if (state.institution && str(item.INSTNM) === state.institution) return null;
    var value = num(item[column]);
    return kind === 'percent' ? scaledPercent(value) : value;
  }).filter(function (value) { return value != null && isFinite(value); });
  var instCmp = kind === 'percent' ? scaledPercent(curr) : curr;
  var nominalN = advancementNominalPeerN(peerList, state.year);
  return kpiChip(
    label,
    metricDisplay(curr, kind),
    yoyMarkup(yoyCurr, yoyPrev, kind === 'percent' ? 'points' : 'relative'),
    sparklineSvg(kind === 'percent' ? asPercent(series(mine, column)) : series(mine, column)),
    metricDisplay(quantileSorted(sortedNums(peerValues), 0.5), kind),
    peerComparisonRankLabel(instCmp, peerValues, nominalN),
    metricDisplay(peerVal, kind)
  );
}

function updateAdvancementKpiStrip(mine, peers) {
  var host = $('advancement-kpi-strip');
  if (!host) return;
  if (advancementPeerListPending()) {
    showAdvancementPeerDependentLoading();
    return;
  }
  var peerErr = advancementPeerListErrorMessage();
  var peerList = (state.paintCache && state.paintCache.peerInstitutionRows) || [];
  if (peerErr && !peerList.length) {
    showAdvancementPeerDependentError('Peer data couldn\'t load: ' + peerErr);
    return;
  }
  host.classList.remove('kpi-strip--loading');
  host.removeAttribute('aria-busy');
  if (!mine || !mine.length || !state.institution) {
    host.innerHTML = '';
    host.classList.add('hidden');
    return;
  }
  var year = state.year || str(mine[mine.length - 1].SURVEY_YEAR);
  var row = rowMatchingYear(mine, year) || mine[mine.length - 1];
  if (!row) {
    host.innerHTML = '';
    host.classList.add('hidden');
    return;
  }
  host.classList.remove('hidden');
  var prev = priorYearRow(mine, year);
  var peerRow = rowMatchingYear(peers || [], year);
  var endowCol = field('endowment');
  var givingCol = field('giving');
  var fteCol = field('fte');
  var opexCol = field('opex');
  var html = kpiFromColumn(mine, peerRow, prev, row, 'Endowment', endowCol, 'currency') +
    kpiFromColumn(mine, peerRow, prev, row, 'Private giving', givingCol, 'currency') +
    kpiFromColumn(mine, peerRow, prev, row, 'FTE', fteCol, 'count') +
    kpiFromColumn(mine, peerRow, prev, row, 'Endowment / FTE', 'ENDOWMENT_PER_FTE', 'currency');
  if (givingCol && opexCol) {
    var ratioNow = function (source) {
      if (!source) return null;
      var g = num(source[givingCol]);
      var o = num(source[opexCol]);
      if (g == null || !o) return null;
      return (g / o) * 100;
    };
    var spark = mine.map(function (item) { return ratioNow(item); });
    var intensityPeers = rowsForYear((state.paintCache && state.paintCache.peerInstitutionRows) || [], state.year).map(function (source) {
      if (state.institution && str(source.INSTNM) === state.institution) return null;
      return ratioNow(source);
    }).filter(function (value) { return value != null && isFinite(value); });
    var intensityNominal = advancementNominalPeerN((state.paintCache && state.paintCache.peerInstitutionRows) || [], state.year);
    html += kpiChip(
      'Philanthropic intensity',
      metricDisplay(ratioNow(row), 'percent'),
      yoyMarkup(ratioNow(row), ratioNow(prev), 'points'),
      sparklineSvg(spark),
      metricDisplay(quantileSorted(sortedNums(intensityPeers), 0.5), 'percent'),
      peerComparisonRankLabel(ratioNow(row), intensityPeers, intensityNominal),
      metricDisplay(ratioNow(peerRow), 'percent')
    );
  }
  host.innerHTML = html;
}

function syncSectionFootnotes() {
  var notes = {
    admissions: 'IPEDS admissions components: applications, admits, enrollment, admit rate, and yield.',
    ranking: 'Ranking uses institution-level application counts for the selected survey year. Highlighted bar is the selected institution when it appears in the top 10.',
    aid: 'IPEDS price and aid: published tuition, net tuition revenue, discount rate, and Pell eligibility.',
    migration: 'IPEDS residence of first-time freshmen for the selected survey year.',
    'advancement-stand': 'Percentiles compare the selected institution to comparison peers only. Peer median is the middle value among peers with data.',
    'advancement-changing': 'Year-over-year change table for headline advancement metrics.',
    'advancement-core': 'IPEDS endowment assets and private giving. Peer figures are averages.',
    'advancement-scale': 'IPEDS FTE and endowment per FTE. Peer figures are averages.',
    'advancement-ops': 'Operating expenses and philanthropic contribution. Philanthropic intensity is private giving divided by operating expenses.',
    'advancement-ranking': 'Ranking uses reported endowment for the selected survey year among comparison peers. Highlighted bar is the selected institution when it appears in the top 10.',
    faq: 'Definitions describe the metrics on the Admissions and Advancement tabs.',
    keymetrics: 'Headline numbers for the selected survey year. Change is versus the prior year.'
  };
  var peers = (state.paintCache && state.paintCache.peerAggregates) || [];
  var year = state.year || '';
  var peerRow = rowMatchingYear(peers, year);
  var peerBit = peerLegendTag() !== 'Peer average' ? ' ' + peerLegendTag() + '.' : (peerRow && peerRow.PEER_N != null ? ' Peer average N = ' + Math.round(num(peerRow.PEER_N)) + '.' : '');
  var yearBit = year ? ' Survey year ' + year + '.' : '';
  document.querySelectorAll('[data-section-foot]').forEach(function (el) {
    var key = el.getAttribute('data-section-foot') || '';
    el.textContent = ((notes[key] || '') + yearBit + peerBit).trim();
  });
  document.querySelectorAll('[data-rank-sub]').forEach(function (el) {
    var key = el.getAttribute('data-rank-sub');
    var note = key === 'advancement'
      ? (state.rankNotes && state.rankNotes.advancement)
      : (state.rankNotes && state.rankNotes.admissions);
    el.textContent = (note ? note + '. ' : '') + peerDefinitionLine();
  });
}

function sourceStatusText(fallback) {
  if (fallback) return fallback;
  if (!state.connected.ipeds) return 'Source: IPEDS · datasets not mapped';
  return 'Source: IPEDS · Data as of ' + (state.year || 'latest available year');
}

var keepMenusOpen = false;

function commitDraft() {
  state.partition = (state.draft.partition && state.draft.partition[0]) || '';
  state.year = (state.draft.year && state.draft.year[0]) || '';
  state.institution = (state.draft.institution && state.draft.institution[0]) || '';
  FILTERS.forEach(function (def) {
    if (def.single) return;
    state.filters[def.key] = (state.draft[def.key] || []).slice();
  });
}

function applyDraft() {
  commitDraft();
  syncReportButton();
  closeMenus(null);
  setAppBusy(true);
  var pending = refresh();
  if (!pending || typeof pending.then !== 'function') {
    setAppBusy(false);
    return Promise.resolve();
  }
  return pending.finally(function () { setAppBusy(false); });
}

function resetDraft() {
  menuSearchQueries = {};
  state.draft = emptyDraft();
  state.didDefaultPartition = false;
  state.didDefaultYear = false;
  state.didDefaultInstitution = false;
  state.peerCompareOn = true;
  state.peerAnchorInstitution = '';
  state.originPinned = false;
  state.originInstitution = '';
  state.partition = '';
  state.year = '';
  state.institution = '';
  state.originState = '';
  state.oosFocus = '';
  state.draft.origin = [];
  FILTERS.forEach(function (def) {
    if (!def.single) state.filters[def.key] = [];
  });
  populateFilters();
  refreshOriginMenu();
  if (state.paintCache) {
    state.paintCache.originRows = null;
    renderMigrationBlock();
  }
  applyDraft();
}

function isSummaryPlace(label) {
  var text = str(label).toLowerCase();
  return !text || text.indexOf('total') !== -1 || text.indexOf('foreign') !== -1 || text.indexOf('all first') !== -1;
}

function trendMessage() {
  if (!state.connected.ipeds) return 'Map VW_IPEDS_BETA to the ipeds alias to plot this.';
  if (!state.institution) return 'Select an institution.';
  return 'No rows for this selection.';
}

function peerCoverageLine(row, reportCol, metricLabel) {
  if (!row || row.PEER_N == null || row[reportCol] == null) return '';
  return Math.round(num(row[reportCol])).toLocaleString() + ' of ' + Math.round(num(row.PEER_N)).toLocaleString() + ' report ' + metricLabel;
}

function philShareByYear(rows, givingCol, opexCol) {
  var map = {};
  (rows || []).forEach(function (row) {
    var year = str(row.SURVEY_YEAR);
    if (!year || !givingCol || !opexCol) return;
    var giving = num(row[givingCol]);
    var opex = num(row[opexCol]);
    map[year] = giving == null || opex == null || !opex ? null : (giving / opex) * 100;
  });
  return map;
}

function drawAdvPhilRatioTrend(canvasId, rows, peerRows) {
  rows = rows || [];
  var peers = state.peerQueryBlocked ? [] : (peerRows || []);
  if (!rows.length && !peers.length) {
    showEmpty(canvasId, trendMessage());
    return;
  }
  var givingCol = field('giving');
  var opexCol = field('opex');
  if (!givingCol || !opexCol) {
    showEmpty(canvasId, 'Giving and operating expense columns are not on the view yet.');
    return;
  }
  var labels = unionSurveyYears(rows, peers);
  var mineMap = philShareByYear(rows, givingCol, opexCol);
  var peerMap = philShareByYear(peers, givingCol, opexCol);
  var mineVals = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
  var peerVals = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
  if (!mineVals.some(function (v) { return v != null; }) && !peerVals.some(function (v) { return v != null; })) {
    showEmpty(canvasId, 'Philanthropic intensity could not be calculated for this selection.');
    return;
  }
  var sets = [];
  if (mineVals.some(function (v) { return v != null; })) {
    sets.push({
      type: 'line',
      label: 'Philanthropic intensity',
      data: mineVals,
      borderColor: '#FFD100',
      backgroundColor: 'transparent',
      pointBackgroundColor: '#FFD100',
      pointRadius: 4,
      pointStyle: 'line',
      borderWidth: 2,
      tension: 0,
      fill: false,
      spanGaps: false
    });
  }
  if (peerVals.some(function (v) { return v != null; })) {
    sets.push({
      type: 'line',
      label: 'Peer average · Philanthropic intensity',
      data: peerVals,
      borderColor: '#6FBFB0',
      backgroundColor: 'transparent',
      pointBackgroundColor: '#6FBFB0',
      pointRadius: 3,
      pointStyle: 'line',
      borderWidth: 2,
      borderDash: [6, 4],
      tension: 0,
      fill: false,
      spanGaps: false
    });
  }
  drawChart(canvasId, {
    type: 'line',
    data: { labels: labels, datasets: sets },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return formatAxisValue(v, 'percent'); } }
        }
      },
      plugins: {
        legend: { display: sets.length > 1, labels: { usePointStyle: true, boxWidth: 28, boxHeight: 6 } },
        filler: false,
        ipedsMarks: { latest: true, format: 'percent' }
      },
      layout: { padding: { top: 16, right: 64, bottom: 8, left: 4 } }
    }
  });
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: 'Philanthropic intensity', values: mineVals, percent: true },
    { label: 'Peer average · Philanthropic intensity', values: peerVals, percent: true }
  ].filter(function (col) { return col.values.some(function (v) { return v != null; }); }), ''));
  delete detailStore[canvasId].tableSpec;
}

function drawHorizontal(canvasId, labels, values, label, format, extras) {
  if (!labels.length) {
    showEmpty(canvasId, trendMessage());
    return;
  }
  format = format || 'count';
  extras = extras || {};
  var lollipop = canvasId === 'chart-top';
  var cappedRank = canvasId === 'chart-adv-top';
  var muted = document.documentElement.getAttribute('data-theme') === 'dark' ? '#B8B9C0' : '#72706A';
  var colors = labels.map(function (name) {
    return state.institution && String(name) === String(state.institution) ? '#FFD100' : muted;
  });
  drawChart(canvasId, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: colors,
        maxBarThickness: cappedRank ? 14 : (lollipop ? 2 : 18),
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        ipedsMarks: {
          barEnds: true,
          format: format,
          meanLine: extras.mean,
          meanLabel: extras.meanLabel || 'Peer avg'
        }
      },
      scales: (function () {
        var x = {
          beginAtZero: true,
          ticks: { callback: function (v) { return formatAxisValue(v, format); } }
        };
        if (cappedRank) {
          var positive = values.filter(function (value) { return value != null && isFinite(value) && value > 0; }).sort(function (a, b) { return a - b; });
          var largest = positive.length ? positive[positive.length - 1] : 0;
          var next = positive.length > 1 ? positive[positive.length - 2] : largest;
          if (largest > next * 2.5) x.max = next * 1.25;
        }
        if (lollipop) {
          var finite = values.filter(function (value) { return value != null && isFinite(value) && value > 0; });
          var peak = finite.length ? Math.max.apply(null, finite) : 0;
          if (peak > 0) {
            x.suggestedMax = peak * 1.07;
            if (extras.mean != null && isFinite(extras.mean) && extras.mean > peak) {
              x.suggestedMax = Math.max(x.suggestedMax, extras.mean * 1.05);
            }
          }
        }
        return {
          x: x,
          y: {
            ticks: {
              autoSkip: false,
              color: cssVar('--text'),
              font: { size: 12, family: 'Inter, Roboto, sans-serif' },
              padding: 3
            }
          }
        };
      })(),
      layout: { padding: { top: 12, right: lollipop ? 52 : (cappedRank ? 96 : 56), bottom: 2, left: 4 } }
    }
  });
  stashTableSpec(canvasId, { kind: 'horizontal', labels: labels, values: values, valueLabel: label, format: format });
}

function columnStoredAsFraction(column) {
  var key = '';
  if (column && column === field('admitRate')) key = 'admit';
  else if (column && column === (field('yieldRate') || 'YIELD_RATE')) key = 'yield';
  else if (column && column === field('discount')) key = 'discount';
  else if (column && column === field('pell')) key = 'pell';
  var scale = key && state.peerRateScales ? state.peerRateScales[key] : '';
  if (scale === 'unit') return true;
  if (scale === 'percent' || scale === 'mixed') return false;
  var rows = (state.paintCache && state.paintCache.mine) || [];
  return detectColumnScale(rows, column) === 'unit';
}

function yearValueMap(rows, column, asRate) {
  var fraction = !!(asRate && columnStoredAsFraction(column));
  var map = {};
  (rows || []).forEach(function (row) {
    var year = str(row.SURVEY_YEAR);
    if (!year) return;
    var value = num(row[column]);
    map[year] = value == null ? null : (fraction ? value * 100 : value);
  });
  return map;
}

function unionSurveyYears(mine, peers) {
  var rank = {};
  (mine || []).concat(peers || []).forEach(function (row) {
    var year = str(row.SURVEY_YEAR);
    if (year) rank[year] = surveyYearSortKey(year);
  });
  return Object.keys(rank).sort(function (a, b) { return rank[a] - rank[b]; });
}

function overlayTableHtml(labels, columns, peerNote) {
  var html = '<table class="preview-table"><thead><tr><th>Year</th>';
  columns.forEach(function (col) { html += '<th>' + escapeHtml(col.label) + '</th>'; });
  html += '</tr></thead><tbody>';
  tableIndicesNewestYearFirst(labels).forEach(function (index) {
    html += '<tr><td>' + escapeHtml(labels[index]) + '</td>';
    columns.forEach(function (col) {
      var value = col.values[index];
      var text = '—';
      if (value != null) {
        if (col.format === 'points') text = (value >= 0 ? '+' : '') + Number(value).toFixed(1) + '%';
        else if (col.format === 'delta') text = (value >= 0 ? '+' : '') + Number(value).toFixed(1) + '%';
        else if (col.percent) text = Number(value).toFixed(1) + '%';
        else if (col.format === 'currency') text = formatChartCurrency(value);
        else text = formatCompactCount(value);
      }
      html += '<td>' + escapeHtml(text) + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  if (peerNote) html += '<p class="peer-note">' + escapeHtml(peerNote) + '</p>';
  return html;
}

function drawOverlayTrend(canvasId, mine, peers, datasets, percent) {
  mine = mine || [];
  var peerRows = state.peerQueryBlocked ? [] : (peers || []);
  if (!mine.length && !peerRows.length) {
    showEmpty(canvasId, trendMessage());
    return;
  }
  var labels = unionSurveyYears(mine, peerRows);
  if (!labels.length) {
    showEmpty(canvasId, trendMessage());
    return;
  }
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var chartSets = [];
  var tableCols = [];
  var any = false;
  datasets.forEach(function (item, index) {
    var isRate = !!(percent || item.percent);
    var asLine = item.graph === 'line' || isRate;
    var mineMap = yearValueMap(mine, item.column, isRate);
    var peerMap = yearValueMap(peerRows, item.column, isRate);
    var mineValues = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
    var peerValues = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
    if (mineValues.some(function (v) { return v != null; }) || peerValues.some(function (v) { return v != null; })) any = true;
    var instColor = item.color || (asLine && !isRate ? (dark ? '#F4F4F1' : '#18181A') : chartBarColor(index, datasets.length, false));
    var peerColor = item.peerColor || chartBarColor(index, datasets.length, true);
    var format = isRate ? 'percent' : (item.format || valueFormatFor(item));
    var axisId = item.axis || 'y';
    if (mineValues.some(function (v) { return v != null; })) {
      chartSets.push(asLine ? {
        type: 'line',
        label: item.label,
        data: mineValues,
        yAxisID: axisId,
        borderColor: instColor,
        backgroundColor: 'transparent',
        pointBackgroundColor: instColor,
        pointBorderColor: instColor,
        pointRadius: item.axis === 'y1' ? 5 : 4,
        pointStyle: 'line',
        borderWidth: item.axis === 'y1' ? 2.5 : 2,
        borderDash: item.dash ? [5, 4] : undefined,
        tension: 0,
        fill: false,
        spanGaps: true,
        order: 1,
        endLabel: canvasId === 'chart-yield'
      } : {
        type: 'bar',
        label: item.label,
        data: mineValues,
        yAxisID: axisId,
        backgroundColor: instColor,
        borderWidth: 0,
        maxBarThickness: 22,
        pointStyle: 'rect',
        order: 2
      });
      tableCols.push({ label: item.label, values: mineValues, percent: isRate, format: format });
    }
    if (peerValues.some(function (v) { return v != null; })) {
      chartSets.push({
        type: 'line',
        label: item.peerLabel || peerSeriesLabel(item.label, true),
        data: peerValues,
        yAxisID: axisId,
        borderColor: peerColor,
        backgroundColor: 'transparent',
        pointBackgroundColor: peerColor,
        pointBorderColor: peerColor,
        pointRadius: item.lightPeer ? 2 : 3,
        pointStyle: 'line',
        borderWidth: item.lightPeer ? 1.5 : 2,
        borderDash: axisId === 'y1' ? [2, 3] : (datasets.some(function (spec) { return spec.axis === 'y1'; }) ? [8, 4] : [6, 4]),
        tension: 0,
        fill: false,
        spanGaps: true,
        order: 0
      });
      tableCols.push({ label: item.peerLabel || peerSeriesLabel(item.label, true), values: peerValues, percent: isRate, format: format });
    }
  });
  if (!any || !chartSets.length) {
    showEmpty(canvasId, 'This metric is not on the connected view yet.');
    return;
  }
  chartSets.sort(function (a, b) {
    var aPeer = /peer/i.test(a.label) ? 1 : 0;
    var bPeer = /peer/i.test(b.label) ? 1 : 0;
    return aPeer - bPeer;
  });
  var allRates = datasets.length && datasets.every(function (item) { return percent || item.percent; });
  var format = allRates ? 'percent' : valueFormatFor(datasets[0]);
  var hasPeer = chartSets.some(function (set) { return /peer/i.test(set.label); });
  var peerNote = '';
  if (hasPeer && peerRows.some(function (row) { return row.PEER_N != null; })) peerNote = peerCountNote(peerRows);
  var yieldChart = canvasId === 'chart-yield' || canvasId === 'chart-yield-rate';
  var dualAxis = datasets.some(function (item) { return item.axis === 'y1'; });
  var hideTrend = canvasId === 'chart-adv-endow-hero' || canvasId === 'chart-adv-giving-hero' ||
    canvasId === 'chart-fte' || canvasId === 'chart-endow-fte' || canvasId === 'chart-opex';
  drawChart(canvasId, {
    type: chartSets.some(function (set) { return set.type === 'bar'; }) ? 'bar' : 'line',
    data: { labels: labels, datasets: chartSets },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: yieldChart
          ? { display: true, align: 'start', compact: true, labels: { boxWidth: 8, padding: 6, usePointStyle: true, pointStyle: 'line' } }
          : { display: chartSets.length > 1, labels: { usePointStyle: true, boxWidth: 28, boxHeight: 6, padding: 10 } },
        ipedsMarks: { latest: true, stagger: yieldChart, format: format, corner: dualAxis },
        ipedsNotes: yieldChart ? null : { trend: false, outlier: false, yoy: true, corner: dualAxis }
      },
      scales: (function () {
        var scales = {
          y: {
            beginAtZero: !yieldChart,
            type: 'linear',
            title: (function () {
              var text = '';
              datasets.forEach(function (item) {
                if ((item.axis || 'y') !== 'y1' && item.axisTitle) text = item.axisTitle;
              });
              if (!text) return { display: false };
              return {
                display: true,
                text: text,
                color: cssVar('--text'),
                font: { size: 13, family: 'Inter, Roboto, sans-serif' }
              };
            })(),
            ticks: {
              maxRotation: 0,
              callback: function (v) { return formatAxisValue(v, format); }
            }
          }
        };
        if (datasets.some(function (item) { return item.axis === 'y1'; })) {
          var rightFormat = 'count';
          datasets.forEach(function (item) {
            if (item.axis === 'y1') rightFormat = item.percent ? 'percent' : (item.format || 'count');
          });
          scales.y1 = {
            position: 'right',
            beginAtZero: true,
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: (function () {
                var text = '';
                datasets.forEach(function (item) {
                  if (item.axis === 'y1' && item.axisTitle) text = item.axisTitle;
                });
                return text || 'Rate';
              })(),
              color: cssVar('--text'),
              font: { size: 13, family: 'Inter, Roboto, sans-serif' }
            },
            ticks: { callback: function (v) { return formatAxisValue(v, rightFormat); } }
          };
        }
        if (yieldChart) {
          var yieldVals = [];
          chartSets.forEach(function (set) {
            (set.data || []).forEach(function (value) { if (value != null && isFinite(value)) yieldVals.push(value); });
          });
          if (yieldVals.length) {
            var yieldLo = Math.min.apply(null, yieldVals);
            var yieldHi = Math.max.apply(null, yieldVals);
            var yieldPad = Math.max(2, (yieldHi - yieldLo) * 0.5);
            scales.y.beginAtZero = false;
            scales.y.min = Math.max(0, yieldLo - yieldPad);
            scales.y.max = Math.min(100, yieldHi + yieldPad);
          }
        }
        return scales;
      })(),
      layout: { padding: { top: dualAxis ? 52 : (yieldChart ? 18 : 22), right: 78, bottom: 20, left: 4 } }
    }
  });
  if (!detailStore[canvasId]) detailStore[canvasId] = {};
  setDetailTable(canvasId, overlayTableHtml(labels, tableCols, peerNote));
  delete detailStore[canvasId].tableSpec;
  if (yieldChart) setChartSubtitle(canvasId, yieldVerdict(tableCols));
  if (canvasId !== 'chart-adv-phil-ratio') {
    detailStore[canvasId].explore = {
      kind: 'trend',
      datasetDefs: (datasets || []).map(function (item) {
        return {
          label: item.label,
          column: item.column,
          percent: !!(percent || item.percent),
          axis: item.axis || 'y'
        };
      }),
      percent: percent === true || (datasets || []).every(function (item) { return !!item.percent; })
    };
    delete detailStore[canvasId].detailCompareConfig;
  }
}

function seriesEnds(col) {
  var last = null;
  var prev = null;
  if (!col || !col.values) return { last: last, prev: prev };
  col.values.forEach(function (value) {
    if (value == null || !isFinite(value)) return;
    prev = last;
    last = value;
  });
  return { last: last, prev: prev };
}

function yieldVerdict(cols) {
  function find(label) {
    var i;
    for (i = 0; i < cols.length; i++) if (cols[i].label === label) return cols[i];
    return null;
  }
  function piece(name, mineLabel, peerLabel) {
    var mine = seriesEnds(find(mineLabel));
    var peer = seriesEnds(find(peerLabel));
    if (mine.last == null) return name + ' is not available';
    var yoy = '';
    if (mine.prev != null) {
      var delta = mine.last - mine.prev;
      yoy = ' · ' + (delta >= 0 ? '▲ +' : '▼ ') + Math.abs(delta).toFixed(1) + '% YoY';
    }
    var gap = '';
    if (peer.last != null) {
      var diff = mine.last - peer.last;
      if (Math.abs(diff) < 0.05) gap = ' · in line with peers';
      else gap = ' · ' + Math.abs(diff).toFixed(1) + '% ' + (diff > 0 ? 'above peers' : 'below peers');
    }
    return name + ' ' + mine.last.toFixed(1) + '%' + yoy + gap;
  }
  return piece('Admit rate', 'Admit rate', 'Peer admit') + '. ' + piece('Yield', 'Yield', 'Peer yield') + '.';
}

function updateAdmissionsFunnel(mine, peers) {
  var host = $('admissions-funnel');
  if (!host) return;
  if (!mine || !mine.length || !state.institution) {
    host.innerHTML = '';
    host.classList.add('hidden');
    return;
  }
  var year = state.year || str(mine[mine.length - 1].SURVEY_YEAR);
  var row = rowMatchingYear(mine, year) || mine[mine.length - 1];
  var prev = priorYearRow(mine, year);
  if (!row) {
    host.innerHTML = '';
    return;
  }
  host.classList.remove('hidden');
  var appsCol = field('applications');
  var admCol = field('admissions');
  var enrCol = field('enrollment');
  var admitCol = field('admitRate');
  var yieldCol = field('yieldRate') || 'YIELD_RATE';
  var apps = num(row[appsCol]);
  var adm = num(row[admCol]);
  var enr = num(row[enrCol]);
  var prevApps = prev ? num(prev[appsCol]) : null;
  var prevAdm = prev ? num(prev[admCol]) : null;
  var prevEnr = prev ? num(prev[enrCol]) : null;
  var admitPct = apps ? (adm / apps) * 100 : null;
  var yieldPct = adm ? (enr / adm) * 100 : null;
  var peerRow = state.peerQueryBlocked ? null : rowMatchingYear(peers || [], year);
  var peerApps = peerRow ? num(peerRow[appsCol]) : null;
  var peerAdm = peerRow ? num(peerRow[admCol]) : null;
  var peerEnr = peerRow ? num(peerRow[enrCol]) : null;
  var peerAdmit = percentPoint(peerRow, admitCol, admCol, appsCol);
  var peerYield = percentPoint(peerRow, yieldCol, enrCol, admCol);
  function step(label, value, previous, sparkValues, peerValue) {
    return '<div class="adm-funnel-step"><span class="adm-funnel-label">' + escapeHtml(label) + '</span>' +
      '<span class="adm-funnel-value">' + escapeHtml(metricDisplay(value, 'count')) + '</span>' +
      yoyMarkup(value, previous) +
      sparklineSvg(sparkValues) +
      '<span class="kpi-chip-peer">Peer average ' + escapeHtml(metricDisplay(peerValue, 'count')) + '</span></div>';
  }
  function rateStep(label, pct, previous, peerPct) {
    var peerText = peerPct == null || !isFinite(peerPct) ? '—' : peerPct.toFixed(1) + '%';
    return '<div class="adm-funnel-step adm-funnel-step--rate"><span class="adm-funnel-label">' + escapeHtml(label) + '</span>' +
      '<span class="adm-funnel-value">' + escapeHtml(pct == null || !isFinite(pct) ? '—' : pct.toFixed(1) + '%') + '</span>' +
      yoyMarkup(pct, previous, 'points') +
      '<span class="kpi-chip-peer">Peer average ' + escapeHtml(peerText) + '</span></div>';
  }
  host.innerHTML =
    '<p class="adm-funnel-year">Survey year ' + escapeHtml(year || 'latest') + '</p>' +
    '<div class="adm-funnel-row adm-funnel-row--strip">' +
      step('Applications', apps, prevApps, series(mine, appsCol), peerApps) +
      rateStep('Admit rate', admitPct, prevApps ? (prevAdm / prevApps) * 100 : null, peerAdmit) +
      step('Admitted', adm, prevAdm, series(mine, admCol), peerAdm) +
      rateStep('Yield', yieldPct, prevAdm ? (prevEnr / prevAdm) * 100 : null, peerYield) +
      step('Enrolled', enr, prevEnr, series(mine, enrCol), peerEnr) +
    '</div>';
}

function indexToFirst(values) {
  var base = null;
  var i;
  for (i = 0; i < values.length; i++) {
    if (values[i] != null && values[i] !== 0) { base = values[i]; break; }
  }
  if (!base) return values.map(function () { return null; });
  return values.map(function (value) { return value == null ? null : (value / base) * 100; });
}

function seriesCagr(values) {
  var first = null;
  var last = null;
  var start = 0;
  var end = 0;
  var i;
  for (i = 0; i < values.length; i++) {
    if (values[i] != null) {
      if (first == null) { first = values[i]; start = i; }
      last = values[i];
      end = i;
    }
  }
  var years = end - start;
  if (first == null || !last || !years || first <= 0 || last <= 0) return null;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}

function yoyDelta(values, mode) {
  return values.map(function (value, index) {
    if (!index || value == null || values[index - 1] == null) return null;
    if (mode === 'points') return value - values[index - 1];
    if (!values[index - 1]) return null;
    return ((value - values[index - 1]) / Math.abs(values[index - 1])) * 100;
  });
}

function drawIndexedGrowth(canvasId, mine, peers) {
  var apps = field('applications');
  if (!apps) { showEmpty(canvasId, 'Applications are not on the connected view yet.'); return; }
  var labels = unionSurveyYears(mine, peers);
  var mineMap = yearValueMap(mine, apps, false);
  var peerMap = yearValueMap(state.peerQueryBlocked ? [] : peers, apps, false);
  var mineRaw = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
  var peerRaw = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
  var mineIdx = indexToFirst(mineRaw);
  var peerIdx = indexToFirst(peerRaw);
  var mineCagr = seriesCagr(mineRaw);
  var peerCagr = seriesCagr(peerRaw);
  drawChart(canvasId, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Institution' + (mineCagr == null ? '' : ' ' + (mineCagr >= 0 ? '+' : '') + mineCagr.toFixed(1) + '%/yr'),
          data: mineIdx,
          borderColor: '#FFD100',
          backgroundColor: 'transparent',
          pointBackgroundColor: '#FFD100',
          pointRadius: 4,
          borderWidth: 2,
          tension: 0,
          fill: false,
          spanGaps: true
        },
        {
          label: peerLegendTag() + (peerCagr == null ? '' : ' ' + (peerCagr >= 0 ? '+' : '') + peerCagr.toFixed(1) + '%/yr'),
          data: peerIdx,
          borderColor: '#6FBFB0',
          backgroundColor: 'transparent',
          pointBackgroundColor: '#6FBFB0',
          pointRadius: 3,
          borderWidth: 2,
          borderDash: [6, 4],
          tension: 0,
          fill: false,
          spanGaps: true
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: true },
        ipedsMarks: { latest: true, format: 'count' },
        ipedsNotes: { trend: false, yoy: true }
      },
      scales: { y: { beginAtZero: false, ticks: { callback: function (v) { return Math.round(v); } } } },
      layout: { padding: { top: 12, right: 68, bottom: 2, left: 2 } }
    }
  });
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: 'Applications', values: mineRaw, format: 'count' },
    { label: peerLegendTag() + ' applications', values: peerRaw, format: 'count' }
  ], 'Indexed to the first survey year = 100. The table is the raw application count.'));
  detailStore[canvasId].explore = { kind: 'trend', datasetDefs: [{ label: 'Applications', column: apps, percent: false, axis: 'y' }], percent: false };
  delete detailStore[canvasId].detailCompareConfig;
}

function ratioPct(numer, denom) {
  if (numer == null || denom == null || !isFinite(numer) || !isFinite(denom) || !denom) return null;
  return (numer / denom) * 100;
}

function enrolledLineColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? '#D5D3CC' : '#5C5C66';
}

function enrolledChangeLabel(value) {
  if (value == null || !isFinite(value)) return '';
  var amount = Math.abs(value).toFixed(1) + '%';
  if (value > 0) return '▲ ' + amount;
  if (value < 0) return '▼ ' + amount;
  return '0.0%';
}

function nestedTipEl() {
  var el = document.getElementById('nested-volume-tip');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'nested-volume-tip';
  el.className = 'nested-volume-tip';
  el.setAttribute('role', 'tooltip');
  el.hidden = true;
  document.body.appendChild(el);
  return el;
}

function nestedVolumeTooltip(appVals, admVals, enrVals, admitRates, yields, changes, mode) {
  var appChanges = yoyDelta(appVals, 'relative');
  var admChanges = yoyDelta(admVals, 'relative');
  var rateChanges = yoyDelta(admitRates, 'points');
  var yieldChanges = yoyDelta(yields, 'points');
  return {
    enabled: false,
    external: function (context) {
      var tip = nestedTipEl();
      var tt = context.tooltip;
      if (!tt || tt.opacity === 0 || !tt.dataPoints || !tt.dataPoints.length) {
        tip.hidden = true;
        return;
      }
      var i = tt.dataPoints[0].dataIndex;
      function count(value) { return value == null ? '—' : Math.round(value).toLocaleString(); }
      function pct(value) { return value == null ? '—' : value.toFixed(1) + '%'; }
      function tone(value) { return value > 0 ? 'is-up' : (value < 0 ? 'is-down' : ''); }
      function changeRow(label, value) {
        return [label, enrolledChangeLabel(value) || '—', tone(value)];
      }
      var rows = mode === 'changes' ? [
        changeRow('Applications', appChanges[i]),
        changeRow('Admitted', admChanges[i]),
        changeRow('Enrolled', changes[i]),
        changeRow('Admit rate', rateChanges[i]),
        changeRow('Yield', yieldChanges[i])
      ] : [
        ['Applications', count(appVals[i]), ''],
        ['Admitted', count(admVals[i]), ''],
        ['Enrolled', count(enrVals[i]), ''],
        ['Admit rate', pct(admitRates[i]), ''],
        ['Yield', pct(yields[i]), ''],
        changeRow('Enrollment', changes[i])
      ];
      var year = (tt.title && tt.title[0]) || '';
      tip.innerHTML = '<div class="nested-volume-tip-year">' + escapeHtml(year) + '</div>' +
        rows.map(function (row) {
          return '<span>' + escapeHtml(row[0]) + '</span><strong class="' + row[2] + '">' + escapeHtml(row[1]) + '</strong>';
        }).join('');
      tip.hidden = false;
      var rect = context.chart.canvas.getBoundingClientRect();
      var left = rect.left + tt.caretX + 16;
      var top = rect.top + tt.caretY - tip.offsetHeight / 2;
      if (left + tip.offsetWidth > window.innerWidth - 8) left = rect.left + tt.caretX - tip.offsetWidth - 16;
      if (left < 8) left = 8;
      if (top + tip.offsetHeight > window.innerHeight - 8) top = window.innerHeight - tip.offsetHeight - 8;
      if (top < 8) top = 8;
      tip.style.left = Math.round(left) + 'px';
      tip.style.top = Math.round(top) + 'px';
    }
  };
}

function nestedAxisWidth(scale) {
  scale.width = 56;
}

function nestedEndLabelPlugin() {
  return {
    id: 'ipedsNestedEndLabels',
    afterDatasetsDraw: function (chart) {
      var ctx = chart.ctx;
      var last = chart.data.labels.length - 1;
      ctx.save();
      ctx.fillStyle = cssVar('--text');
      ctx.font = '11px Inter, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      chart.data.datasets.forEach(function (ds, di) {
        var meta = chart.getDatasetMeta(di);
        if (!meta || meta.hidden) return;
        [0, last].forEach(function (i) {
          if (i < 0 || (i === last && last === 0 && i !== 0)) return;
          var value = ds.data[i];
          var el = meta.data[i];
          if (value == null || !el || i !== 0 && i !== last) return;
          ctx.fillText(formatCompactCount(value), el.x, el.y - 4);
        });
      });
      ctx.restore();
    }
  };
}

function yoyChangeColor(value) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (value > 0) return dark ? '#8dccb0' : '#1f7a4d';
  if (value < 0) return dark ? '#f0b4a0' : '#9a4b32';
  return cssVar('--text-mute');
}

function nestedEnrolledLabelPlugin(changes) {
  return {
    id: 'ipedsNestedEnrolledLabels',
    afterDatasetsDraw: function (chart) {
      var ctx = chart.ctx;
      var meta = chart.getDatasetMeta(0);
      if (!meta) return;
      ctx.save();
      ctx.font = '600 11px Inter, Roboto, sans-serif';
      ctx.textAlign = 'center';
      (chart.data.datasets[0].data || []).forEach(function (value, i) {
        var el = meta.data[i];
        if (value == null || !el) return;
        ctx.fillStyle = cssVar('--text');
        ctx.textBaseline = 'bottom';
        ctx.fillText(Math.round(value).toLocaleString(), el.x, el.y - 6);
        var change = enrolledChangeLabel(changes[i]);
        if (!change) return;
        ctx.fillStyle = yoyChangeColor(changes[i]);
        ctx.textBaseline = 'top';
        ctx.fillText(change, el.x, el.y + 8);
      });
      ctx.restore();
    }
  };
}

function nestedVolumeConfigs(model, tipMode) {
  var enrolledColor = enrolledLineColor();
  var tooltip = nestedVolumeTooltip(model.appVals, model.admVals, model.enrVals, model.admitRates, model.yields, model.changes, tipMode);
  var yFit = { afterFit: nestedAxisWidth };
  var top = {
    type: 'bar',
    data: {
      labels: model.labels,
      datasets: [
        { label: 'Applications', data: model.appVals, backgroundColor: '#FFD100', maxBarThickness: 22, order: 2 },
        { label: 'Admitted', data: model.admVals, backgroundColor: '#7FCBBC', maxBarThickness: 22, order: 1 }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: tooltip },
      scales: {
        x: { offset: true, ticks: { display: false }, grid: { display: false } },
        y: { beginAtZero: true, afterFit: yFit, ticks: { callback: function (v) { return formatCompactCount(v); } } }
      },
      layout: { padding: { top: 16, right: 64, bottom: 8, left: 0 } }
    },
    plugins: [nestedEndLabelPlugin()]
  };
  var finite = model.enrVals.filter(function (v) { return v != null && isFinite(v); });
  var min = finite.length ? Math.min.apply(null, finite) : 0;
  var max = finite.length ? Math.max.apply(null, finite) : 1;
  var span = (max - min) || Math.abs(max) || 1;
  var pad = span * 0.1;
  var bottom = {
    type: 'line',
    data: {
      labels: model.labels,
      datasets: [{
        label: 'Enrolled',
        data: model.enrVals,
        borderColor: enrolledColor,
        backgroundColor: 'transparent',
        pointBackgroundColor: enrolledColor,
        pointRadius: 4,
        borderWidth: 2.5,
        tension: 0,
        fill: false,
        spanGaps: true
      }]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: tooltip },
      scales: {
        x: { offset: true, ticks: { display: true, maxRotation: 0, autoSkip: false } },
        y: {
          beginAtZero: false,
          suggestedMin: min - pad,
          suggestedMax: max + pad,
          afterFit: yFit,
          ticks: { callback: function (v) { return formatCompactCount(v); } }
        }
      },
      layout: { padding: { top: 16, right: 64, bottom: 14, left: 0 } }
    },
    plugins: [nestedEnrolledLabelPlugin(model.changes)]
  };
  return { top: top, bottom: bottom };
}

function mountNestedVolumeCharts(canvasId, model) {
  var canvas = $(canvasId);
  var wrap = canvas && canvas.closest ? canvas.closest('.chart-wrap') : null;
  if (!wrap) return;
  destroyChart(canvasId);
  wrap.classList.add('chart-wrap--nested');
  wrap.classList.remove('chart-wrap--empty', 'chart-wrap--loading', 'chart-wrap--error', 'chart-wrap--idle');
  wrap.classList.add('chart-wrap--data');
  wrap.innerHTML =
    '<div class="chart-nested-legend" aria-hidden="true">' +
      '<span><i class="chart-nested-swatch chart-nested-swatch--apps"></i>Applications</span>' +
      '<span><i class="chart-nested-swatch chart-nested-swatch--adm"></i>Admitted</span>' +
      '<span><i class="chart-nested-swatch chart-nested-swatch--enr"></i>Enrolled</span>' +
    '</div>' +
    '<div class="chart-nested-top"><canvas id="' + canvasId + '"></canvas></div>' +
    '<div class="chart-nested-bottom"><canvas id="' + canvasId + '-enrolled"></canvas></div>';
  var configs = nestedVolumeConfigs(model);
  charts[canvasId] = new Chart($(canvasId), themeChart(configs.top, { profile: 'panel' }));
  charts[canvasId + '-enrolled'] = new Chart($(canvasId + '-enrolled'), themeChart(configs.bottom, { profile: 'panel' }));
}

function renderVolumeDetail(model) {
  var wrap = $('detail-chart-wrap');
  if (!wrap) return;
  var host = document.createElement('div');
  host.id = 'detail-nested-host';
  host.className = 'detail-nested-host';
  host.innerHTML =
    '<div class="chart-nested-legend" aria-hidden="true">' +
      '<span><i class="chart-nested-swatch chart-nested-swatch--apps"></i>Applications</span>' +
      '<span><i class="chart-nested-swatch chart-nested-swatch--adm"></i>Admitted</span>' +
      '<span><i class="chart-nested-swatch chart-nested-swatch--enr"></i>Enrolled</span>' +
    '</div>' +
    '<div class="chart-nested-top"><canvas id="detail-nested-bars"></canvas></div>' +
    '<div class="chart-nested-bottom"><canvas id="detail-nested-enrolled"></canvas></div>';
  wrap.appendChild(host);
  var configs = nestedVolumeConfigs(model, 'changes');
  detailChart = new Chart($('detail-nested-bars'), themeChart(configs.top, { profile: 'detail' }));
  detailNestedChart = new Chart($('detail-nested-enrolled'), themeChart(configs.bottom, { profile: 'detail' }));
}

function resetNestedShell(canvasId) {
  var canvas = $(canvasId);
  var wrap = canvas && canvas.closest ? canvas.closest('.chart-wrap') : null;
  if (!wrap) return;
  destroyChart(canvasId);
  wrap.classList.remove('chart-wrap--nested');
  wrap.innerHTML = '<canvas id="' + canvasId + '"></canvas>';
}

function drawNestedVolume(canvasId, mine, peers) {
  var apps = field('applications');
  var adm = field('admissions');
  var enr = field('enrollment');
  var labels = unionSurveyYears(mine || [], state.peerQueryBlocked ? [] : (peers || []));
  if (!labels.length || !apps) {
    if ($(canvasId) && $(canvasId).closest && $(canvasId).closest('.chart-wrap--nested')) resetNestedShell(canvasId);
    showEmpty(canvasId, trendMessage());
    return;
  }
  function seriesFor(rows, column) {
    var map = yearValueMap(rows || [], column, false);
    return labels.map(function (year) { return map[year] == null ? null : map[year]; });
  }
  var appVals = seriesFor(mine, apps);
  var admVals = seriesFor(mine, adm);
  var enrVals = seriesFor(mine, enr);
  var admitRates = labels.map(function (_, i) { return ratioPct(admVals[i], appVals[i]); });
  var yields = labels.map(function (_, i) { return ratioPct(enrVals[i], admVals[i]); });
  var changes = yoyDelta(enrVals, 'relative');
  var model = { labels: labels, appVals: appVals, admVals: admVals, enrVals: enrVals, admitRates: admitRates, yields: yields, changes: changes };
  mountNestedVolumeCharts(canvasId, model);
  var peerRows = state.peerQueryBlocked ? [] : (peers || []);
  var peerApps = seriesFor(peerRows, apps);
  var peerAdm = seriesFor(peerRows, adm);
  var peerEnr = seriesFor(peerRows, enr);
  if (!detailStore[canvasId] || detailStore[canvasId].empty || detailStore[canvasId].error) detailStore[canvasId] = {};
  delete detailStore[canvasId].empty;
  delete detailStore[canvasId].error;
  detailStore[canvasId].volumePanels = model;
  detailStore[canvasId].build = function () { return nestedVolumeConfigs(model).top; };
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: 'Applications', values: appVals, format: 'count' },
    { label: 'Applications change', values: yoyDelta(appVals, 'relative'), format: 'delta' },
    { label: 'Admitted', values: admVals, format: 'count' },
    { label: 'Admitted change', values: yoyDelta(admVals, 'relative'), format: 'delta' },
    { label: 'Enrolled', values: enrVals, format: 'count' },
    { label: 'Enrolled change', values: yoyDelta(enrVals, 'relative'), format: 'delta' },
    { label: 'Admit rate', values: admitRates, percent: true },
    { label: 'Yield', values: yields, percent: true },
    { label: peerLegendTag() + ' enrolled', values: peerEnr, format: 'count' },
    { label: 'Peer enrolled change', values: yoyDelta(peerEnr, 'relative'), format: 'delta' },
    { label: peerLegendTag() + ' applications', values: peerApps, format: 'count' },
    { label: 'Peer applications change', values: yoyDelta(peerApps, 'relative'), format: 'delta' },
    { label: peerLegendTag() + ' admitted', values: peerAdm, format: 'count' },
    { label: 'Peer admitted change', values: yoyDelta(peerAdm, 'relative'), format: 'delta' }
  ], 'Applications and admits are the upper bars. Enrolled is the lower line. The percent under each point is the change from the prior year.'));
  clearAppBusyEarly();
}

function percentPoint(row, column, numer, denom) {
  if (!row) return null;
  var direct = column ? num(row[column]) : null;
  if (direct != null) return direct <= 1.5 ? direct * 100 : direct;
  var n = numer ? num(row[numer]) : null;
  var d = denom ? num(row[denom]) : null;
  if (n == null || !d) return null;
  return (n / d) * 100;
}

function sortedNums(values) {
  return (values || []).filter(function (value) { return value != null && isFinite(value); }).sort(function (a, b) { return a - b; });
}

function quantileSorted(sorted, p) {
  if (!sorted.length) return null;
  var pos = (sorted.length - 1) * p;
  var lo = Math.floor(pos);
  var hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function peerSummary(values) {
  var sorted = sortedNums(values);
  return {
    n: sorted.length,
    min: sorted.length ? sorted[0] : null,
    max: sorted.length ? sorted[sorted.length - 1] : null,
    q1: quantileSorted(sorted, 0.25),
    median: quantileSorted(sorted, 0.5),
    q3: quantileSorted(sorted, 0.75)
  };
}

function percentileOf(value, values) {
  var sorted = sortedNums(values);
  if (value == null || !sorted.length) return null;
  var atOrBelow = sorted.filter(function (item) { return item <= value; }).length;
  return (atOrBelow / sorted.length) * 100;
}

function ordinalPct(rank) {
  var n = Math.round(rank);
  var teen = n % 100;
  var suffix = (teen >= 11 && teen <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return n + suffix + ' pct';
}

function distributionScale(values, asPercent) {
  var nums = sortedNums(values);
  if (!nums.length) return { toPlot: function (value) { return value; }, min: 0, max: 1, ticks: [0, 1] };
  var max = nums[nums.length - 1];
  var positive = nums.filter(function (value) { return value > 0; });
  var minPos = positive.length ? positive[0] : 0;
  var useLog = !asPercent && positive.length > 1 && max / minPos > 25;
  if (!useLog) {
    var hi = asPercent ? Math.min(100, niceCeiling(Math.max(max, 1))) : niceCeiling(Math.max(max, 0));
    if (asPercent) hi = Math.max(hi, 10);
    return {
      toPlot: function (value) { return value; },
      min: 0,
      max: hi,
      ticks: null
    };
  }
  var ceiling = niceCeiling(max);
  var ticks = symlogTicks(ceiling).filter(function (raw) { return raw >= minPos * 0.9; });
  if (ticks[ticks.length - 1] < ceiling) ticks.push(ceiling);
  return {
    toPlot: function (value) { return value > 0 ? symlog(value) : symlog(ticks[0]); },
    min: symlog(ticks[0]),
    max: symlog(ticks[ticks.length - 1]),
    ticks: ticks
  };
}

function rememberDetail(canvasId, config) {
  if (!detailStore[canvasId] || detailStore[canvasId].empty || detailStore[canvasId].error) detailStore[canvasId] = {};
  delete detailStore[canvasId].empty;
  delete detailStore[canvasId].error;
  var plain = cloneChartData(config.data);
  var chartType = config.type;
  var chartOptions = config.options || {};
  var chartPlugins = config.plugins || [];
  detailStore[canvasId].config = { type: chartType };
  detailStore[canvasId].build = function () {
    return { type: chartType, data: cloneChartData(plain), options: chartOptions, plugins: chartPlugins };
  };
}

function percentileScatterConfig(points, xTitle, yTitle) {
  var peerX = points.filter(function (pt) { return !pt.mine; }).map(function (pt) { return pt.x; });
  var peerY = points.filter(function (pt) { return !pt.mine; }).map(function (pt) { return pt.y; });
  function pack(list) {
    return list.map(function (pt) {
      return {
        x: percentileOf(pt.x, peerX),
        y: percentileOf(pt.y, peerY),
        xRaw: pt.x,
        yRaw: pt.y,
        r: pt.mine ? 8 : 5,
        name: pt.name,
        mine: pt.mine
      };
    });
  }
  var peers = pack(points.filter(function (pt) { return !pt.mine; }));
  var minePts = pack(points.filter(function (pt) { return pt.mine; }));
  return {
    type: 'scatter',
    data: {
      datasets: [
        { label: 'Peers', data: peers, pointRadius: 5, pointHoverRadius: 7, backgroundColor: 'rgba(111,191,176,0.55)', borderColor: '#6FBFB0', borderWidth: 1 },
        { label: 'Institution', data: minePts, pointRadius: 8, pointHoverRadius: 9, backgroundColor: '#FFD100', borderColor: '#FFD100', borderWidth: 1.5 }
      ]
    },
    options: {
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var raw = ctx.raw || {};
              return (raw.name || ctx.dataset.label) + ': ' + xTitle + ' ' + Math.round(raw.x) + 'th pct, ' + yTitle + ' ' + Math.round(raw.y) + 'th pct';
            }
          }
        }
      },
      scales: {
        x: { min: 0, max: 100, title: { display: true, text: xTitle + ' percentile', color: axisInk() }, ticks: { callback: function (v) { return v + '%'; } } },
        y: { min: 0, max: 100, title: { display: true, text: yTitle + ' percentile', color: axisInk() }, ticks: { callback: function (v) { return v + '%'; } } }
      },
      layout: { padding: { top: 18, right: 16, bottom: 8, left: 8 } }
    },
    plugins: [{
      id: 'ipedsQuadrants',
      afterDraw: function (chart) {
        var area = chart.chartArea;
        var x = chart.scales.x.getPixelForValue(50);
        var y = chart.scales.y.getPixelForValue(50);
        var ctx = chart.ctx;
        ctx.save();
        ctx.strokeStyle = cssVar('--text-dim');
        ctx.globalAlpha = 0.45;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(x, area.top);
        ctx.lineTo(x, area.bottom);
        ctx.moveTo(area.left, y);
        ctx.lineTo(area.right, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = cssVar('--text');
        ctx.font = '11px Inter, Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Higher ' + yTitle.toLowerCase(), area.left + 6, area.top + 4);
        ctx.textAlign = 'right';
        ctx.fillText('Higher ' + xTitle.toLowerCase(), area.right - 6, area.bottom - 16);
        ctx.restore();
      }
    }]
  };
}

function drawIndexedComparison(canvasId, mine, peers, item) {
  mine = mine || [];
  var peerRows = state.peerQueryBlocked ? [] : (peers || []);
  var labels = unionSurveyYears(mine, peerRows);
  if (!labels.length) {
    showEmpty(canvasId, trendMessage());
    return;
  }
  var isRate = !!item.percent;
  var mineMap = yearValueMap(mine, item.column, isRate);
  var peerMap = yearValueMap(peerRows, item.column, isRate);
  var mineRaw = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
  var peerRaw = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
  if (!mineRaw.some(function (value) { return value != null; }) && !peerRaw.some(function (value) { return value != null; })) {
    showEmpty(canvasId, 'This metric is not on the connected view yet.');
    return;
  }
  var mineIdx = indexToFirst(mineRaw);
  var peerIdx = indexToFirst(peerRaw);
  var format = item.format || (isRate ? 'percent' : 'count');
  var sets = [];
  if (mineIdx.some(function (value) { return value != null; })) {
    sets.push({
      label: item.label,
      data: mineIdx,
      raw: mineRaw,
      borderColor: '#FFD100',
      backgroundColor: 'transparent',
      pointBackgroundColor: '#FFD100',
      pointRadius: 4,
      borderWidth: 2.5,
      tension: 0,
      fill: false,
      spanGaps: true
    });
  }
  if (peerIdx.some(function (value) { return value != null; })) {
    sets.push({
      label: peerLegendTag(),
      data: peerIdx,
      raw: peerRaw,
      borderColor: '#6FBFB0',
      backgroundColor: 'transparent',
      pointBackgroundColor: '#6FBFB0',
      pointRadius: 3,
      borderWidth: 2,
      borderDash: [6, 4],
      tension: 0,
      fill: false,
      spanGaps: true
    });
  }
  drawChart(canvasId, {
    type: 'line',
    data: { labels: labels, datasets: sets },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: sets.length > 1, labels: { usePointStyle: true, boxWidth: 28, boxHeight: 6, padding: 10 } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var raw = ctx.dataset.raw ? ctx.dataset.raw[ctx.dataIndex] : null;
              var indexText = ctx.parsed.y == null ? '—' : Math.round(ctx.parsed.y);
              var absolute = raw == null ? '—' : formatAxisValue(raw, format);
              return ctx.dataset.label + ': ' + indexText + ' · ' + absolute;
            }
          }
        },
        ipedsMarks: { latest: true, format: 'count' },
        ipedsNotes: { trend: false, yoy: true }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: 'Index, first year = 100', color: axisInk(), font: { size: 13, family: 'Inter, Roboto, sans-serif' } },
          ticks: { callback: function (value) { return Math.round(value); } }
        }
      },
      layout: { padding: { top: 22, right: 72, bottom: 20, left: 4 } }
    }
  });
  setChartSubtitle(canvasId, 'First survey year = 100 for the institution and for the peer average. The tooltip shows the index and the absolute value.');
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: item.label, values: mineRaw, format: format },
    { label: peerLegendTag(), values: peerRaw, format: format }
  ], 'Absolute values. The chart indexes each series to its own first year.'));
}

function divergingAxis(values) {
  var maxAbs = 0;
  (values || []).forEach(function (value) {
    if (value != null && isFinite(value)) maxAbs = Math.max(maxAbs, Math.abs(value));
  });
  if (!maxAbs) maxAbs = 1;
  var rough = Math.max(maxAbs / 2, 1);
  var pow = Math.pow(10, Math.floor(Math.log10(rough)));
  var unit = rough / pow;
  var step = (unit > 5 ? 10 : unit > 2 ? 5 : unit > 1 ? 2 : 1) * pow;
  var bound = Math.ceil(maxAbs / step) * step;
  return { min: -bound, max: bound, step: step };
}

function fittedDivergingAxis(values) {
  var min = 0;
  var max = 0;
  (values || []).forEach(function (value) {
    if (value == null || !isFinite(value)) return;
    if (value < min) min = value;
    if (value > max) max = value;
  });
  var span = Math.max(max - min, 1);
  var pad = span * 0.12;
  if (min < 0) min -= pad;
  if (max > 0) max += pad;
  if (min > 0) min = 0;
  if (max < 0) max = 0;
  var rough = Math.max(Math.abs(min), Math.abs(max), 1) / 3;
  var pow = Math.pow(10, Math.floor(Math.log10(rough)));
  var unit = rough / pow;
  var step = (unit > 5 ? 10 : unit > 2 ? 5 : unit > 1 ? 2 : 1) * pow;
  return {
    min: Math.floor(min / step) * step,
    max: Math.ceil(max / step) * step,
    step: step
  };
}

function drawDiverging(canvasId, mine, peers, column, mode) {
  var labels = unionSurveyYears(mine, peers);
  var mineMap = yearValueMap(mine, column, mode === 'points');
  var peerMap = yearValueMap(state.peerQueryBlocked ? [] : peers, column, mode === 'points');
  var mineVals = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
  var peerVals = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
  var mineDelta = yoyDelta(mineVals, mode);
  var peerDelta = yoyDelta(peerVals, mode);
  if ((canvasId === 'chart-endow-yoy' || canvasId === 'chart-giving-yoy') && labels.length && mineDelta[0] == null && peerDelta[0] == null) {
    labels = labels.slice(1);
    mineDelta = mineDelta.slice(1);
    peerDelta = peerDelta.slice(1);
  }
  if (!mineDelta.some(function (v) { return v != null; })) { showEmpty(canvasId, 'Not enough years to show change.'); return; }
  var fitted = canvasId === 'chart-endow-yoy' || canvasId === 'chart-giving-yoy';
  var axis = fitted ? fittedDivergingAxis(mineDelta.concat(peerDelta)) : divergingAxis(mineDelta.concat(peerDelta));
  drawChart(canvasId, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Institution', data: mineDelta, backgroundColor: '#FFD100', maxBarThickness: 18, pointStyle: 'rect' },
        { label: peerLegendTag(), data: peerDelta, backgroundColor: '#6FBFB0', maxBarThickness: 18, pointStyle: 'rect' }
      ]
    },
    options: {
      plugins: { legend: { display: true, labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8 } } },
      scales: {
        y: {
          min: axis.min,
          max: axis.max,
          beginAtZero: false,
          ticks: {
            stepSize: axis.step,
            callback: function (v) { return (v > 0 ? '+' : '') + v + '%'; }
          },
          grid: {
            color: function (ctx) { return ctx.tick && ctx.tick.value === 0 ? cssVar('--text') : cssVar('--border'); },
            lineWidth: function (ctx) { return ctx.tick && ctx.tick.value === 0 ? 2 : 1; }
          }
        }
      },
      layout: { padding: { top: 16, right: 56, bottom: 8, left: 4 } }
    }
  });
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: 'Institution change', values: mineDelta, format: mode === 'points' ? 'points' : 'delta' },
    { label: peerLegendTag() + ' change', values: peerDelta, format: mode === 'points' ? 'points' : 'delta' }
  ], 'Change is a percent. Yellow is the institution. Teal is the peer average.'));
}

function drawPriceGap(canvasId, mine, peers) {
  var tuition = field('tuition');
  var ntr = field('ntr');
  if (!tuition || !ntr) { showEmpty(canvasId, 'Tuition columns are not on the connected view yet.'); return; }
  var labels = unionSurveyYears(mine, peers);
  var pub = labels.map(function (year) { var m = yearValueMap(mine, tuition, false); return m[year] == null ? null : m[year]; });
  var net = labels.map(function (year) { var m = yearValueMap(mine, ntr, false); return m[year] == null ? null : m[year]; });
  var last = pub.length - 1;
  while (last >= 0 && (pub[last] == null || net[last] == null)) last -= 1;
  var gap = last >= 0 && pub[last] ? ((pub[last] - net[last]) / pub[last]) * 100 : null;
  drawChart(canvasId, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Published tuition', data: pub, borderColor: '#FFD100', backgroundColor: 'rgba(255,209,0,0.18)', pointRadius: 3, borderWidth: 2, tension: 0, fill: '+1', spanGaps: true },
        { label: 'Net tuition revenue', data: net, borderColor: '#18181A', backgroundColor: 'transparent', pointRadius: 3, borderWidth: 2, tension: 0, fill: false, spanGaps: true }
      ]
    },
    options: {
      plugins: {
        legend: { display: true },
        subtitle: { display: gap != null, text: gap == null ? '' : 'Latest-year gap ' + gap.toFixed(1) + '% of published tuition', font: { size: 12 } },
        ipedsNotes: { trend: false }
      },
      scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return formatChartCurrency(v); } } } }
    }
  });
  setDetailTable(canvasId, overlayTableHtml(labels, [
    { label: 'Published tuition', values: pub, format: 'currency' },
    { label: 'Net tuition revenue', values: net, format: 'currency' }
  ], ''));
  detailStore[canvasId].explore = { kind: 'trend', datasetDefs: [{ label: 'Published tuition', column: tuition, percent: false, axis: 'y' }, { label: 'Net tuition revenue', column: ntr, percent: false, axis: 'y' }], percent: false };
}

function heatCell(delta, unit) {
  if (delta == null || !isFinite(delta)) return '<td>—</td>';
  var mag = Math.min(Math.abs(delta) / 20, 1);
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var rgb = delta >= 0 ? (dark ? '141,204,176' : '31,122,77') : (dark ? '240,180,160' : '154,75,50');
  var alpha = dark ? (0.45 + mag * 0.25) : (0.18 + mag * 0.55);
  var color = 'rgba(' + rgb + ',' + alpha + ')';
  var ink = dark ? ';color:#F4F4F1' : '';
  return '<td class="heat-cell" style="background:' + color + ink + '">' + (delta >= 0 ? '+' : '') + delta.toFixed(1) + unit + '</td>';
}

function heatTableHtml(title, mine, peers, specs) {
  var labels = unionSurveyYears(mine, state.peerQueryBlocked ? [] : peers);
  var html = '<table class="preview-table heat-table"><thead><tr><th>' + escapeHtml(title) + '</th>';
  labels.forEach(function (year) { html += '<th>' + escapeHtml(year) + '</th>'; });
  var peerHead = state.year ? ('Peer avg (' + state.year + ')') : 'Peer avg';
  html += '<th>' + escapeHtml(peerHead) + '</th></tr></thead><tbody>';
  specs.forEach(function (spec) {
    var mineMap = yearValueMap(mine, spec.column, spec.percent);
    var peerMap = yearValueMap(state.peerQueryBlocked ? [] : peers, spec.column, spec.percent);
    var values = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
    var deltas = yoyDelta(values, spec.percent ? 'points' : 'relative');
    var unit = '%';
    html += '<tr><td>' + escapeHtml(spec.label) + '</td>';
    deltas.forEach(function (delta) { html += heatCell(delta, unit); });
    var peerYear = state.year && peerMap[state.year] != null ? peerMap[state.year] : null;
    html += '<td>' + (peerYear == null ? '—' : (spec.percent ? peerYear.toFixed(1) + '%' : formatCompactCount(peerYear))) + '</td></tr>';
  });
  return html + '</tbody></table>';
}

function heatValueText(value, percent) {
  if (value == null || !isFinite(value)) return '—';
  return percent ? value.toFixed(1) + '%' : formatCompactCount(value);
}

function heatDeltaText(delta, percent) {
  if (delta == null || !isFinite(delta)) return '—';
  return (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%';
}

function heatDetailTable(mine, peers, specs) {
  var peerRows = state.peerQueryBlocked ? [] : (peers || []);
  var labels = unionSurveyYears(mine, peerRows);
  var html = '<table class="preview-table"><thead><tr><th>Metric</th><th>Year</th><th>Value</th><th>Change</th><th>Peer avg</th><th>Vs peer</th></tr></thead><tbody>';
  specs.forEach(function (spec) {
    if (!spec.column) return;
    var mineMap = yearValueMap(mine, spec.column, spec.percent);
    var peerMap = yearValueMap(peerRows, spec.column, spec.percent);
    var values = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
    var deltas = yoyDelta(values, spec.percent ? 'points' : 'relative');
    tableIndicesNewestYearFirst(labels).forEach(function (index) {
      var year = labels[index];
      var value = values[index];
      var peer = peerMap[year];
      var gap = value != null && peer != null ? value - peer : null;
      html += '<tr><td>' + escapeHtml(spec.label) + '</td><td>' + escapeHtml(year) + '</td><td>' +
        escapeHtml(heatValueText(value, spec.percent)) + '</td><td>' + escapeHtml(heatDeltaText(deltas[index], spec.percent)) +
        '</td><td>' + escapeHtml(heatValueText(peer, spec.percent)) + '</td><td>' +
        escapeHtml(heatDeltaText(gap, spec.percent)) + '</td></tr>';
    });
  });
  return html + '</tbody></table><p class="peer-note">Green is an increase. Red is a decrease. Vs peer is the institution minus the peer average for that year. ' +
    escapeHtml(peerDefinitionLine()) + '</p>';
}

function mountHeatTable(host, detailId, title, mine, peers, specs) {
  if (!host) return;
  var summary = heatTableHtml('YoY change', mine, peers, specs);
  var detail = heatDetailTable(mine, peers, specs);
  host.setAttribute('data-detail', detailId);
  host.innerHTML =
    '<article class="panel panel--inset panel--lite heat-card">' +
      '<div class="box-head box-head--compact">' +
        '<div class="box-head-text"><h2 class="box-title">' + escapeHtml(titleCaseLabel(title)) + '</h2>' +
        '<p class="box-subtitle box-subtitle--sentence">Year-over-year change for the headline metrics.</p></div>' +
        '<button type="button" class="btn-text panel-tools" data-detail="' + detailId + '" title="' +
          escapeHtml('Open a larger chart. Filters chosen here do not change the dashboard until you set them in the filter bar and click Apply.') +
        '">Details</button></div>' +
      '<div class="heat-card-body">' + summary + '</div></article>';
  var peerRows = state.peerQueryBlocked ? [] : (peers || []);
  var labels = unionSurveyYears(mine, peerRows);
  var latestIndex = labels.length - 1;
  var metricLabels = [];
  var instDelta = [];
  var peerDelta = [];
  specs.forEach(function (spec) {
    if (!spec.column || latestIndex < 1) return;
    var mineMap = yearValueMap(mine, spec.column, spec.percent);
    var peerMap = yearValueMap(peerRows, spec.column, spec.percent);
    var values = labels.map(function (year) { return mineMap[year] == null ? null : mineMap[year]; });
    var peerValues = labels.map(function (year) { return peerMap[year] == null ? null : peerMap[year]; });
    var mineChange = yoyDelta(values, spec.percent ? 'points' : 'relative')[latestIndex];
    var peerChange = yoyDelta(peerValues, spec.percent ? 'points' : 'relative')[latestIndex];
    metricLabels.push(spec.label + ' (%)');
    instDelta.push(mineChange);
    peerDelta.push(peerChange);
  });
  detailStore[detailId] = {
    tableHtml: detail,
    baseTableHtml: detail,
    title: title,
    subtitle: 'Latest-year change versus the prior year, with the peer average beside it. ' + peerDefinitionLine(),
    build: function () {
      return {
        type: 'bar',
        data: {
          labels: metricLabels,
          datasets: [
            { label: 'Institution', data: instDelta.slice(), backgroundColor: '#FFD100', maxBarThickness: 18 },
            { label: peerLegendTag(), data: peerDelta.slice(), backgroundColor: '#6FBFB0', maxBarThickness: 18 }
          ]
        },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: true } },
          scales: {
            x: { ticks: { callback: function (v) { return (v > 0 ? '+' : '') + v; } } }
          }
        }
      };
    }
  };
}

function columnMean(rows, column) {
  var vals = [];
  rowsForYear(rows || [], state.year).forEach(function (row) {
    if (!column) return;
    if (state.institution && str(row.INSTNM) === state.institution) return;
    var value = num(row[column]);
    if (value != null) vals.push(value);
  });
  if (!vals.length) return null;
  return vals.reduce(function (sum, value) { return sum + value; }, 0) / vals.length;
}

function rankPeerRows(peerRows, mine, column) {
  var combined = (peerRows || []).slice();
  if (state.institution && column && mine && mine.length) {
    var mineYear = rowsForYear(mine, state.year);
    var source = mineYear.length ? mineYear[mineYear.length - 1] : mine[mine.length - 1];
    if (source && num(source[column]) != null) {
      var present = combined.some(function (row) {
        return str(row.INSTNM) === state.institution && (!state.year || str(row.SURVEY_YEAR) === String(state.year));
      });
      if (!present) combined.push(Object.assign({}, source, { INSTNM: state.institution }));
    }
  }
  var yearRows = rowsForYear(combined, state.year).slice().sort(function (a, b) {
    return (num(b[column]) || 0) - (num(a[column]) || 0);
  });
  var peerVals = yearRows.filter(function (row) {
    return str(row.INSTNM) !== state.institution;
  }).map(function (row) { return num(row[column]); }).filter(function (value) {
    return value != null && isFinite(value);
  });
  var instRow = yearRows.filter(function (row) { return str(row.INSTNM) === state.institution; })[0];
  var instVal = instRow ? num(instRow[column]) : null;
  var rank = peerOrdinalRank(instVal, peerVals);
  var nominalN = advancementNominalPeerN(peerRows, state.year);
  return {
    top: yearRows.slice(0, 10),
    note: rank ? formatPeerRankSubtitle(rank, peerVals.length, nominalN) : ''
  };
}

function renderAdmissions(mine, peers, peerRows, scope) {
  scope = scope || 'all';
  var apps = field('applications');
  var adm = field('admissions');
  var enr = field('enrollment');
  var admit = field('admitRate');
  var yieldCol = field('yieldRate') || 'YIELD_RATE';
  if (scope === 'all' || scope === 'institution' || scope === 'peer') {
    updateAdmissionsFunnel(mine, peers);
    drawIndexedGrowth('chart-index', mine, peers);
    drawNestedVolume('chart-nested', mine, peers);
    mountHeatTable($('admissions-heat'), 'chart-adm-heat', 'Admissions change', mine, peers, [
      { label: 'Applications', column: apps, percent: false },
      { label: 'Admitted', column: adm, percent: false },
      { label: 'Enrolled', column: enr, percent: false },
      { label: 'Admit rate', column: admit, percent: true },
      { label: 'Yield', column: yieldCol, percent: true }
    ]);
    var yieldDark = document.documentElement.getAttribute('data-theme') === 'dark';
    drawOverlayTrend('chart-yield', mine, peers, [
      { label: 'Admit rate', peerLabel: 'Peer average', column: admit, percent: true, color: '#FFD100', peerColor: '#6FBFB0' }
    ], true);
    drawOverlayTrend('chart-yield-rate', mine, peers, [
      { label: 'Yield', peerLabel: 'Peer average', column: yieldCol, percent: true, color: yieldDark ? '#FFE566' : '#C4A000', peerColor: '#6FBFB0' }
    ], true);
    drawOverlayTrend('chart-discount', mine, peers, [
      { label: 'Discount rate', column: field('discount'), percent: true }
    ]);
    drawDiverging('chart-discount-yoy', mine, peers, field('discount'), 'points');
    drawOverlayTrend('chart-pell', mine, peers, [{ label: 'Pell eligibility', column: field('pell'), percent: true }], true);
    drawDiverging('chart-pell-yoy', mine, peers, field('pell'), 'points');
    drawPriceGap('chart-price', mine, peers);
  }
  if (scope === 'all' || scope === 'top') {
    var rankedApps = rankPeerRows(peerRows, mine, apps);
    state.rankNotes.admissions = rankedApps.note;
    var yearRows = rankedApps.top;
    if (!yearRows.length) {
      var topMsg = state.peerCompareOn === false
        ? 'Comparison is off.'
        : (state.peerQueryBlocked
        ? PEER_PICK_FILTERS_MSG
        : (state.year
          ? 'No comparison schools with application data for survey year ' + state.year + '.'
          : 'Select a survey year to rank comparison institutions by applications.'));
      showEmpty('chart-top', topMsg);
    } else {
      drawHorizontal('chart-top', yearRows.map(function (row) { return row.INSTNM; }), yearRows.map(function (row) { return num(row[apps]); }), 'Applications', 'count', { mean: columnMean(peerRows, apps), meanLabel: 'Peer avg' });
    }
  }
}

function renderAdvancement(mine, peers, peerRows, scope) {
  scope = scope || 'all';
  var endowCol = field('endowment');
  var givingCol = field('giving');
  wireAdvExplorerControls();
  if (scope === 'all' || scope === 'institution' || scope === 'peer' || scope === 'top') {
    var peerList = peerRows && peerRows.length
      ? peerRows
      : ((state.paintCache && state.paintCache.peerInstitutionRows) || []);
    mountAdvPercentileStand(mine, peerList);
    updateAdvancementSectionTakeaways(mine, peerList);
  }
  if (scope === 'all' || scope === 'institution' || scope === 'peer' || scope === 'top') {
    var peerListTrend = peerRows && peerRows.length
      ? peerRows
      : ((state.paintCache && state.paintCache.peerInstitutionRows) || []);
    mountAdvTrendExplorer(mine, peerListTrend);
  }
  if (scope === 'all' || scope === 'institution' || scope === 'peer') {
    mountHeatTable($('advancement-heat'), 'chart-adv-heat', 'Advancement change', mine, peers, [
      { label: 'Endowment', column: endowCol, percent: false },
      { label: 'Private giving', column: givingCol, percent: false },
      { label: 'FTE', column: field('fte'), percent: false },
      { label: 'Endowment / FTE', column: 'ENDOWMENT_PER_FTE', percent: false }
    ]);
  }
  if (scope === 'all' || scope === 'top') {
    var rankedEndow = rankPeerRows(peerRows, mine, endowCol);
    state.rankNotes.advancement = rankedEndow.note;
    var yearRows = rankedEndow.top;
    if (!endowCol || !yearRows.length) {
      var topMsg = state.peerCompareOn === false
        ? 'Comparison is off.'
        : (state.peerQueryBlocked
        ? PEER_PICK_FILTERS_MSG
        : (state.year
          ? 'No comparison schools with endowment data for survey year ' + state.year + '.'
          : 'Select a survey year to rank comparison institutions by endowment.'));
      showEmpty('chart-adv-top', topMsg);
    } else {
      var peerMed = null;
      if (peerRows && peerRows.length) {
        var medVals = rowsForYear(peerRows, state.year).filter(function (row) {
          return str(row.INSTNM) !== state.institution;
        }).map(function (row) { return num(row[endowCol]); }).filter(function (v) { return v != null && isFinite(v); });
        peerMed = medVals.length ? quantileSorted(sortedNums(medVals), 0.5) : null;
      }
      drawHorizontal(
        'chart-adv-top',
        yearRows.map(function (row) { return row.INSTNM; }),
        yearRows.map(function (row) { return num(row[endowCol]); }),
        'Endowment',
        'currency',
        { mean: peerMed != null ? peerMed : columnMean(peerRows, endowCol), meanLabel: 'Peer median' }
      );
    }
  }
  verifyAdvancementShell();
}

function renderResidence(mineRows, peerRows) {
  function top(rows) {
    var totals = {};
    rows.forEach(function (row) {
      var label = row.EFCSTATE_LABEL || row.EFCSTATE_TITLE;
      if (isSummaryPlace(label)) return;
      var value = residenceRowCount(row);
      if (value == null) return;
      totals[label] = (totals[label] || 0) + value;
    });
    return Object.keys(totals).map(function (label) {
      return { label: label, value: totals[label] };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
  }
  var mine = top(mineRows);
  var peer = top(peerRows);
  var missing = state.connected.migration ? 'No residence rows for this year.' : 'Map VW_IPEDS_MIGRATION_BETA to the migration alias.';
  if (state.residenceInstError && !mine.length) {
    showChartError('chart-residence', state.residenceInstError);
    return;
  }
  if (!mine.length && !peer.length) {
    showEmpty('chart-residence', state.institution ? missing : 'Select an institution.');
    return;
  }
  var labels = [];
  var seen = {};
  mine.concat(peer).forEach(function (row) {
    if (!seen[row.label]) {
      seen[row.label] = true;
      labels.push(row.label);
    }
  });
  labels = labels.slice(0, 8);
  var mineMap = {};
  var peerMap = {};
  mine.forEach(function (row) { mineMap[row.label] = row.value; });
  peer.forEach(function (row) { peerMap[row.label] = row.value; });
  var sets = [];
  if (mine.length) {
    sets.push({
      label: 'Institution',
      data: labels.map(function (label) { return mineMap[label] == null ? null : mineMap[label]; }),
      backgroundColor: '#FFD100',
      maxBarThickness: 22
    });
  }
  if (peer.length && !state.peerQueryBlocked) {
    sets.push({
      label: 'Peer average',
      data: labels.map(function (label) { return peerMap[label] == null ? null : peerMap[label]; }),
      backgroundColor: '#6FBFB0',
      maxBarThickness: 22
    });
  }
  drawChart('chart-residence', {
    type: 'bar',
    data: { labels: labels, datasets: sets },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: sets.length > 1 }, ipedsMarks: { barEnds: true, format: 'count' } },
      scales: {
        x: { beginAtZero: true, ticks: { callback: function (v) { return formatCompactCount(v); } } },
        y: { ticks: { autoSkip: false, color: cssVar('--text'), font: { size: 12, family: 'Inter, Roboto, sans-serif' } } }
      },
      layout: { padding: { top: 8, right: 56, bottom: 4, left: 4 } }
    }
  });
  setDetailTable('chart-residence', overlayTableHtml(labels, [
    { label: 'Institution', values: labels.map(function (label) { return mineMap[label] == null ? null : mineMap[label]; }), format: 'count' },
    { label: 'Peer average', values: labels.map(function (label) { return peerMap[label] == null ? null : peerMap[label]; }), format: 'count' }
  ].filter(function (col) { return col.values.some(function (value) { return value != null; }); }), peerDefinitionLine()));
}

var ORIGIN_BORDERS = {
  AL: ['FL', 'GA', 'MS', 'TN'], AK: [], AZ: ['CA', 'CO', 'NV', 'NM', 'UT'],
  AR: ['LA', 'MO', 'MS', 'OK', 'TN', 'TX'], CA: ['AZ', 'NV', 'OR'],
  CO: ['AZ', 'KS', 'NE', 'NM', 'OK', 'UT', 'WY'], CT: ['MA', 'NY', 'RI'],
  DE: ['MD', 'NJ', 'PA'], DC: ['MD', 'VA'], FL: ['AL', 'GA'],
  GA: ['AL', 'FL', 'NC', 'SC', 'TN'], HI: [], ID: ['MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  IL: ['IN', 'IA', 'KY', 'MO', 'WI'], IN: ['IL', 'KY', 'MI', 'OH'],
  IA: ['IL', 'MN', 'MO', 'NE', 'SD', 'WI'], KS: ['CO', 'MO', 'NE', 'OK'],
  KY: ['IL', 'IN', 'MO', 'OH', 'TN', 'VA', 'WV'], LA: ['AR', 'MS', 'TX'],
  ME: ['NH'], MD: ['DE', 'DC', 'PA', 'VA', 'WV'], MA: ['CT', 'NH', 'NY', 'RI', 'VT'],
  MI: ['IN', 'OH', 'WI'], MN: ['IA', 'ND', 'SD', 'WI'], MS: ['AL', 'AR', 'LA', 'TN'],
  MO: ['AR', 'IL', 'IA', 'KS', 'KY', 'NE', 'OK', 'TN'], MT: ['ID', 'ND', 'SD', 'WY'],
  NE: ['CO', 'IA', 'KS', 'MO', 'SD', 'WY'], NV: ['AZ', 'CA', 'ID', 'OR', 'UT'],
  NH: ['ME', 'MA', 'VT'], NJ: ['DE', 'NY', 'PA'], NM: ['AZ', 'CO', 'OK', 'TX', 'UT'],
  NY: ['CT', 'MA', 'NJ', 'PA', 'VT'], NC: ['GA', 'SC', 'TN', 'VA'], ND: ['MN', 'MT', 'SD'],
  OH: ['IN', 'KY', 'MI', 'PA', 'WV'], OK: ['AR', 'CO', 'KS', 'MO', 'NM', 'TX'],
  OR: ['CA', 'ID', 'NV', 'WA'], PA: ['DE', 'MD', 'NJ', 'NY', 'OH', 'WV'],
  RI: ['CT', 'MA'], SC: ['GA', 'NC'], SD: ['IA', 'MN', 'MT', 'NE', 'ND', 'WY'],
  TN: ['AL', 'AR', 'GA', 'KY', 'MO', 'MS', 'NC', 'VA'], TX: ['AR', 'LA', 'NM', 'OK'],
  UT: ['AZ', 'CO', 'ID', 'NV', 'NM', 'WY'], VT: ['MA', 'NH', 'NY'],
  VA: ['DC', 'KY', 'MD', 'NC', 'TN', 'WV'], WA: ['ID', 'OR'],
  WV: ['KY', 'MD', 'OH', 'PA', 'VA'], WI: ['IL', 'IA', 'MI', 'MN'],
  WY: ['CO', 'ID', 'MT', 'NE', 'SD', 'UT']
};

var ORIGIN_CODE_NAME = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
  LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
};

var oosMapTemplate = null;
var oosMapLoad = null;
var oosMapSerial = 0;

function originStateCode(label) {
  var raw = str(label).trim();
  if (!raw) return '';
  var upper = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (upper === 'DC' || ORIGIN_BORDERS[upper]) {
    if (ORIGIN_CODE_NAME[upper]) return upper;
  }
  if (upper.length === 2 && ORIGIN_CODE_NAME[upper]) return upper;
  var lower = raw.toLowerCase();
  var codes = Object.keys(ORIGIN_CODE_NAME);
  var i;
  for (i = 0; i < codes.length; i++) {
    if (ORIGIN_CODE_NAME[codes[i]].toLowerCase() === lower) return codes[i];
  }
  return '';
}

function originRingLabel(ring) {
  if (ring === 'Home') return 'Home state';
  if (ring === 'Border') return 'Borders home';
  if (ring === 'Outside') return 'Farther';
  return ring || '';
}

function originRing(home, dest) {
  if (!dest) return '';
  if (!home || home === dest) return home === dest ? 'Home' : 'Outside';
  var neighbors = ORIGIN_BORDERS[home] || [];
  return neighbors.indexOf(dest) >= 0 ? 'Border' : 'Outside';
}

function paintOosMessage(kind, text) {
  var kpis = $('oos-kpis');
  var map = $('oos-map');
  var states = $('oos-states');
  var schools = $('oos-schools');
  var lead = $('oos-map-lead');
  var legend = $('oos-legend');
  var meta = $('oos-state-meta');
  var title = $('oos-map-title');
  if (title) title.textContent = 'Where students from the home state enroll';
  if (lead) lead.textContent = kind === 'loading' ? '' : (text || '');
  if (legend) legend.innerHTML = '';
  if (meta) meta.textContent = '';
  if (kpis) kpis.innerHTML = '';
  oosMapSerial += 1;
  var body = kind === 'loading'
    ? loadingDotsMarkup('Loading')
    : '<p class="oos-note">' + escapeHtml(text || '') + '</p>';
  if (map) map.innerHTML = body;
  if (states) states.innerHTML = kind === 'loading' ? loadingDotsMarkup('Loading') : '';
  if (schools) schools.innerHTML = kind === 'loading' ? loadingDotsMarkup('Loading') : '';
  var schoolTitle = $('oos-schools-title');
  if (schoolTitle) schoolTitle.textContent = 'Schools';
  detailStore['oos-reach'] = { title: 'Where students from the home state enroll', subtitle: text || '', empty: text || 'No migration data.' };
}

function originShareText(part, total) {
  if (!total) return '—';
  return (part / total * 100).toFixed(1) + '%';
}

function buildOriginModel(rows) {
  var home = originStateCode(state.originState);
  var byCode = {};
  var total = 0;
  (rows || []).forEach(function (row) {
    var count = num(row.N) || 0;
    if (!count) return;
    var code = originStateCode(row.STABBR_VALUE || row.STABBR);
    if (!code) return;
    total += count;
    if (!byCode[code]) {
      byCode[code] = {
        code: code,
        name: ORIGIN_CODE_NAME[code] || code,
        students: 0,
        schools: {}
      };
    }
    byCode[code].students += count;
    var school = str(row.INSTNM) || 'Unknown institution';
    byCode[code].schools[school] = (byCode[code].schools[school] || 0) + count;
  });
  var states = Object.keys(byCode).map(function (code) {
    var item = byCode[code];
    var schoolList = Object.keys(item.schools).map(function (name) {
      return { name: name, n: item.schools[name] };
    }).sort(function (a, b) { return b.n - a.n; });
    return {
      code: item.code,
      name: item.name,
      students: item.students,
      ring: originRing(home, item.code),
      schools: schoolList
    };
  });
  var ringRank = { Home: 0, Border: 1, Outside: 2 };
  states.sort(function (a, b) {
    var ring = (ringRank[a.ring] || 9) - (ringRank[b.ring] || 9);
    if (ring) return ring;
    return b.students - a.students;
  });
  var homeStudents = 0;
  var outsideStudents = 0;
  var distantStates = 0;
  states.forEach(function (item) {
    if (item.ring === 'Home') homeStudents += item.students;
    if (item.ring === 'Outside') {
      outsideStudents += item.students;
      distantStates += 1;
    }
  });
  return {
    home: home,
    homeName: home ? (ORIGIN_CODE_NAME[home] || state.originState) : state.originState,
    total: total,
    states: states,
    homeStudents: homeStudents,
    outsideStudents: outsideStudents,
    distantStates: distantStates
  };
}

function oosShareFill(shareOfMax) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  var from = dark ? [60, 60, 68] : [232, 230, 224];
  var to = dark ? [244, 244, 241] : [24, 24, 26];
  var amt = Math.max(0.18, Math.min(1, shareOfMax));
  return 'rgb(' +
    Math.round(from[0] + (to[0] - from[0]) * amt) + ',' +
    Math.round(from[1] + (to[1] - from[1]) * amt) + ',' +
    Math.round(from[2] + (to[2] - from[2]) * amt) + ')';
}

function oosStateCodeFromClass(el) {
  var classes = (el.getAttribute('class') || '').split(/\s+/);
  var i;
  for (i = 0; i < classes.length; i++) {
    var code = classes[i].toUpperCase();
    if (ORIGIN_CODE_NAME[code]) return code;
  }
  return '';
}

function loadOosMapTemplate() {
  if (oosMapTemplate) return Promise.resolve(oosMapTemplate);
  if (oosMapLoad) return oosMapLoad;
  oosMapLoad = fetch('us-states.svg').then(function (res) {
    if (!res.ok) throw new Error('The state map did not load.');
    return res.text();
  }).then(function (text) {
    var doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    var svg = doc.documentElement;
    if (!svg || String(svg.nodeName).toLowerCase() !== 'svg') throw new Error('The state map did not load.');
    svg.setAttribute('class', 'us-map-svg');
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'United States');
    var style = svg.querySelector('style');
    if (style && style.parentNode) style.parentNode.removeChild(style);
    Array.prototype.forEach.call(svg.querySelectorAll('path, circle'), function (el) {
      var parentClass = el.parentNode && el.parentNode.getAttribute('class');
      if (parentClass === 'borders') {
        el.setAttribute('class', 'us-border');
        return;
      }
      var code = oosStateCodeFromClass(el);
      if (!code) return;
      el.setAttribute('data-oos-state', code);
      el.setAttribute('class', 'us-shape');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    });
    oosMapTemplate = svg;
    return svg;
  });
  return oosMapLoad;
}

function paintOosCountryMap(model, byCode, maxDest) {
  var map = $('oos-map');
  if (!map) return;
  var serial = ++oosMapSerial;
  var hostNow = $('oos-map');
  if (hostNow && !hostNow.querySelector('.us-map-svg')) hostNow.innerHTML = loadingDotsMarkup('Loading');
  loadOosMapTemplate().then(function (svg) {
    if (serial !== oosMapSerial) return;
    var host = $('oos-map');
    if (!host) return;
    if (!host.querySelector('.us-map-svg')) {
      host.innerHTML = '';
      host.appendChild(svg.cloneNode(true));
    }
    var root = host.querySelector('.us-map-svg');
    Array.prototype.forEach.call(root.querySelectorAll('[data-oos-state]'), function (shape) {
      var code = shape.getAttribute('data-oos-state');
      var item = byCode[code];
      var ring = item ? item.ring : originRing(model.home, code);
      var cls = 'us-shape';
      shape.style.removeProperty('fill');
      if (ring === 'Home') cls += ' is-home';
      else if (item && item.students && maxDest) {
        cls += ' is-volume';
        shape.style.fill = oosShareFill(Math.sqrt(item.students / maxDest));
      } else cls += ' is-empty';
      if (ring === 'Border') cls += ' is-border';
      if (state.oosFocus === code) cls += ' is-selected';
      shape.setAttribute('class', cls);
      shape.setAttribute('aria-pressed', state.oosFocus === code ? 'true' : 'false');
      var label = (ORIGIN_CODE_NAME[code] || code);
      if (item && item.students) label += ', ' + formatCompactCount(item.students) + ' students, ' + originShareText(item.students, model.total);
      else label += ', no students in this file';
      shape.setAttribute('aria-label', label);
      var title = shape.querySelector('title');
      if (title) title.textContent = label;
      if (state.oosFocus === code) root.appendChild(shape);
    });
  }).catch(function () {
    if (serial !== oosMapSerial) return;
    var host = $('oos-map');
    if (host) host.innerHTML = '<p class="oos-note">The state map did not load.</p>';
  });
}

function renderOrigin(rows) {
  if (!$('oos-board')) return;
  if (!state.originState) {
    if (rows == null && state.institution && state.connected.migration) {
      paintOosMessage('loading', 'Loading the home state.');
      return;
    }
    paintOosMessage('empty', ORIGIN_PICK_STATE_MSG);
    return;
  }
  if (state.oosError) {
    paintOosMessage('error', state.oosError);
    return;
  }
  if (rows == null) {
    paintOosMessage('loading', 'Loading migration for ' + state.originState + '.');
    return;
  }
  if (!rows.length) {
    paintOosMessage('empty', 'No migration data for ' + state.originState + '.');
    return;
  }
  var model = buildOriginModel(rows);
  if (!model.states.length) {
    paintOosMessage('empty', 'No state codes are available for ' + state.originState + '.');
    return;
  }
  var byCode = {};
  model.states.forEach(function (item) { byCode[item.code] = item; });
  if (state.oosFocus && !byCode[state.oosFocus]) state.oosFocus = '';

  var kpis = $('oos-kpis');
  if (kpis) {
    var cards = [
      [formatCompactCount(model.total), 'Students from ' + model.homeName],
      [originShareText(model.homeStudents, model.total), 'Enrolled in the home state'],
      [formatCompactCount(model.outsideStudents), 'Outside the home state and its borders'],
      [String(model.distantStates), 'Distant states with students']
    ];
    kpis.innerHTML = cards.map(function (card) {
      return '<article class="oos-kpi"><p class="oos-kpi-value">' + escapeHtml(card[0]) + '</p><p class="oos-kpi-label">' + escapeHtml(card[1]) + '</p></article>';
    }).join('');
  }

  var mapTitle = $('oos-map-title');
  if (mapTitle) mapTitle.textContent = 'Where students from ' + model.homeName + ' enroll';
  var lead = $('oos-map-lead');
  var destCounts = model.states.filter(function (item) { return item.ring !== 'Home' && item.students; });
  var maxDest = 0;
  var minDest = 0;
  destCounts.forEach(function (item) {
    maxDest = Math.max(maxDest, item.students);
    minDest = minDest ? Math.min(minDest, item.students) : item.students;
  });
  if (lead) lead.textContent = 'Yellow is the home state. Darker states enrolled more of these students. A teal outline marks a bordering state. Click a state to list its schools.';
  var legend = $('oos-legend');
  if (legend) {
    legend.innerHTML = '<span class="oos-key"><span class="oos-swatch oos-swatch--home"></span> Home state</span>' +
      (maxDest
        ? '<span class="oos-key"><span class="oos-scale-label">' + escapeHtml(formatCompactCount(minDest)) + '</span><span class="oos-scale-bar" aria-hidden="true"></span><span class="oos-scale-label">' + escapeHtml(formatCompactCount(maxDest)) + '</span> Students</span>'
        : '') +
      '<span class="oos-key"><span class="oos-ring" aria-hidden="true"></span> Borders home</span>';
  }
  paintOosCountryMap(model, byCode, maxDest);

  var meta = $('oos-state-meta');
  if (meta) meta.textContent = model.states.length + (model.states.length === 1 ? ' state' : ' states');
  var statesHost = $('oos-states');
  if (statesHost) {
    var body = model.states.map(function (item) {
      var mark = state.oosFocus === item.code ? ' is-selected' : '';
      return '<tr data-oos-state="' + item.code + '" class="' + mark.trim() + '">' +
        '<td>' + escapeHtml(item.name) + '</td>' +
        '<td>' + escapeHtml(originRingLabel(item.ring)) + '</td>' +
        '<td class="num">' + escapeHtml(formatCompactCount(item.students)) + '</td>' +
        '<td class="num">' + escapeHtml(originShareText(item.students, model.total)) + '</td></tr>';
    }).join('');
    statesHost.innerHTML = '<table class="oos-table"><thead><tr><th>State</th><th>To home</th><th class="num">Students</th><th class="num">Share</th></tr></thead><tbody>' +
      body + '</tbody></table>';
  }

  var focus = state.oosFocus ? byCode[state.oosFocus] : null;
  var schoolRows = [];
  if (focus) schoolRows = focus.schools.slice(0, 12);
  else {
    model.states.forEach(function (item) {
      item.schools.forEach(function (school) {
        schoolRows.push({ name: school.name, n: school.n, state: item.name });
      });
    });
    schoolRows.sort(function (a, b) { return b.n - a.n; });
    schoolRows = schoolRows.slice(0, 12);
  }
  var schoolTitle = $('oos-schools-title');
  if (schoolTitle) {
    var sameState = focus && model.home && focus.code === model.home;
    schoolTitle.textContent = focus
      ? (sameState ? ('Schools in ' + focus.name) : ('Schools in ' + focus.name + ' enrolling students from ' + model.homeName))
      : ('Schools enrolling students from ' + model.homeName);
  }
  var schoolsHost = $('oos-schools');
  if (schoolsHost) {
    if (!schoolRows.length) {
      schoolsHost.innerHTML = '<p class="oos-note">No schools in this state for this survey year.</p>';
    } else {
      var maxSchool = schoolRows[0].n || 1;
      schoolsHost.innerHTML = schoolRows.map(function (school) {
        var mine = state.institution && school.name === state.institution;
        var width = Math.max(4, (school.n / maxSchool) * 100);
        return '<div class="oos-school">' +
          '<span class="oos-school-name">' + escapeHtml(school.name) + (mine ? ' <span class="oos-school-tag">Selected</span>' : '') + (school.state && !focus ? '<span class="oos-school-state">' + escapeHtml(school.state) + '</span>' : '') + '</span>' +
          '<span class="oos-school-track"><span class="oos-school-fill' + (mine ? ' is-inst' : '') + '" style="width:' + width.toFixed(1) + '%"></span></span>' +
          '<span class="oos-school-n">' + escapeHtml(formatCompactCount(school.n)) + '</span></div>';
      }).join('') +
        '<p class="oos-note">' + (focus ? 'Click the state again to see every destination.' : 'Selected marks the chosen institution when it enrolled students from this state. Click a state on the map or in the table to narrow this list.') + '</p>';
    }
  }

  var detailRows = '';
  model.states.forEach(function (item) {
    item.schools.forEach(function (school) {
      detailRows += '<tr><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(originRingLabel(item.ring)) + '</td><td>' +
        escapeHtml(school.name) + '</td><td class="num">' + escapeHtml(Math.round(school.n).toLocaleString()) + '</td><td class="num">' +
        escapeHtml(originShareText(school.n, model.total)) + '</td></tr>';
    });
  });
  detailStore['oos-reach'] = {
    title: 'Where students from the home state enroll',
    subtitle: 'Every student from ' + model.homeName + ' in survey year ' + (state.year || 'all years') + ', enrolled at any school. This is not the selected institution’s roster.',
    tableHtml: '<table class="preview-table"><thead><tr><th>State</th><th>To home</th><th>Institution</th><th>Students</th><th>Share</th></tr></thead><tbody>' +
      detailRows + '</tbody></table>'
  };
}

function destroyChartsInView(viewName) {
  var view = $('view-' + viewName);
  if (!view) return;
  view.querySelectorAll('canvas').forEach(function (canvas) {
    if (canvas.id) destroyChart(canvas.id);
  });
}

function showMigrationPlaceholders() {
  if (state.institution) {
    showChartLoading('chart-residence');
  } else {
    showEmpty('chart-residence', trendMessage());
  }
  renderOrigin(null);
}

function renderMigrationBlock() {
  var cache = state.paintCache;
  if (!cache) return;
  renderResidence(cache.residenceMine, cache.residencePeer);
  renderOrigin(cache.originRows);
}

function dashboardDataPages(opts) {
  if (opts && opts.allDataPages) return ['admissions', 'advancement', 'keymetrics'];
  if (isDashboardDataPage(state.page)) return [state.page];
  return [];
}

function renderPageCharts(page, cache, scope, opts) {
  var peers = cache.peerAggregates || [];
  var peerRows = cache.peerInstitutionRows || [];
  var preserveOther = !!(opts.preserveOther || opts.allDataPages);
  if (page === 'advancement') {
    if (scope === 'all' && !preserveOther) destroyChartsInView('admissions');
    renderAdvancement(cache.mine, peers, peerRows, scope);
    if (scope === 'all' || scope === 'institution' || scope === 'peer' || scope === 'top') {
      updateAdvancementKpiStrip(cache.mine, cache.peerAggregates);
    }
  } else if (page === 'keymetrics') {
    if (scope === 'all' && !preserveOther) {
      destroyChartsInView('admissions');
      destroyChartsInView('advancement');
    }
    renderKeyMetrics(cache.mine, peers);
  } else if (page === 'admissions') {
    if (scope === 'all' && !preserveOther) destroyChartsInView('advancement');
    renderAdmissions(cache.mine, peers, peerRows, scope);
    if (scope === 'all') {
      if (!opts.coreOnly) renderMigrationBlock();
      else showMigrationPlaceholders();
    }
  }
  state.pageSerial[page] = state.paintSerial;
}

function renderPaintedCharts(opts) {
  opts = opts || {};
  var cache = state.paintCache;
  if (!cache) return;
  var pages = dashboardDataPages(opts);
  if (!pages.length) return;
  var scope = opts.scope || 'all';
  var paintOpts = {
    preserveOther: opts.preserveOther,
    allDataPages: opts.allDataPages,
    coreOnly: opts.coreOnly
  };
  if (opts.allDataPages) paintOpts.preserveOther = true;
  pages.forEach(function (page) {
    renderPageCharts(page, cache, scope, paintOpts);
  });
  document.querySelectorAll('.box-subtitle').forEach(function (node) {
    if (node.textContent === 'Select an institution' && state.institution) node.textContent = state.institution;
  });
  syncComparisonChartSubtitles();
  syncSectionFootnotes();
  updatePeerBanner();
  if (openDetailId) refreshDetailView(openDetailId);
  syncReportButton();
  requestAnimationFrame(function () { resizeChartsInView(state.page); });
}

function paintCore(mine, peerAggregates, peerInstitutionRows) {
  state.paintSerial += 1;
  state.paintCache = {
    mine: mine,
    peerAggregates: peerAggregates || [],
    peerInstitutionRows: peerInstitutionRows || [],
    residenceMine: [],
    residencePeer: [],
    originRows: null,
    migrationReady: !state.connected.migration
  };
  renderPaintedCharts({ coreOnly: state.connected.migration, allDataPages: true });
}

function applyMigrationData(residenceMine, residencePeer) {
  if (!state.paintCache) return;
  state.paintCache.residenceMine = residenceMine || [];
  state.paintCache.residencePeer = residencePeer || [];
  state.paintCache.migrationReady = true;
  renderMigrationBlock();
}

function applyOriginData(originRows) {
  if (!state.paintCache) return;
  state.paintCache.originRows = originRows || [];
  renderOrigin(state.paintCache.originRows);
}

function runMigrationWave(sample, gen) {
  if (!state.connected.migration || !sample) {
    state.migrationError = '';
    state.residenceInstError = '';
    state.residencePeerError = '';
    applyMigrationData([], []);
    return Promise.resolve();
  }
  return loadResidence(sample).then(function (res) {
    if (gen !== state.refreshGen) return;
    state.residenceInstError = res.instError || '';
    state.residencePeerError = res.peerError || '';
    state.migrationError = [state.residenceInstError, state.residencePeerError].filter(Boolean).join(' · ');
    applyMigrationData(res.mine, res.peer);
    syncDataBanner();
    return loadOriginStateOptions().then(function () {
      if (gen !== state.refreshGen) return;
      syncOriginToInstitution(sample, false);
      refreshOriginMenu();
      if (!state.originState) {
        applyOriginData(null);
        return;
      }
      return loadOrigin().then(function (originRows) {
        if (gen !== state.refreshGen) return;
        applyOriginData(originRows);
      });
    });
  }).catch(function (err) {
    if (gen !== state.refreshGen) return;
    state.migrationError = domoErrorMessage(err) || 'Migration queries failed.';
    state.residenceInstError = state.migrationError;
    state.residencePeerError = '';
    applyMigrationData([], []);
    syncDataBanner();
  });
}

function paint(mine, peerAggregates, peerInstitutionRows, residenceMine, residencePeer, originRows) {
  state.paintSerial += 1;
  state.paintCache = {
    mine: mine,
    peerAggregates: peerAggregates || [],
    peerInstitutionRows: peerInstitutionRows || [],
    residenceMine: residenceMine,
    residencePeer: residencePeer,
    originRows: originRows,
    migrationReady: true
  };
  renderPaintedCharts({ allDataPages: true });
}

function loadInstitutionRows() {
  if (!state.connected.ipeds || !state.institution) return Promise.resolve([]);
  var where = "INSTNM = '" + escapeSql(state.institution) + "'";
  var sql = 'SELECT ' + metricColumns() + ' FROM ' + CONFIG.ipedsAlias + ' WHERE ' + where + ' ORDER BY SURVEY_YEAR';
  return withTimeout(sqlQuery(CONFIG.ipedsAlias, sql), CONFIG.queryTimeoutMs, 'Institution').then(prepare);
}

function loadInstitutionSample() {
  if (!state.connected.ipeds || !state.institution) return Promise.resolve(null);
  var sql = 'SELECT ' + metricColumns() + ' FROM ' + CONFIG.ipedsAlias +
    " WHERE INSTNM = '" + escapeSql(state.institution) + "' ORDER BY SURVEY_YEAR DESC LIMIT 1";
  return withTimeout(sqlQuery(CONFIG.ipedsAlias, sql), CONFIG.queryTimeoutMs, 'Institution sample').then(function (rows) {
    var prepared = prepare(rows);
    return prepared[0] || null;
  });
}

function loadPeerAggregates(sample, mineRows) {
  if (!state.connected.ipeds) return Promise.resolve([]);
  try {
    var scaleResult = resolvePeerRateScales(mineRows || []);
    if (scaleResult.mixed && scaleResult.mixed.length) {
      state.peerError = 'Rate columns use mixed scales (' + scaleResult.mixed.join(', ') + '). Peer comparison may be approximate.';
    }
  } catch (err) {
    state.peerError = domoErrorMessage(err) || err.message || 'Could not align peer rate scales.';
  }
  var sql = buildPeerAggregateSql(sample, mineRows);
  if (!sql) return Promise.resolve([]);
  return withTimeout(sqlQuery(CONFIG.ipedsAlias, sql), CONFIG.queryTimeoutMs, 'Comparison aggregates')
    .then(normalizePeerAggregateRows);
}

function loadPeerInstitutionRows(sample, mineRows) {
  if (state.peerQueryBlocked) return Promise.resolve([]);
  var where = peerWhereIpedsResolved();
  if (!state.connected.ipeds || !where) return Promise.resolve([]);
  var apps = field('applications');
  var endow = field('endowment');
  var giving = field('giving');
  var opex = field('opex');
  var phil = field('philanthropic') || giving;
  var cols = ['INSTNM', 'SURVEY_YEAR'];
  [apps, field('admissions'), field('enrollment'), field('admitRate'), field('yieldRate') || 'YIELD_RATE', endow, giving, field('fte'), opex, phil].forEach(function (col) {
    if (col && cols.indexOf(col) === -1 && hasColumn(col)) cols.push(col);
  });
  if (hasColumn('ENDOWMENT_PER_FTE') && cols.indexOf('ENDOWMENT_PER_FTE') === -1) cols.push('ENDOWMENT_PER_FTE');
  var years = unionSurveyYears(mineRows || [], (state.paintCache && state.paintCache.peerAggregates) || []);
  if (!years.length && state.year) years = [String(state.year)];
  var yearClause = '';
  if (years.length === 1) yearClause = " AND SURVEY_YEAR = '" + escapeSql(years[0]) + "'";
  else if (years.length > 1) {
    yearClause = ' AND SURVEY_YEAR IN (' + years.map(function (y) { return "'" + escapeSql(y) + "'"; }).join(', ') + ')';
  }
  var order = apps ? ' ORDER BY SURVEY_YEAR, ' + apps + ' DESC' : ' ORDER BY SURVEY_YEAR, INSTNM';
  var sql = 'SELECT ' + cols.join(', ') + ' FROM ' + CONFIG.ipedsAlias + ' WHERE ' + where + yearClause + order;
  return withTimeout(sqlQuery(CONFIG.ipedsAlias, sql), CONFIG.queryTimeoutMs, 'Comparison institutions').then(function (rows) {
    var prepared = prepare(rows || []);
    return prepared;
  });
}

function residenceSql(whereCore, opts) {
  var where = migrationWhereClause(whereCore);
  return 'SELECT ' + residenceSelectList() + ' FROM ' + CONFIG.migrationAlias +
    ' WHERE ' + where + migrationYearClause(opts);
}

function migrationResidenceSqlAttempts(whereCore) {
  var where = migrationWhereClause(whereCore);
  if (!where) return [];
  var attempts = [
    residenceSql(whereCore, {}),
    residenceSql(whereCore, { skipYear: true })
  ];
  var seen = {};
  return attempts.filter(function (sql) {
    if (seen[sql]) return false;
    seen[sql] = true;
    return true;
  });
}

function queryResidenceRows(whereCore) {
  var attempts = migrationResidenceSqlAttempts(whereCore);
  if (!attempts.length) return Promise.reject(new Error('Migration residence filters are incomplete.'));
  var lastErr = null;
  function tryAt(index) {
    if (index >= attempts.length) {
      return Promise.reject(lastErr || new Error('Migration residence query failed.'));
    }
    return sqlQuery(CONFIG.migrationAlias, attempts[index]).catch(function (err) {
      lastErr = err;
      return tryAt(index + 1);
    });
  }
  return tryAt(0);
}

function loadResidence(sample) {
  if (!state.connected.migration) {
    return Promise.resolve({ mine: [], peer: [], instError: '', peerError: '' });
  }
  if (!migrationResidenceCountColumn()) {
    var missingCol = 'Migration view is missing EFRES01 (residence student count).';
    return Promise.resolve({ mine: [], peer: [], instError: missingCol, peerError: missingCol });
  }
  function wrapQuery(promise, fallbackMsg) {
    return promise.then(function (rows) {
      return { rows: prepare(rows), error: '' };
    }).catch(function (err) {
      var detail = domoErrorMessage(err) || fallbackMsg;
      return { rows: [], error: detail };
    });
  }
  var instCore = migrationInstitutionWhere();
  var instPromise = state.institution
    ? (instCore
      ? wrapQuery(queryResidenceRows(instCore), 'Institution residence query failed.')
      : Promise.resolve({
        rows: [],
        error: 'Migration view has no institution column (expected INSTNM or MYINSTNAME).'
      }))
    : Promise.resolve({ rows: [], error: '' });
  var where = peerWhereMigrationResolved();
  var peerPromise = where && !state.peerQueryBlocked
    ? wrapQuery(queryResidenceRows(where), 'Peer residence query failed.')
    : Promise.resolve({ rows: [], error: '' });
  return Promise.all([instPromise, peerPromise]).then(function (parts) {
    return {
      mine: parts[0].rows,
      peer: parts[1].rows,
      instError: parts[0].error,
      peerError: parts[1].error
    };
  });
}

function matchOriginOption(home) {
  var raw = str(home).trim();
  if (!raw) return '';
  var options = state.options.originStates || [];
  var want = raw.toLowerCase();
  var i;
  for (i = 0; i < options.length; i++) {
    if (str(options[i]).toLowerCase() === want) return options[i];
  }
  var code = originStateCode(raw);
  if (code) {
    for (i = 0; i < options.length; i++) {
      if (originStateCode(options[i]) === code) return options[i];
    }
  }
  if (!options.length && code) return ORIGIN_CODE_NAME[code] || code;
  return '';
}

function syncOriginToInstitution(sample, loadNow) {
  if (!sample || !state.institution) return;
  if (state.originPinned && state.originInstitution === state.institution && state.originState) return;
  var home = str(sample.STABBR_VALUE) || str(sample.STABBR);
  var matched = matchOriginOption(home);
  state.originInstitution = state.institution;
  if (!matched || matched === state.originState) return;
  state.oosFocus = '';
  state.originState = matched;
  state.draft.origin = [matched];
  refreshOriginMenu();
  if (loadNow && state.connected.migration) {
    paintOosMessage('loading', 'Loading migration for ' + matched + '.');
    loadOrigin().then(function (rows) { applyOriginData(rows); });
  }
}

function loadOriginStateOptions() {
  var col = migrationOriginColumn();
  if (!state.connected.migration || !col) {
    state.options.originStates = [];
    return Promise.resolve();
  }
  return withTimeout(
    sqlQuery(CONFIG.migrationAlias, distinctSql(col, CONFIG.migrationAlias)),
    CONFIG.queryTimeoutMs,
    'Origin states'
  ).then(function (rows) {
    state.options.originStates = sortValues(
      rows.map(function (row) { return distinctRowValue(row, col); }).filter(Boolean),
      false
    );
  }).catch(function () {
    state.options.originStates = state.options.originStates || [];
  });
}

function loadOrigin() {
  if (!state.connected.migration || !state.originState) return Promise.resolve([]);
  var labelCol = migrationOriginColumn();
  if (!labelCol) return Promise.resolve([]);
  var countCol = migrationResidenceCountColumn();
  if (!countCol) return Promise.resolve([]);
  var groupCols = ['INSTNM', 'STABBR_VALUE', 'STABBR'].filter(function (col) { return migrationHasColumn(col); });
  if (!groupCols.length) groupCols = ['INSTNM'].filter(function (col) { return migrationHasColumn(col); });
  if (!groupCols.length) return Promise.resolve([]);
  var originCore = labelCol + " = '" + escapeSql(state.originState) + "'";
  var where = migrationWhereClause(originCore);
  var sql = 'SELECT ' + groupCols.join(', ') + ', SUM(' + countCol + ') AS N FROM ' + CONFIG.migrationAlias +
    ' WHERE ' + where + migrationYearClause({}) +
    ' GROUP BY ' + groupCols.join(', ') + ' ORDER BY N DESC';
  return sqlQuery(CONFIG.migrationAlias, sql).then(function (rows) {
    state.oosError = '';
    return prepare(rows);
  }).catch(function (err) {
    state.oosError = domoErrorMessage(err) || 'Out-of-state query failed.';
    syncDataBanner();
    return [];
  });
}

function resetPaintCacheForRefresh() {
  var prev = state.paintCache;
  state.paintCache = {
    mine: [],
    peerAggregates: [],
    peerInstitutionRows: [],
    residenceMine: [],
    residencePeer: [],
    originRows: prev ? prev.originRows : null,
    migrationReady: false
  };
}

function refresh() {
  var gen = ++state.refreshGen;
  state.paintSerial += 1;
  $('header-status').textContent = 'Updating';
  if (!state.connected.ipeds || !state.institution) {
    state.peerQueryBlocked = false;
    state.peerCtxIpeds = null;
    state.peerCtxMigration = null;
    state.peerError = '';
    paint([], [], [], [], [], []);
    $('header-status').textContent = sourceStatusText(state.connected.ipeds ? '' : 'Source: IPEDS · awaiting datasets');
    if (!state.institution && state.connected.ipeds) setBanner('');
    return Promise.resolve();
  }
  beginDashboardChartLoadingWave();
  resetPaintCacheForRefresh();
  state.peerInstitutionRowsPending = true;
  return loadInstitutionRows().then(function (mine) {
    if (gen !== state.refreshGen) return;
    var sample = mine && mine.length ? mine[mine.length - 1] : null;
    if (state.peerAnchorInstitution && state.peerAnchorInstitution !== state.institution) {
      clearComparisonFilters();
      state.originPinned = false;
    }
    syncOriginToInstitution(sample, false);
    state.peerAnchorInstitution = state.institution;
    state.peerError = '';
    state.top10Error = '';
    state.migrationError = '';
    state.residenceInstError = '';
    state.residencePeerError = '';
    state.oosError = '';
    state.paintCache.mine = mine;
    renderPaintedCharts({ scope: 'institution', coreOnly: true, allDataPages: true });
    return resolvePeerContexts(sample).catch(function (err) {
      state.peerError = domoErrorMessage(err) || err.message || 'Comparison group setup failed.';
      state.peerQueryBlocked = true;
      state.peerCtxMigration = blockedMigrationPeerContext();
    }).then(function () {
      if (gen !== state.refreshGen) return;
      var peerAggPromise = state.peerQueryBlocked
        ? Promise.resolve([])
        : loadPeerAggregates(sample, mine).catch(function (err) {
          state.peerError = domoErrorMessage(err) || 'Comparison aggregate query failed.';
          return [];
        });
      var peerListLoadStart = typeof performance !== 'undefined' ? performance.now() : 0;
      var peerListPromise = state.peerQueryBlocked
        ? Promise.resolve([])
        : loadPeerInstitutionRows(sample, mine).catch(function (err) {
          state.top10Error = domoErrorMessage(err) || 'Comparison institutions query failed.';
          return [];
        });
      peerAggPromise.then(function (peers) {
        if (gen !== state.refreshGen) return;
        state.paintCache.peerAggregates = peers || [];
        renderPaintedCharts({ scope: 'peer', coreOnly: true, allDataPages: true });
      });
      peerListPromise.then(function (peerRows) {
        if (gen !== state.refreshGen) return;
        state.paintCache.peerInstitutionRows = peerRows || [];
        var ms = typeof performance !== 'undefined' ? Math.round(performance.now() - peerListLoadStart) : 0;
        state.peerInstitutionRowsLoaded = peerRows ? peerRows.length : 0;
        if (typeof console !== 'undefined' && console.log) {
          console.log('[IPEDS Insights] Comparison institution rows loaded: ' + state.peerInstitutionRowsLoaded + ' in ' + ms + ' ms');
        }
        state.peerInstitutionRowsPending = false;
        renderPaintedCharts({ scope: 'top', coreOnly: true, allDataPages: true });
        if (advancementPeerListErrorMessage() && !(state.paintCache.peerInstitutionRows || []).length) {
          showAdvancementPeerDependentError('Peer data couldn\'t load: ' + advancementPeerListErrorMessage());
        }
      }).finally(function () {
        if (gen !== state.refreshGen) return;
        state.peerInstitutionRowsPending = false;
      });
      return Promise.all([peerAggPromise, peerListPromise]).then(function () {
        if (gen !== state.refreshGen) return;
        showMigrationPlaceholders();
        $('header-status').textContent = sourceStatusText(state.connected.ipeds ? '' : 'Source: IPEDS · awaiting datasets');
        syncDataBanner({ includeMigration: false });
        runMigrationWave(sample, gen);
      });
    });
  }).catch(function (err) {
    if (gen !== state.refreshGen) return;
    $('header-status').textContent = 'Query failed';
    $('header-status').classList.add('is-error');
    $('status-dot').classList.add('is-bad');
    var failMsg = err && err.message ? err.message : 'A dataset query failed.';
    setBanner(failMsg, 'error');
    failDashboardChartLoadingWave(failMsg);
    state.peerInstitutionRowsPending = false;
  });
}

function probeColumnSet(alias, columns) {
  if (!columns.length) return Promise.resolve([]);
  var sql = 'SELECT ' + columns.join(', ') + ' FROM ' + alias + ' LIMIT 1';
  return withTimeout(sqlQuery(alias, sql), 20000, alias).then(function () {
    return columns.slice();
  }).catch(function (err) {
    var detail = domoErrorMessage(err);
    if (columns.length === 1) return [];
    if (/not mapped|unknown dataset|does not exist|cannot find/i.test(detail) && columns.length > 4) {
      return Promise.reject(err);
    }
    var mid = Math.ceil(columns.length / 2);
    return Promise.all([
      probeColumnSet(alias, columns.slice(0, mid)),
      probeColumnSet(alias, columns.slice(mid))
    ]).then(function (parts) {
      return parts[0].concat(parts[1]);
    });
  });
}

function probeAlias(alias) {
  var columns = alias === CONFIG.migrationAlias ? MIGRATION_KNOWN_COLUMNS.slice() : KNOWN_COLUMNS.slice();
  return probeColumnSet(alias, columns).then(function (found) {
    if (!found.length) {
      return Promise.reject(new Error('Dataset alias "' + alias + '" is not mapped on this card.'));
    }
    var row = {};
    found.forEach(function (col) { row[col] = null; });
    return [row];
  });
}

function dimensionColumns() {
  var cols = [];
  visibleFilters().forEach(function (def) {
    if (cols.indexOf(def.column) === -1) cols.push(def.column);
  });
  return cols;
}

function rememberFallbackOptions(key, column, rows, sortDesc) {
  setOptionsFromDistinctRows(key, column, rows, sortDesc);
}

function loadDistinctFallback() {
  var jobs = [];
  var seen = {};
  var skipColumns = { INSTNM: true, SURVEY_YEAR: true };
  var partCol = partitionColumn();
  if (partCol) skipColumns[partCol] = true;
  visibleFilters().forEach(function (def) {
    if (skipColumns[def.column]) return;
    if (seen[def.column]) return;
    seen[def.column] = true;
    jobs.push(sqlQuery(CONFIG.ipedsAlias, distinctSql(def.column)).then(function (rows) {
      rememberFallbackOptions(def.key, def.column, rows, def.sort === 'desc');
    }).catch(function () {
      state.options[def.key] = [];
    }));
  });
  return Promise.all(jobs);
}

function loadAllInstitutionNames() {
  return withTimeout(
    sqlQuery(CONFIG.ipedsAlias, distinctSql('INSTNM')),
    CONFIG.institutionQueryTimeoutMs,
    'Institutions'
  ).then(function (rows) {
    setOptionsFromDistinctRows('institutions', 'INSTNM', rows, false);
  }).catch(function () {
    state.options.institutions = state.options.institutions || [];
  });
}

function loadAllSurveyYears() {
  return withTimeout(sqlQuery(CONFIG.ipedsAlias, distinctSql('SURVEY_YEAR')), CONFIG.queryTimeoutMs, 'Survey years').then(function (rows) {
    setOptionsFromDistinctRows('years', 'SURVEY_YEAR', rows, true);
  }).catch(function () {
    state.options.years = state.options.years || [];
  });
}

function loadPartitionOptions() {
  var candidates = PARTITION_COLUMNS.filter(function (col) { return state.columns.indexOf(col) !== -1; });
  if (!candidates.length) {
    state.options.partition = [];
    return Promise.resolve();
  }
  return Promise.all(candidates.map(function (col) {
    return withTimeout(sqlQuery(CONFIG.ipedsAlias, distinctSql(col)), CONFIG.queryTimeoutMs, col).then(function (rows) {
      return {
        col: col,
        values: rows.map(function (row) { return distinctRowValue(row, col); }).filter(Boolean)
      };
    }).catch(function () {
      return { col: col, values: [] };
    });
  })).then(function (results) {
    var best = results[0];
    var i;
    for (i = 1; i < results.length; i++) {
      if (results[i].values.length > best.values.length) best = results[i];
    }
    if (best.values.length) setPartitionColumn(best.col);
    else setPartitionColumn(candidates[0]);
    state.options.partition = sortValues(best.values, false);
  });
}

var institutionListBackgroundPromise = null;
var distinctFallbackPromise = null;
var filterLookupPromise = null;

function resolveDefaultInstitutionQuick() {
  if (state.didDefaultInstitution || (state.draft.institution || []).length) return Promise.resolve();
  var sql = 'SELECT INSTNM AS V FROM ' + CONFIG.ipedsAlias +
    " WHERE INSTNM LIKE '%High%Point%' GROUP BY INSTNM ORDER BY INSTNM LIMIT 20";
  return withTimeout(sqlQuery(CONFIG.ipedsAlias, sql), CONFIG.queryTimeoutMs, 'Default institution').then(function (rows) {
    var names = rows.map(function (row) { return distinctRowValue(row, 'INSTNM'); }).filter(Boolean);
    if (!names.length) return;
    state.options.institutions = state.options.institutions || [];
    names.forEach(function (n) {
      if (state.options.institutions.indexOf(n) === -1) state.options.institutions.push(n);
    });
    var pick = preferredInstitutionName(names);
    if (pick) {
      state.options.institutions = [pick].concat(
        state.options.institutions.filter(function (n) { return n !== pick; })
      );
    } else {
      state.options.institutions = sortValues(state.options.institutions, false);
    }
  }).catch(function () { /* full institution list loads in background */ });
}

function loadBootstrapFilterOptions() {
  return Promise.all([
    loadAllSurveyYears(),
    resolveDefaultInstitutionQuick()
  ]);
}

function loadFullInstitutionListBackground() {
  if (institutionListBackgroundPromise) return institutionListBackgroundPromise;
  institutionListBackgroundPromise = loadAllInstitutionNames().then(function () {
    mergeInstitutionsFromLookup();
    populateFilters();
    institutionListBackgroundPromise = null;
  }).catch(function () {
    institutionListBackgroundPromise = null;
  });
  return institutionListBackgroundPromise;
}

function scheduleDistinctFallbackLoad() {
  if (distinctFallbackPromise) return distinctFallbackPromise;
  distinctFallbackPromise = loadDistinctFallback().then(function () {
    if (state.options.state && state.options.state.length) {
      state.options.state = sortValues(state.options.state, false);
    }
    populateFilters();
    distinctFallbackPromise = null;
  }).catch(function () {
    distinctFallbackPromise = null;
  });
  return distinctFallbackPromise;
}

function loadCoreFilterOptions() {
  return loadBootstrapFilterOptions();
}

function ensureInstitutionOptions() {
  if (state.options.institutions && state.options.institutions.length) return Promise.resolve();
  if (institutionOptionsPromise) return institutionOptionsPromise;
  institutionOptionsPromise = loadAllInstitutionNames().then(function () {
    if (!state.options.institutions.length && state.lookup.length) {
      state.options.institutions = allInstitutionsFromLookup();
    }
    institutionOptionsPromise = null;
  }).catch(function () {
    if (state.lookup.length) state.options.institutions = allInstitutionsFromLookup();
    institutionOptionsPromise = null;
  });
  return institutionOptionsPromise;
}

var partitionOptionsPromise = null;
function ensurePartitionOptions() {
  if (state.options.partition && state.options.partition.length) return Promise.resolve();
  if (partitionOptionsPromise) return partitionOptionsPromise;
  partitionOptionsPromise = loadPartitionOptions().then(function () {
    if (!state.options.partition.length && state.lookup.length) {
      state.options.partition = allPartitionsFromLookup();
    }
    partitionOptionsPromise = null;
  }).catch(function () {
    if (state.lookup.length) state.options.partition = allPartitionsFromLookup();
    partitionOptionsPromise = null;
  });
  return partitionOptionsPromise;
}

var surveyYearOptionsPromise = null;
function ensureSurveyYearOptions() {
  if (state.options.years && state.options.years.length) return Promise.resolve();
  if (surveyYearOptionsPromise) return surveyYearOptionsPromise;
  surveyYearOptionsPromise = loadAllSurveyYears().then(function () {
    surveyYearOptionsPromise = null;
  }).catch(function () {
    surveyYearOptionsPromise = null;
  });
  return surveyYearOptionsPromise;
}

function loadOptions() {
  state.lookup = [];
  return loadBootstrapFilterOptions();
}

function loadLookupBackground(repopulate) {
  if (repopulate === undefined) repopulate = true;
  if (!state.connected.ipeds) return Promise.resolve();
  if (state.lookup.length) {
    if (repopulate) populateFilters();
    return Promise.resolve();
  }
  if (filterLookupPromise) {
    return filterLookupPromise.then(function () {
      if (repopulate) populateFilters();
    });
  }
  var cols = dimensionColumns();
  if (!cols.length) return Promise.resolve();
  var sql = 'SELECT ' + cols.join(', ') + ' FROM ' + CONFIG.ipedsAlias + ' GROUP BY ' + cols.join(', ');
  filterLookupPromise = withTimeout(sqlQuery(CONFIG.ipedsAlias, sql), CONFIG.lookupTimeoutMs, 'Filter combinations').then(function (rows) {
    state.lookup = rows;
    mergeInstitutionsFromLookup();
    if (!state.options.institutions.length) state.options.institutions = allInstitutionsFromLookup();
    if (!state.options.partition.length) {
      var fromLookup = allPartitionsFromLookup();
      if (fromLookup.length) state.options.partition = fromLookup;
    }
    filterLookupPromise = null;
    if (repopulate) populateFilters();
  }).catch(function () {
    filterLookupPromise = null;
    if (repopulate) populateFilters();
  });
  return filterLookupPromise;
}

function bindControls() {
  document.querySelectorAll('.page-tab').forEach(function (btn) {
    btn.addEventListener('click', function () { setPage(btn.getAttribute('data-page')); });
  });
  document.addEventListener('scroll', closeMenusOnOutsideScroll, true);
  document.addEventListener('click', function (event) {
    if (keepMenusOpen) {
      keepMenusOpen = false;
      return;
    }
    if (event.target.closest && event.target.closest('.multi-select')) return;
    closeMenus(null);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if ($('report-overlay') && !$('report-overlay').hidden) {
      closeReport();
      return;
    }
    if ($('section-overview-modal') && !$('section-overview-modal').hidden) {
      closeSectionOverview();
      return;
    }
    if (openDetailId) {
      closeDetail();
      return;
    }
    closeMenus(null);
  });
  document.addEventListener('click', function (event) {
    var apply = event.target.closest && event.target.closest('#btn-apply-filters');
    var reset = event.target.closest && event.target.closest('#btn-reset-filters');
    if (apply) applyDraft();
    if (reset) resetDraft();
  });
  document.body.addEventListener('click', function (event) {
    var faqTab = event.target.closest && event.target.closest('.faq-subtab[data-faq-panel]');
    if (faqTab) {
      setFaqPanel(faqTab.getAttribute('data-faq-panel'));
      return;
    }
    var overviewBtn = event.target.closest && event.target.closest('[data-section-overview]');
    if (overviewBtn) {
      openSectionOverview(overviewBtn.getAttribute('data-section-overview'));
      return;
    }
    if (event.target.closest && event.target.closest('#peer-context-toggle')) {
      setPeerCompare(state.peerCompareOn === false);
      return;
    }
    if (event.target.closest && event.target.closest('#peer-context-text')) {
      if (state.peerCompareOn !== false) openComparisonFilters();
      return;
    }
    if (event.target.closest && event.target.closest('.use-default-peers')) {
      useDefaultPeers();
      return;
    }
    var oosHit = event.target.closest && event.target.closest('[data-oos-state]');
    if (oosHit && event.target.closest('#oos-board')) {
      var code = oosHit.getAttribute('data-oos-state') || '';
      state.oosFocus = state.oosFocus === code ? '' : code;
      renderOrigin(state.paintCache && state.paintCache.originRows);
      return;
    }
    var detailBtn = event.target.closest && event.target.closest('[data-detail]');
    if (detailBtn) {
      openDetail(detailBtn.getAttribute('data-detail'));
      return;
    }
    var card = event.target.closest && event.target.closest('.panel');
    if (!card || event.target.closest('a, button, select, input, label')) return;
    var canvas = card.querySelector('canvas');
    if (canvas) openDetail(canvas.id);
  });
  document.body.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var shape = event.target.closest && event.target.closest('#oos-map [data-oos-state]');
    if (!shape) return;
    event.preventDefault();
    shape.click();
  });
  $('detail-close').addEventListener('click', closeDetail);
  $('detail-overlay').addEventListener('click', closeDetail);
  if ($('section-overview-close')) $('section-overview-close').addEventListener('click', closeSectionOverview);
  if ($('section-overview-overlay')) $('section-overview-overlay').addEventListener('click', closeSectionOverview);
  $('detail-export').addEventListener('click', exportDetailTable);
  if ($('detail-export-csv')) $('detail-export-csv').addEventListener('click', exportDetailCsv);
  $('btn-export-report').addEventListener('click', openReport);
  $('report-close').addEventListener('click', closeReport);
  $('report-print').addEventListener('click', function () { window.print(); });
  $('report-download').addEventListener('click', downloadReport);
  syncReportButton();
}

function initTheme() {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('3e-dashboard-theme'); } catch (e) { /* ignore */ }
  function paintTheme(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-theme-set') === theme);
    });
  }
  paintTheme(saved === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var theme = btn.getAttribute('data-theme-set') === 'dark' ? 'dark' : 'light';
      paintTheme(theme);
      try { localStorage.setItem('3e-dashboard-theme', theme); } catch (e) { /* ignore */ }
      repaintChartsForTheme();
      if (state.page === 'keymetrics' && state.paintCache) {
        renderKeyMetrics(state.paintCache.mine, state.paintCache.peerAggregates || []);
      }
      if (state.paintCache && state.paintCache.originRows) renderOrigin(state.paintCache.originRows);
    });
  });
}

var loaderState = {
  target: 0,
  current: 0,
  message: 'Initializing…',
  raf: null,
  idleTimer: null,
  idleCap: 86
};

function updateLoaderDom() {
  var fill = $('loader-progress-fill');
  var track = $('loader-progress-track');
  var status = $('loader-status');
  var pctEl = $('loader-progress-pct');
  var rounded = Math.round(loaderState.current);
  if (fill) fill.style.width = rounded + '%';
  if (track) track.setAttribute('aria-valuenow', String(rounded));
  if (pctEl) {
    pctEl.textContent = rounded + '%';
    if (pctEl.dataset.lastPct !== String(rounded)) {
      pctEl.dataset.lastPct = String(rounded);
      pctEl.classList.remove('is-tick');
      void pctEl.offsetWidth;
      pctEl.classList.add('is-tick');
    }
  }
  if (status && loaderState.message) status.textContent = loaderState.message;
}

function ensureLoaderAnimLoop() {
  if (loaderState.raf) return;
  function tick() {
    var diff = loaderState.target - loaderState.current;
    if (Math.abs(diff) > 0.25) {
      loaderState.current += diff * 0.14;
      updateLoaderDom();
      loaderState.raf = requestAnimationFrame(tick);
    } else {
      loaderState.current = loaderState.target;
      updateLoaderDom();
      loaderState.raf = null;
    }
  }
  loaderState.raf = requestAnimationFrame(tick);
}

function setLoaderProgress(target, message) {
  loaderState.target = Math.min(100, Math.max(loaderState.target, target));
  if (message) loaderState.message = message;
  updateLoaderDom();
  ensureLoaderAnimLoop();
}

function startLoaderIdleAdvance() {
  stopLoaderIdleAdvance();
  loaderState.idleTimer = setInterval(function () {
    if (loaderState.target < loaderState.idleCap) setLoaderProgress(loaderState.target + 1.4);
  }, 380);
}

function stopLoaderIdleAdvance() {
  if (loaderState.idleTimer) {
    clearInterval(loaderState.idleTimer);
    loaderState.idleTimer = null;
  }
  if (loaderState.raf) {
    cancelAnimationFrame(loaderState.raf);
    loaderState.raf = null;
  }
}

function initDataLoader() {
  var app = $('app');
  if (app) app.classList.add('is-loading');
  var overlay = $('loading-overlay');
  if (overlay) {
    overlay.classList.remove('is-dismissed', 'loading-overlay--exit');
    overlay.removeAttribute('hidden');
    overlay.style.display = '';
    overlay.setAttribute('aria-busy', 'true');
  }
  document.documentElement.classList.add('boot-loading');
  loaderState.current = 0;
  loaderState.target = 6;
  loaderState.message = 'Starting dashboard…';
  updateLoaderDom();
  startLoaderIdleAdvance();
  ensureLoaderAnimLoop();
}

function finishLoading() {
  stopLoaderIdleAdvance();
  loaderState.target = 100;
  loaderState.current = 100;
  loaderState.message = 'Ready';
  updateLoaderDom();
  var overlay = $('loading-overlay');
  var app = $('app');
  if (app) app.classList.remove('is-loading');
  document.documentElement.classList.remove('boot-loading');
  if (overlay) {
    overlay.setAttribute('aria-busy', 'false');
    overlay.classList.remove('loading-overlay--exit');
    overlay.classList.add('is-dismissed');
  }
  return Promise.resolve();
}

function setAppBusy(busy) {
  refreshDimActive = !!busy;
  var main = document.querySelector('.app-main');
  if (main) main.classList.toggle('is-refreshing', !!busy);
  var dot = $('status-dot');
  if (dot) dot.classList.toggle('is-pulse', !!busy);
}

function clearAppBusyEarly() {
  if (!refreshDimActive) return;
  refreshDimActive = false;
  var main = document.querySelector('.app-main');
  if (main) main.classList.remove('is-refreshing');
  var dot = $('status-dot');
  if (dot) dot.classList.remove('is-pulse');
}

function bootCore() {
  document.documentElement.setAttribute('data-ipeds-version', APP_VERSION);
  document.documentElement.setAttribute('data-ipeds-build', APP_BUILD);
  var appRoot = $('app');
  if (appRoot) appRoot.setAttribute('data-ipeds-build', APP_BUILD);
  var buildFoot = $('footer-build');
  if (buildFoot) buildFoot.textContent = 'Build: ' + APP_BUILD;
  setLoaderProgress(8, 'Starting dashboard…');
  renderShells();
  initTheme();
  bindControls();
  setPage('admissions');
  if (typeof domo === 'undefined' || !domo.post) {
    $('header-status').textContent = 'Open in Domo';
    $('status-dot').classList.add('is-wait');
    setBanner('This card queries Domo. Open it from the published 3E IPEDS Insights card.', 'info');
    mountFilters();
    populateFilters();
    paint([], [], [], [], [], []);
    finishLoading();
    return;
  }
  setLoaderProgress(12, 'Connecting to Domo…');
  Promise.all([
    probeAlias(CONFIG.ipedsAlias).then(function (rows) {
      state.connected.ipeds = true;
      state.columns = adoptColumns(rows);
      syncPartitionColumn();
      Object.keys(FIELD).forEach(function (key) {
        state.fields[key] = resolveField(state.columns, FIELD[key], key === 'endowment' || key === 'giving' || key === 'fte' || key === 'opex' || key === 'philanthropic');
      });
    }).catch(function (err) {
      state.error = domoErrorMessage(err) || err.message || 'Test query on ipeds failed.';
    }),
    probeAlias(CONFIG.migrationAlias).then(function (rows) {
      state.connected.migration = true;
      state.migrationError = '';
      state.migrationColumns = adoptMigrationColumns(rows);
    }).catch(function (err) {
      state.connected.migration = false;
      state.migrationError = domoErrorMessage(err) || 'Migration dataset probe failed.';
    })
  ]).then(function () {
    setLoaderProgress(46, 'Loading filters…');
    if (!state.connected.ipeds) {
      $('status-dot').classList.add('is-wait');
      $('header-status').textContent = 'Datasets not mapped';
      setBanner(
        'VW_IPEDS_BETA did not respond on the ipeds alias. ' + (state.error || '') +
        ' Portal mapping should be ipeds → 5bde5389-19ca-4452-acf6-b3241f75453d; re-save the card in Domo if the alias is missing.',
        'error'
      );
      mountFilters();
      populateFilters();
      paint([], [], [], [], [], []);
      finishLoading();
      return;
    }
    return loadBootstrapFilterOptions().then(function () {
      setLoaderProgress(78, 'Opening dashboard…');
      mountFilters();
      populateFilters();
      mountOriginPicker();
      $('status-dot').classList.toggle('is-wait', !state.connected.migration);
      if (!state.connected.migration) {
        setBanner(
          'VW_IPEDS_BETA is connected. Map VW_IPEDS_MIGRATION_BETA as migration for residence and out-of-state charts.' +
          (state.migrationError ? ' ' + state.migrationError : ''),
          state.migrationError ? 'error' : 'info'
        );
      }
      var refreshPromise = applyDraft();
      if (!refreshPromise || typeof refreshPromise.then !== 'function') refreshPromise = Promise.resolve();
      return finishLoading().then(function () {
        loadLookupBackground(true);
        scheduleDistinctFallbackLoad();
        loadFullInstitutionListBackground();
        return refreshPromise;
      });
    });
  }).catch(function (err) {
    $('header-status').textContent = 'Failed to start';
    setBanner(err && err.message ? err.message : 'The card could not start.', 'error');
    finishLoading();
  });
}

function boot() {
  initDataLoader();
  requestAnimationFrame(bootCore);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
