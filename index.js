 const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const { build } = require('./utils/build');
const { watch } = require('./utils/watch');

const { streamToPromise } = require('@ngx-devtools/common');

const buildRxjs = require('./utils/bundle-rxjs');
const onClientFileChanged = require('./utils/on-changed');

exports.buildRxjs = buildRxjs;
exports.onClientFileChanged = onClientFileChanged;

exports.build = () => streamToPromise(build());

exports.watch = () => {
  watch(); return Promise.resolve();
};