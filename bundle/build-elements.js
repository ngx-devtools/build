const path = require('path');

const { mkdirp, writeFileAsync, getFiles, copyFile } = require('@ngx-devtools/common');

const { readPackageFile } = require('./read-package-file');
const { getSrcDirectories } = require('./directories');
const { copyEntry } = require('./copy-entry');
const { inlineSources } = require('./inline-sources');
const { compile } = require('./ngc');
const { copyAssetFiles } = require('./copy-assets');
const { configs } = require('./rollup.config');

const rollup = require('rollup');
const multiEntry = require('rollup-plugin-multi-entry');
const resolve = require('rollup-plugin-node-resolve');

const PKG_NAME = 'elements';
const DEST_PATH = 'dist';
const SRC_ELEMENTS_PATH = path.join('src', PKG_NAME);
const TMP_PACKAGE = path.join('.tmp', PKG_NAME);

const argv = require('yargs')
  .option('elements', { default: null, type: 'string' })
  .argv;

const createElements = (packages) => {
  return Promise.all(packages.map(package => {
    return readPackageFile(package.src, 'utf8')
      .then(pkgName => `export * from './${pkgName}/index';`)
  }))
  .then(results => results.join('\n'))
  .then(content => {
    const destPath = path.resolve(path.join('.tmp', 'elements', 'src', 'index.ts') );
    mkdirp(path.dirname(destPath));
    return writeFileAsync(destPath, content);
  });
};

const copyPackageSrc = (tmpSrc) => {
  const files = getFiles(path.join(tmpSrc, 'src', '**/*.ts')).join(',').split(',');
  return Promise.all(files.map(file => {
    const pkgName = path.basename(tmpSrc);
    const destPath = file.replace('src' + path.sep, '').replace(pkgName, `elements/src/${pkgName}`);
    mkdirp(path.dirname(destPath));
    return copyFile(file, destPath);
  }))
};

const createConfigs = (src, dest, options = {}) => {
  const esFolders = [ 'esm2015', 'esm5', 'umd' ];
  const folder = path.basename(src);
  return esFolders.map(esFolder => {
    const plugins = (options.input && options.input.plugins) ? options.input.plugins: [];

    const inputFile = (esFolder.includes('umd')) 
      ? path.join(src, 'esm5', `${folder}.js`)
      : path.join(src, esFolder, `${folder}.js`)

    const file = (!(esFolder.includes('umd'))) 
      ? inputFile.replace('.tmp', dest)
      : path.join(dest, folder, 'bundles', `${folder}.umd.js`);

    const format = (esFolder.includes('umd') ? 'umd' : 'es');

    return {
      inputOptions: {
        ...configs.inputOptions,
        input: inputFile,
        plugins: [ multiEntry(), resolve() ],
        onwarn: configs.inputOptions.onwarn
      },
      outputOptions: {
        ...configs.outputOptions,
        name: folder, 
        file: file, 
        format: format
      }
    }
  });
};

const buildRollup = (tmpSrc, dest, options = {}) => {
  const rollupConfigs = createConfigs(tmpSrc, dest, options);
  return Promise.all(rollupConfigs.map(rollupConfig => rollupProd(rollupConfig)));
};

const rollupProd = ({ inputOptions, outputOptions }) => {
  return rollup.rollup(inputOptions)
    .then(bundle => bundle.generate(outputOptions))
    .then(({ code, map }) => {
      const file = outputOptions.file;
      mkdirp(path.dirname(file));
      return Promise.all([ 
        writeFileAsync(file, code + `\n//# sourceMappingURL=${path.basename(file)}.map`),
        writeFileAsync(file + '.map', map.toString())
      ])
    });
};

const buildProdElement = (packages) => {
  return Promise.all([
    Promise.all(packages.map(package => {
      return readPackageFile(package.src)
        .then(pkgName => inlineSources(package.src, pkgName))
        .then(tmpSrc => copyPackageSrc(tmpSrc))
    })),
    Promise.all([ createElements(packages), copyEntry(PKG_NAME) ])
  ])
  .then(() => compile(TMP_PACKAGE))
  .then(tmpSrc => Promise.all([ copyAssetFiles(tmpSrc, DEST_PATH), buildRollup(tmpSrc, DEST_PATH)  ]))
};

const buildProdElementsArgv = () => {
  return (!(argv.elements === null)) 
    ? (async () => {
        const argvs = argv.elements.split('.');
        const elements = await getSrcDirectories(SRC_ELEMENTS_PATH).then(packages => {
          const elements = packages.map(package => 
            path.dirname(package.src.replace(SRC_ELEMENTS_PATH + path.sep, '')))
              .filter(element => argvs.includes(element));
          return (!(elements)) ? []
            : elements.map(element => {
                return {
                  src: path.join(SRC_ELEMENTS_PATH, element, 'package.json'), 
                  dest: DEST_PATH
                }
              });
        });
        return (argv.elements) ? buildProdElement(elements): buildProdElements();
      })()
    : Promise.resolve();
};

const buildProdElements = () => {
  return getSrcDirectories(SRC_ELEMENTS_PATH).then(packages => buildProdElement(packages));
};

exports.buildProdElements = buildProdElements;
exports.buildProdElement = buildProdElement;
exports.buildProdElementsArgv = buildProdElementsArgv;