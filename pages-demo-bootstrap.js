(function () {
  'use strict';
  window.__PAGES_DEMO__ = true;

  function domoPayload(rows) {
    return rows;
  }

  window.domo = {
    post: function (url, sql) {
      var rows = window.DemoSqlEngine ? DemoSqlEngine.runForUrl(url, sql) : [];
      return Promise.resolve(domoPayload(rows));
    },
    get: function () {
      return Promise.resolve([]);
    },
    onFiltersUpdate: function () {}
  };

  document.addEventListener('DOMContentLoaded', function () {
    var bannerHook = setInterval(function () {
      var el = document.getElementById('header-status');
      if (!el) return;
      clearInterval(bannerHook);
      if (el.textContent === 'Open in Domo') el.textContent = 'Portfolio demo';
    }, 200);
  });
})();