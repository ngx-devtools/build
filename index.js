const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const { isProcess, deleteFolderAsync } = require('@ngx-devtools/common');

const { bundle, bundleFiles } = require('./bundle');

const onClientFileChanged = require('./utils/on-changed');
const vendorBundle = require('./utils/vendor-bundle');
const rollup = require('./bundle/rollup');

const { buildAsync, inlineFileAsync } = require('./utils/build-async');

exports.onClientFileChanged = onClientFileChanged;
exports.vendorBundle = vendorBundle;

const bundlProd = (dest = [ 'dist' ]) => {
  return Promise.all(dest.map(folder => deleteFolderAsync(folder)))
    .then(() => bundleFiles());
};

const build = (isProcess(prodModeParams)) ? bundlProd : buildAsync;

exports.build = build;
exports.rollup = rollup;
exports.inlineFileAsync = inlineFileAsync;