 const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const { streamToPromise } = require('@ngx-devtools/common');
const { bundle, bundleFiles } = require('./bundle');

const onClientFileChanged = require('./utils/on-changed');
const vendorBundle = require('./utils/vendor-bundle');
const buildAsync = require('./utils/build-async');
const rollup = require('./utils/rollup');

exports.onClientFileChanged = onClientFileChanged;
exports.vendorBundle = vendorBundle;

exports.build = bundleFiles;
exports.buildAsync = buildAsync;
exports.buildProd = bundle;
exports.rollup = rollup;
