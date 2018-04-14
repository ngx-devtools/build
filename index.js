 const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const { build } = require('./utils/build');

const { streamToPromise } = require('@ngx-devtools/common');

const onClientFileChanged = require('./utils/on-changed');
const vendorBundle = require('./utils/vendor-bundle');

exports.onClientFileChanged = onClientFileChanged;
exports.vendorBundle = vendorBundle;

exports.build = () => streamToPromise(build());