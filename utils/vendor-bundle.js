
const path = require('path');
const buildRxjs = require('./bundle-rxjs');

const { minifyScript } = require('./systemjs-script-min');
const { deleteFolderAsync, writeFileAsync, concatAsync, concat, minify, mkdirp } = require('@ngx-devtools/common');

const minifyNativeShim = (dest) => {
  return minify('node_modules/@webcomponents/custom-elements/src/native-shim.js')
    .then(content => {
      const destPath = path.resolve(dest, 'native-shim.min.js');
      mkdirp(path.dirname(destPath));
      return writeFileAsync(destPath, content.code) 
    });
};

const angularBundle = (dest) => {
  return concat([
    'node_modules/@angular/core/bundles/core.umd.min.js',
    'node_modules/@angular/common/bundles/common.umd.min.js',
    'node_modules/@angular/common/bundles/common-http.umd.min.js',
    'node_modules/@angular/compiler/bundles/compiler.umd.min.js',
    'node_modules/@angular/animations/bundles/animations.umd.min.js',
    'node_modules/@angular/animations/bundles/animations-browser.umd.min.js',
    'node_modules/@angular/platform-browser/bundles/platform-browser.umd.min.js',
    'node_modules/@angular/platform-browser/bundles/platform-browser-animations.umd.js',
    'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js',
    'node_modules/@angular/router/bundles/router.umd.min.js',
    'node_modules/@angular/forms/bundles/forms.umd.min.js',
    'node_modules/@angular/elements/bundles/elements.umd.min.js'
  ], path.join(dest, 'angular.min.js'))
};

const shimsBundle = (dest) => {
  return concat([
    path.resolve(dest, 'native-shim.min.js'),
    'node_modules/@webcomponents/custom-elements/custom-elements.min.js',
    'node_modules/core-js/client/shim.min.js', 
    'node_modules/systemjs/dist/system.js',
    'node_modules/zone.js/dist/zone.min.js' 
  ], path.join(dest, 'shims.min.js'));
};

const vendorBundle = (dest = 'node_modules/.tmp', done = () => { }) => {
  return deleteFolderAsync(dest)
    .then(() => minifyNativeShim(dest))
    .then(() => Promise.all([ buildRxjs(done), minifyScript(), shimsBundle(dest), angularBundle(dest)  ]));
};

module.exports = vendorBundle;