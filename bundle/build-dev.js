const { sep } = require('path');

const { getSrcDirectories } = require('./directories');
const { readPackageFile } = require('./read-package-file');
const { inlineSources } = require('./inline-sources');
const { rollupDev } = require('./rollup-dev');

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
 * Build all the sources in folder (app, libs, elements)
 * Steps:
 * 1. get all base directories
 * 2. iterate thru base directory
 * 3. on each directory execute the buildDev
 */
const buildDevAll = () => {
  return getSrcDirectories().then(directories => {
    const folders = directories.map(folder => 
      Object.assign(folder, { src: folder.src.split(sep).join('/') + '/**/*.ts' })
    );
    return Promise.all(folders.map(folder => buildDev(folder.src, folder.dest)));
  }).catch(error => console.error(error));
};

exports.buildDev = buildDev;
exports.buildDevAll = buildDevAll;