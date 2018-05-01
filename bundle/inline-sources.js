const path = require('path');

const { mkdirp, getFiles, readFileAsync, writeFileAsync, inlineResourcesFromString } = require('@ngx-devtools/common');

const argv = require('yargs')
  .option('main', { default: 'main', type: 'string' })
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
* Copy all inline files
* @param {list of files} files 
* @param {destination of the output file} dest 
*/
const inlineSources = (src, pkgName) => {
  const files = getFiles(path.join(src, '**/*.ts'));
  return Promise.all(files.map(filePaths => {
    return Promise.all(filePaths.map(file => 
      copyFileAsync(file, file.replace('src', '.tmp')
        .replace(`/${argv.libs}/${pkgName}`, `/${pkgName}/src`)
        .replace(`/app`, `/${pkgName}/src`)
      )
    ));
  }));
};

exports.inlineSources = inlineSources;