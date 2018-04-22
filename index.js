 const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const { streamToPromise } = require('@ngx-devtools/common');
const { buildProd, build } = require('./utils/build-prod');

const onClientFileChanged = require('./utils/on-changed');
const vendorBundle = require('./utils/vendor-bundle');
const buildAsync = require('./utils/build-async');

exports.onClientFileChanged = onClientFileChanged;
exports.vendorBundle = vendorBundle;

exports.build = build;
exports.buildAsync = buildAsync;
exports.buildProd = buildProd;