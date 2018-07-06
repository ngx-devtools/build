const { join, basename, dirname } = require('path');

const { copyPackageFile } = require('./copy-package');
const { inlineSources } = require('./inline-sources');
const { copyEntry } = require('./copy-entry');
const { compile } = require('./ngc');
const { copyAssetFiles } = require('./copy-assets');

const rollup = require('./rollup');

const bundle = (src, dest) => {
  return copyPackageFile(src, dest)
    .then(pkgName => Promise.all([ copyEntry(src), inlineSources(src, pkgName) ]))
    .then(results => results.find(result => result))
    
};

exports.bundleProd = bundle;

