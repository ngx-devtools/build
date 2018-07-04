const path = require('path');

const { mkdirp, getFiles, readFileAsync, writeFileAsync, inlineResourcesFromString } = require('@ngx-devtools/common');

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
  return file.replace(process.env.APP_ROOT_PATH + path.sep, '') 
    .replace('src' + path.sep, '')
    .replace(pkgName, tempSource)
    .replace('libs' + path.sep, '')
    .replace('elements' + path.sep, '')
    .replace(`app`, tempSource);
};

/**
 * get the source file, check if source file has package.json
 * @param {base path director of the source} src 
 */
const getSourceFile = (src) => {
  return src.includes('package.json') 
    ? path.join(path.dirname(src), '**/*.ts').split(path.sep).join('/')
    : src; 
};

/**
* Copy all inline files
* @param {list of files} files 
* @param {destination of the output file} dest 
*/
const inlineSources = (src, pkgName) => {
  const files = getFiles(getSourceFile(src)).join(',').split(',');
  return Promise.all(files.map(file =>
    copyFileAsync(file, getTempPath(file.replace(`${pkgName}${path.sep}src`, pkgName), pkgName))
  )).then(() => path.join('.tmp', pkgName));
};

exports.inlineSources = inlineSources;