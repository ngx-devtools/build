
const { deleteFolderAsync, concatAsync } = require('@ngx-devtools/common');
const buildRxjs = require('./bundle-rxjs');

const angularBundle = (dest) => {
  const angularParams = [[
    'node_modules/@angular/core/bundles/core.umd.min.js',
    'node_modules/@angular/common/bundles/common.umd.min.js',
    'node_modules/@angular/common/bundles/common-http.umd.min.js',
    'node_modules/@angular/compiler/bundles/compiler.umd.min.js',
    'node_modules/@angular/platform-browser/bundles/platform-browser.umd.min.js',
    'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js',
    'node_modules/@angular/router/bundles/router.umd.min.js',
    'node_modules/@angular/forms/bundles/forms.umd.min.js',
    'node_modules/@angular/elements/bundles/elements.umd.min.js'
  ], dest, 'angular.min.js' ];
  return concatAsync(...angularParams);
};

const shimsBundle = (dest) => {
  const concatParams = [[ 
    'node_modules/core-js/client/shim.min.js', 
    'node_modules/systemjs/dist/system.js',
    'node_modules/zone.js/dist/zone.min.js' 
  ], dest, 'shims.min.js' ];
  return concatAsync(...concatParams);
}

const vendorBundle = (dest = 'node_modules/.tmp', done = () => { }) => {
  return deleteFolderAsync(dest)
    .then(() => Promise.all([ shimsBundle(dest), angularBundle(dest)  ]));
};

module.exports = vendorBundle;