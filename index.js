const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const argv = require('yargs')
  .option('pkg', { default: null, type: 'string' });

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const { isProcess } = require('@ngx-devtools/common');

const { onClientFileChanged } = require('./utils/on-changed');
const { buildProdPackage, buildProdElementsArgv, buildProdAll, buildDev, buildDevAll } = require('./bundle');

const vendorBundle = require('./utils/vendor-bundle');

const bundlProd = () => 
  (argv.pkg 
    ? buildProdPackage(argv.pkg, 'dist')
    : (!(argv.elements === null))
      ? buildProdElementsArgv()
      : buildProdAll()
   );

const build = (isProcess(prodModeParams)) 
  ? bundlProd 
  : (argv.pkg 
    ? () => buildDev(argv.pkg, 'dist')
    : buildDevAll);

exports.build = build;
exports.buildDev = buildDev;
exports.onClientFileChanged = onClientFileChanged;
exports.vendorBundle = vendorBundle;