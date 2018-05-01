const path = require('path');

const { mkdirp} = require('@ngx-devtools/common');

const { copyPackageFile } = require('./copy-package');
const { copyEntryFiles } = require('./copy-entry');
const { inlineSources } = require('./inline-sources');
const { compile } = require('./ngc');
const { copyAssetFiles } = require('./copy-assets');
const { getSrcDirectories } = require('./directories');

const rollup = require('../utils/rollup');

const argv = require('yargs')
  .option('main', { default: 'main', type: 'string' })
  .option('libs', { default: 'libs', type: 'string' })
  .argv;

/**
 * 
 * @param {source file} src 
 * @param {*} dest 
 */
const bundle = (src, dest) => {
  return copyPackageFile(src, dest)
    .then(pkgName => {
      const folderTempBaseDir = path.join(path.resolve('.tmp'), pkgName);
      mkdirp(folderTempBaseDir);
      return Promise.all([ copyEntryFiles(folderTempBaseDir), inlineSources(src, pkgName) ])
        .then(() => Promise.resolve(folderTempBaseDir)); 
    })
    .then(tmpSrc => compile(tmpSrc))
    .then(tmpSrc => {
      const pkgName = path.basename(tmpSrc);
      return Promise.all([ copyAssetFiles(tmpSrc, 'dist'), rollup(pkgName, 'dist') ]);
    });
};

/**
 * 
 */
const bundleFiles = () => {
  return getSrcDirectories().then(directories => {
    return Promise.all(directories.map(directory => bundle(directory, 'dist')));
  }).catch(error => console.error(error));
};

exports.bundleFiles = bundleFiles;
exports.bundle = bundle;
exports.copyPackageFile = copyPackageFile;
exports.copyEntryFiles = copyEntryFiles;
exports.inlineSources = inlineSources;
exports.compile = compile;
exports.copyAssetFiles = copyAssetFiles;
exports.getSrcDirectories = getSrcDirectories;