'use strict';

function escapeSql(s) {
  return String(s).replace(/'/g, "''");
}

function isGroupableValue(value) {
  var t = value == null ? '' : String(value).trim();
  if (!t) return false;
  var u = t.toUpperCase();
  if (u === 'NOT APPLICABLE' || u === 'N/A' || u === 'NA' || u === 'NONE' || u === 'NULL' || u === 'UNKNOWN') return false;
  if (t === '—' || t === '-') return false;
  return true;
}

function rowsForYear(rows, year) {
  if (!year) return rows;
  var want = String(year);
  return rows.filter(function (row) {
    return String(row.SURVEY_YEAR) === want;
  });
}

function detectColumnScale(rows, column) {
  if (!column) return 'unknown';
  var hasUnit = false;
  var hasPercent = false;
  rows.forEach(function (row) {
    var v = row[column];
    if (v == null || v === '') return;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    if (!isFinite(n)) return;
    if (n <= 1.5) hasUnit = true;
    else hasPercent = true;
  });
  if (hasUnit && hasPercent) return 'mixed';
  if (hasUnit) return 'unit';
  if (hasPercent) return 'percent';
  return 'unknown';
}

function buildDefaultPeerPredicate(sample, columns, institution, opts) {
  opts = opts || {};
  var maxSingle = opts.maxSingleDimension || 1000;
  if (!sample || !institution) return { blocked: true };
  var excl = "INSTNM <> '" + escapeSql(institution) + "'";
  var hasConference = columns.indexOf('CONFERENCE') !== -1;
  var hasState = columns.indexOf('STABBR_VALUE') !== -1;
  var hasControl = columns.indexOf('CONTROL_VALUE') !== -1;
  if (hasConference && isGroupableValue(sample.CONFERENCE)) {
    return { blocked: false, where: excl + " AND CONFERENCE = '" + escapeSql(String(sample.CONFERENCE)) + "'", mode: 'conference' };
  }
  var stateOk = hasState && isGroupableValue(sample.STABBR_VALUE);
  var controlOk = hasControl && isGroupableValue(sample.CONTROL_VALUE);
  if (stateOk && controlOk) {
    return {
      blocked: false,
      where: excl + " AND STABBR_VALUE = '" + escapeSql(String(sample.STABBR_VALUE)) + "' AND CONTROL_VALUE = '" + escapeSql(String(sample.CONTROL_VALUE)) + "'",
      mode: 'state-control'
    };
  }
  if (stateOk) {
    return { blocked: false, where: excl + " AND STABBR_VALUE = '" + escapeSql(String(sample.STABBR_VALUE)) + "'", mode: 'state-only', needsCountCheck: true, maxSingle: maxSingle };
  }
  if (controlOk) {
    return { blocked: false, where: excl + " AND CONTROL_VALUE = '" + escapeSql(String(sample.CONTROL_VALUE)) + "'", mode: 'control-only', needsCountCheck: true, maxSingle: maxSingle };
  }
  return { blocked: true };
}

module.exports = {
  escapeSql: escapeSql,
  isGroupableValue: isGroupableValue,
  rowsForYear: rowsForYear,
  detectColumnScale: detectColumnScale,
  buildDefaultPeerPredicate: buildDefaultPeerPredicate
};
