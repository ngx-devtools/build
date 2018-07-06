const { join } = require('path');

const { getSrcDirectories } = require('./directories');
const { readPackageFile } = require('./read-package-file');
const { inlineSources } = require('./inline-sources');
const { rollupDev } = require('./rollup-dev');

const { buildElements } = require('./build-elements');

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

const buildLibs = () => {
  const SRC_LIBS_PATH = join('src', 'libs');
  return getSrcDirectories(SRC_LIBS_PATH).then(packages => {
    return Promise.all(packages.map(package => buildDev(package.src, package.dest)));
  });
};

const buildApp = () => {
  const options = {
    src: join('src', 'app', 'package.json'),
    dest: 'dist'
  };
  return buildDev(options.src, options.dest);
};

/**
 * Build all the sources in folder (app, libs, elements)
 * Steps:
 * 1. get all base directories
 * 2. iterate thru base directory
 * 3. on each directory execute the buildDev
 */
const buildDevAll = () => {
  return Promise.all([ buildElements(), buildApp(), buildLibs()  ])
};

exports.buildApp = buildApp;
exports.buildLibs = buildLibs;
exports.buildDev = buildDev;
exports.buildDevAll = buildDevAll;