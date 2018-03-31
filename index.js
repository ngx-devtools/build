 const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const { build } = require('./utils/build');
const { watch } = require('./utils/watch');

const { streamToPromise } = require('@ngx-devtools/common');

const buildRxjs = require('./utils/bundle-rxjs');
const onClientChanged = require('./utils/on-changed');

exports.buildRxjs = buildRxjs;
exports.onClientChanged = onClientChanged;

exports.build = () => { 
  return streamToPromise(build());
};

exports.watch = () => {
  watch(); return Promise.resolve();
};