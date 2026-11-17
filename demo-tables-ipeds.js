(function (global) {
  'use strict';

  var PEERS = [
    { inst: 'Riverside State University', part: 'Demo Riverside', conf: 'Demo Athletic', region: 'Southeast', state: 'NC', control: 'Public', select: 'Moderately selective' },
    { inst: 'Lakeview College', part: 'Demo Lakeview', conf: 'Demo Liberty', region: 'Midwest', state: 'OH', control: 'Private nonprofit', select: 'Very selective' },
    { inst: 'Central Technical Institute', part: 'Demo Central', conf: '—', region: 'Southwest', state: 'TX', control: 'Public', select: 'Open admission' },
    { inst: 'Atlantic Coast University', part: 'Demo Atlantic', conf: 'Demo Coastal', region: 'Northeast', state: 'MA', control: 'Private nonprofit', select: 'Highly selective' },
    { inst: 'Prairie View College', part: 'Demo Prairie', conf: '—', region: 'Plains', state: 'KS', control: 'Public', select: 'Moderately selective' },
    { inst: 'Summit Valley University', part: 'Demo Summit', conf: 'Demo Summit', region: 'West', state: 'CO', control: 'Public', select: 'Selective' }
  ];

  var YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

  function buildIpedsRows() {
    var rows = [];
    PEERS.forEach(function (p, pi) {
      YEARS.forEach(function (y, yi) {
        var base = 4200 + pi * 600 + yi * 90;
        var appl = base + 800;
        var adm = Math.round(appl * (0.62 + pi * 0.03));
        var enr = Math.round(adm * (0.22 + yi * 0.01));
        var tuition = 28500 + pi * 1200 + yi * 350;
        rows.push({
          MYINSTNAME: p.part,
          PARTITION: p.part,
          INSTNM: p.inst,
          SURVEY_YEAR: y,
          CONFERENCE: p.conf,
          OBEREG_VALUE: p.region,
          STABBR_VALUE: p.state,
          CONTROL_VALUE: p.control,
          SELECTIVITY_CATEGORY: p.select,
          APPLCN: appl,
          ADMSSN: adm,
          ENRLT: enr,
          ADMIT_RATE: +(adm / appl).toFixed(4),
          YIELD_RATE: +(enr / adm).toFixed(4),
          AVG_TUITION: tuition,
          TUITION1: tuition - 500,
          TUITION2: tuition + 400,
          NTR: Math.round(tuition * 0.71),
          DISCOUNT_RATE: 0.28 + pi * 0.02,
          PGRNT_P: 0.19 + yi * 0.005,
          ENDOWMENT_END: (80 + pi * 25 + yi * 5) * 1e6,
          ENDOWMENT_BEGIN: (75 + pi * 24) * 1e6,
          PRIVATE_GIVING_TOTAL: (8 + pi + yi * 0.4) * 1e6,
          PRIVATE_GIFTS: (6 + pi) * 1e6,
          PRIVATE_GRANTS_CONTRACTS: 0.5e6,
          FTE_TOTAL: 3200 + pi * 400 + yi * 50,
          FTE: 3200 + pi * 400,
          TOTAL_EXPENSES: (120 + pi * 15) * 1e6,
          INSTRUCTION_EXPENSES: (45 + pi * 5) * 1e6,
          ENDOWMENT_NEW_GIFTS_ADDITIONS: 0.8e6
        });
      });
    });
    return rows;
  }

  function buildMigrationRows() {
    var states = ['North Carolina', 'Virginia', 'Georgia', 'Florida', 'Ohio', 'Texas', 'California'];
    var rows = [];
    PEERS.forEach(function (p) {
      YEARS.forEach(function (y) {
        states.forEach(function (st, si) {
          rows.push({
            INSTNM: p.inst,
            SURVEY_YEAR: y,
            EFCSTATE_LABEL: st,
            EFCSTATE_TITLE: st,
            EFRES01: 120 + si * 18 + (y - 2019) * 4,
            STABBR: p.state,
            STABBR_VALUE: p.state
          });
        });
      });
    });
    return rows;
  }

  global.registerIpedsDemoTables = function () {
    if (!global.DemoSqlEngine) return;
    DemoSqlEngine.registerTable('ipeds', buildIpedsRows());
    DemoSqlEngine.registerTable('migration', buildMigrationRows());
  };
})(typeof window !== 'undefined' ? window : global);