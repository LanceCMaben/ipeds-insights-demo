'use strict';

var assert = require('assert');
var h = require('./peer-helpers');

assert.strictEqual(h.escapeSql("O'Brien"), "O''Brien");
assert.strictEqual(h.isGroupableValue('Not applicable'), false);
assert.strictEqual(h.isGroupableValue('Atlantic Coast Conference'), true);
assert.strictEqual(h.isGroupableValue(''), false);

var rows = [{ SURVEY_YEAR: '2023', x: 1 }, { SURVEY_YEAR: '2024', x: 2 }];
assert.strictEqual(h.rowsForYear(rows, '2023').length, 1);

assert.strictEqual(h.detectColumnScale([{ R: 0.5 }, { R: 0.8 }], 'R'), 'unit');
assert.strictEqual(h.detectColumnScale([{ R: 55 }, { R: 60 }], 'R'), 'percent');
assert.strictEqual(h.detectColumnScale([{ R: 0.5 }, { R: 55 }], 'R'), 'mixed');

var pred = h.buildDefaultPeerPredicate(
  { CONFERENCE: 'Not applicable', STABBR_VALUE: 'North Carolina', CONTROL_VALUE: 'Private not-for-profit' },
  ['CONFERENCE', 'STABBR_VALUE', 'CONTROL_VALUE'],
  'High Point University, North Carolina'
);
assert.strictEqual(pred.mode, 'state-control');
assert.ok(pred.where.indexOf('STABBR_VALUE') !== -1);
assert.ok(pred.where.indexOf('Not applicable') === -1);

console.log('peer-helpers.test.js: all assertions passed');
