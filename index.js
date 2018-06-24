const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const argv = require('yargs')
  .option('pkg', { default: null, type: 'string' })
  .argv;

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const { isProcess } = require('@ngx-devtools/common');

const { attachedToIndexHtml  } = require('./utils/systemjs-script-min');
const { bundle, bundlePackage, bundleFiles, buildDev, buildDevAll, buildDevPackage  } = require('./bundle');
const { onClientFileChanged } = require('./utils/on-changed');

const vendorBundle = require('./utils/vendor-bundle');

const bundlProd = () => 
   (argv.pkg 
      ? bundlePackage(argv.pkg, 'dist')
      : bundleFiles())

const build = (isProcess(prodModeParams)) 
  ? bundlProd 
  : (argv.pkg 
      ? () => buildDevPackage(argv.pkg, 'dist')
      : buildDevAll);

exports.bundle = bundle;
exports.build = build;
exports.buildDev = buildDev;
exports.onClientFileChanged = onClientFileChanged;
exports.vendorBundle = vendorBundle;
exports.attachedToIndexHtml = attachedToIndexHtml;