const { join } = require('path');

const { copyPackageFile } = require('./copy-package');
const { inlineSources } = require('./inline-sources');
const { copyEntry } = require('./copy-entry');
const { compile } = require('./ngc');
const { copyAssetFiles } = require('./copy-assets');
const { getSrcDirectories } = require('./directories');
const { buildProdElements, buildProdElement, buildProdElementsArgv } = require('./build-elements');

const rollup = require('./rollup');

const DEST_PATH = 'dist';

const bundle = (src, dest) => {
  return copyPackageFile(src, dest)
    .then(pkgName => Promise.all([ copyEntry(pkgName), inlineSources(src, pkgName) ]))
    .then(results => results.find(result => result))
    .then(tmpSrc => compile(tmpSrc))
    .then(tmpSrc => Promise.all([ copyAssetFiles(tmpSrc, dest), rollup(tmpSrc, dest) ]));
};

const buildProdApp = () => {
  const options = {
    src: join('src', 'app', 'package.json'),
    dest: DEST_PATH
  };
  return bundle(options.src, options.dest);
};

const buildProdLibs = () => {
  const SRC_LIBS_PATH = join('src', 'libs');
  return getSrcDirectories(SRC_LIBS_PATH).then(packages => {
    return Promise.all(packages.map(package => bundle(package.src, package.dest)));
  }); 
};

const buildProdAll = () => Promise.all([ buildProdElements(), buildProdApp(), buildProdLibs() ]);

exports.buildProdAll = buildProdAll;
exports.buildProdElements = buildProdElements;
exports.buildProdElement = buildProdElement;
exports.buildProdElementsArgv = buildProdElementsArgv;
exports.buildProd = bundle;
exports.buildProdApp = buildProdApp;
exports.buildProdLibs = buildProdLibs;