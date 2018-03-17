const { resolve, join } = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = resolve();
}

const { build } = require('./utils/build');
const { watch } = require('./utils/watch');

const { streamToPromise } = require('@ngx-devtools/common');

const argv = require('yargs')
  .option('watch', { default: false, type: 'boolean', alias: 'w' })
  .argv;

exports.build = () => { 
  return streamToPromise(build())
    .then(() => {
      if (argv['watch'] && argv.watch === true) watch();
      return Promise.resolve();
    });
};
exports.watch = async () => {
  watch(); return Promise.resolve();
};