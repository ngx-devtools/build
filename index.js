const rimraf = require('rimraf');

const { resolve, join } = require('path');

const { build } = require('./utils/build');
const { watch } = require('./utils/watch');

const streamToPromise = require('./utils/stream-to-promise');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = resolve();
}

exports.rimraf = async (folderName) => {
  const directory = join(process.env.APP_ROOT_PATH, folderName);
  await new Promise((resolve, reject) => {
    rimraf(directory, (error) => (error) ? reject() : resolve());
  });
};
exports.build = async () => await streamToPromise(build());
exports.watch = async () => {
  watch(); return Promise.resolve();
};