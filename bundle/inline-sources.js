const path = require('path');

const { mkdirp, getFiles, readFileAsync, writeFileAsync, inlineResourcesFromString } = require('@ngx-devtools/common');

const argv = require('yargs')
  .option('libs', { default: 'libs', type: 'string' })
  .argv;

/**
* It will inline a template and style
* @param {src file to be inline} file 
* @param {destination of of the file} dest 
*/
const copyFileAsync = (file, dest) => {
  mkdirp(path.dirname(dest));
  return readFileAsync(file, 'utf8')
    .then(content => inlineResourcesFromString(content, url => path.join(path.dirname(file), url)))
    .then(content => writeFileAsync(dest, content));
};

/**
 * Generate temporary path
 * @param {source file} file 
 * @param {package name} pkgName 
 */
const getTempPath = (file, pkgName) => {
  const tempSource = `.tmp\/${pkgName}\/src`;
  return file.replace(path.resolve() + '\/', '')
    .replace('src\/', '')
    .replace(pkgName, tempSource)
    .replace(argv.libs + '\/', '')
    .replace(`app`, tempSource);
}

/**
* Copy all inline files
* @param {list of files} files 
* @param {destination of the output file} dest 
*/
const inlineSources = (src, pkgName) => {
  const files = getFiles(src);
  return Promise.all(files.map(filePaths => {
    return Promise.all(filePaths.map(file =>
      copyFileAsync(file, getTempPath(file, pkgName))
    ));
  }));
};

exports.inlineSources = inlineSources;