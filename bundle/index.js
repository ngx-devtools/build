const path = require('path');

const { mkdirp} = require('@ngx-devtools/common');

const { copyPackageFile } = require('./copy-package');
const { copyEntryFiles } = require('./copy-entry');
const { inlineSources } = require('./inline-sources');
const { compile } = require('./ngc');
const { copyAssetFiles } = require('./copy-assets');
const { getSrcDirectories } = require('./directories');
const { rollupConfigs } = require('./rollup.config');

const rollup = require('./rollup');

/**
 * Bundle Source files to Angular Standard Libary
 * @param {source file} src 
 * @param {*} dest 
 */
const bundle = (src, dest) => {
  return copyPackageFile(src, dest)
    .then(pkgName => {
      const destSrc = path.resolve(dest);
      const folderTempBaseDir = path.join(destSrc.replace(path.basename(destSrc), '.tmp'), pkgName);
      return Promise.all([ copyEntryFiles(folderTempBaseDir), inlineSources(src, pkgName) ])
        .then(() => Promise.resolve(folderTempBaseDir)); 
    })
    .then(tmpSrc => compile(tmpSrc))
    .then(tmpSrc => Promise.all([ copyAssetFiles(tmpSrc, dest), rollup(tmpSrc, dest) ]));
};

/**
 * 
 */
const bundleFiles = () => {
  return getSrcDirectories().then(directories => {
    const folders = directories.map(folder => 
      Object.assign(folder, { src: folder.src.split(path.sep).join('/') + '/**/*.ts' })
    );
    return Promise.all(folders.map(folder => bundle(folder.src, folder.dest)));
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
exports.rollupConfigs = rollupConfigs;