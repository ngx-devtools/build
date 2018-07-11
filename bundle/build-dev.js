const { join } = require('path');

const { getSrcDirectories } = require('./directories');
const { readPackageFile } = require('./read-package-file');
const { inlineSources } = require('./inline-sources');
const { rollupDev } = require('./rollup-dev');

const SRC_ELEMENTS_PATH = join('src', 'elements');
const DEST_PATH = 'dist';

/**
 * Build the source with package.jon | source of .ts files and dest parameters
 * i.e npm run build -- --pkg src/app/package.json
 *     buildDev("src\/app\/**\/*.ts", "dist")
 * Steps: 
 * 1. read the package.json, extract the name of the package
 * 2. inline the html, scss, and css to the component destination to .tmp folder
 * 3. build the source using rollup with umd file format
 * @param {package.json source path or source of all .ts files} srcPkg 
 * @param {destination of the build files} dest 
 */
const buildDev = (src, dest) => {
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
    .then(tmpSrc => rollupDev(tmpSrc, dest));
};

/**
 * Build the source from `libs` folder 
 * Steps: 
 * 1. get all the base directories in the libs folder
 * 2. read the package.json file
 * 3. inline the html, scss, and css to the component
 * 4. build the source using rollup with the umd file format
 */
const buildLibs = () => {
  const SRC_LIBS_PATH = join('src', 'libs');
  return getSrcDirectories(SRC_LIBS_PATH).then(packages => {
    return Promise.all(packages.map(package => buildDev(package.src, package.dest)));
  });
};

/**
 * Build the source from `app` folder
 * Steps:
 * 1. get all the base directories in the app folder
 * 2. read the package.json file
 * 3. inline the html, scss, and css to the component
 * 4. build the source using rollup with the umd file format
 */
const buildApp = () => {
  const options = {
    src: join('src', 'app', 'package.json'),
    dest: DEST_PATH
  };
  return buildDev(options.src, options.dest);
};

/**
 * Build the source from `elements` folder
 * Steps:
 * 1. get all the base directories in the elements folder
 * 2. read the package.json file
 * 3. inline the html, scss, and css to the component
 * 4. return array of inputs to build in 1 file
 * 5. build the source using rollup with the umd file format
 */
const buildElements = () => {
  return getSrcDirectories(SRC_ELEMENTS_PATH).then(packages => {
      return Promise.all(packages.map(package => {
        return readPackageFile(package.src)
          .then(pkgName => inlineSources(package.src, pkgName))
          .then(tmpSrc => join(tmpSrc, 'src', 'index.ts'))
      }))
    })
    .then(inputs => {
      const options = {
        output: { name: 'elements', file: join(DEST_PATH, 'elements', 'bundles', 'elements.umd.js') }
      };
      return rollupDev(inputs, DEST_PATH, options);
    });
};

/**
 * Build all the sources in folder (app, libs, elements)
 * Steps:
 * 1. execute buildElements, buildApp and buildLibs
 */
const buildDevAll = () => {
  return Promise.all([ buildElements(), buildApp(), buildLibs()  ])
};

exports.buildApp = buildApp;
exports.buildLibs = buildLibs;
exports.buildDev = buildDev;
exports.buildElements = buildElements;
exports.buildDevAll = buildDevAll;