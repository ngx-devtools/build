const path = require('path');

const { clean } = require('@ngx-devtools/common');

const { copyPackageFile } = require('./copy-package');
const { copyEntryFiles, copyEntry } = require('./copy-entry');
const { inlineSources } = require('./inline-sources');
const { compile } = require('./ngc');
const { copyAssetFiles } = require('./copy-assets');
const { getSrcDirectories } = require('./directories');
const { rollupConfigs } = require('./rollup.config');
const { readPackageFile } = require('./read-package-file');
const { rollupDev } = require('./rollup-dev');

const { buildDev, buildDevAll, buildApp, buildElements, buildLibs } = require('./build-dev');
const { buildProd, buildProdAll, buildProdApp, buildProdLibs, buildProdElements, buildProdElement, buildProdElementsArgv } = require('./build-prod');

const buildProdPackage = (src, dest) => {
  const destPath = path.dirname(src.replace('src', 'dest'));
  return clean(destPath).then(() => buildProd(src, dest))
};

exports.buildDev = buildDev;
exports.buildElements = buildElements;
exports.buildApp = buildApp;
exports.buildLibs = buildLibs;
exports.buildDevAll = buildDevAll;
exports.buildProdAll = buildProdAll;
exports.buildProdApp = buildProdApp;
exports.buildProdLibs = buildProdLibs;
exports.buildProdElements = buildProdElements;
exports.buildProdElement = buildProdElement;
exports.buildProdElementsArg = buildProdElementsArgv;
exports.buildProd = buildProd;
exports.buildProdPackage = buildProdPackage;
exports.copyAssetFiles = copyAssetFiles;
exports.copyEntryFiles = copyEntryFiles;
exports.copyEntry = copyEntry;
exports.copyPackageFile = copyPackageFile;
exports.getSrcDirectories = getSrcDirectories;
exports.inlineSources = inlineSources;
exports.compile = compile;
exports.readPackageFile = readPackageFile;
exports.rollupDev = rollupDev;
exports.rollupConfigs = rollupConfigs;