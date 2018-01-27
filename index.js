
if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = resolve();
}

const { resolve, join } = require('path');

const { build } = require('./utils/build');
const { watch } = require('./utils/watch');

const { streamToPromise } = require('@ngx-devtools/common');

exports.build = async () => await streamToPromise(build());
exports.watch = async () => {
  watch(); return Promise.resolve();
};