const path = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = path.resolve();
}

const argv = require('yargs')
  .option('pkg', { default: null, type: 'string' })
  .option('elements', { default: null, type: 'string' })
  .option('libs', { default: null, type: 'string' })
  .option('app', { default: null, type: 'string' })
  .argv;

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const { isProcess } = require('@ngx-devtools/common');

const { onClientFileChanged } = require('./utils/on-changed');
const {
  buildProdPackage, 
  buildProdElements, 
  buildProdElement, 
  buildProdAll,
  buildDev, 
  buildDevAll, 
  getSrcDirectories 
} = require('./bundle');

const vendorBundle = require('./utils/vendor-bundle');

const buildElements = async () => {
  const argvs = argv.elements.split('.')
  const SRC_ELEMENTS = path.join('src', 'elements');
  const elements = await getSrcDirectories(SRC_ELEMENTS).then(packages => {
    const elements = packages.map(package => 
        path.dirname(package.src.replace(SRC_ELEMENTS + path.sep, '')))
          .filter(element => argvs.includes(element));
    return (elements) 
      ? elements.map(element => { 
          return { src: path.join(SRC_ELEMENTS, element, 'package.json'), dest: 'dist' }
        })
      : [];
  });
  return (argv.elements) ? buildProdElement(elements) : buildProdElements();
};

const bundlProd = () => 
  (argv.pkg 
    ? buildProdPackage(argv.pkg, 'dist')
    : (!(argv.elements === null))
      ? buildElements()
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