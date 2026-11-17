'use strict';

var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

var manifest = JSON.parse(read('manifest.json'));
var manifestDev = JSON.parse(read('manifest.dev.json'));
var appJs = read('app.js');
var indexHtml = read('index.html');
var readme = read('README.md');

var manifestVer = manifest.version;
var devVer = manifestDev.version;
var appMatch = appJs.match(/var APP_VERSION = '([^']+)'/);
var appVer = appMatch ? appMatch[1] : null;
var indexMatch = indexHtml.match(/app\.js\?v=([^"']+)/);
var indexVer = indexMatch ? indexMatch[1] : null;
var readmeMatch = readme.match(/\*\*0\.(\d+\.\d+)\*\*/);
var readmeVer = readmeMatch ? '0.' + readmeMatch[1] : null;

var errors = [];
if (manifestVer !== devVer) errors.push('manifest.json version ' + manifestVer + ' != manifest.dev.json ' + devVer);
if (appVer !== manifestVer) errors.push('APP_VERSION ' + appVer + ' != manifest ' + manifestVer);
if (indexVer !== manifestVer) errors.push('index.html cache-bust ' + indexVer + ' != manifest ' + manifestVer);
if (readmeVer && readmeVer !== manifestVer) errors.push('README version ref ' + readmeVer + ' != manifest ' + manifestVer);

if (errors.length) {
  console.error('Release version check failed:\n' + errors.map(function (e) { return '  - ' + e; }).join('\n'));
  process.exit(1);
}
console.log('Release version check OK (' + manifestVer + ').');
