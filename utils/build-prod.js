const fs = require('fs');
const path = require('path');

const { 
  getFiles, 
  getSource, 
  mkdirp, 
  readFileAsync,
  writeFileAsync,
  inlineResourcesFromString
} = require('@ngx-devtools/common');

const config = require('./build-config');
const destTransform = require('./dest-transform');

const copyFilesAsync = (files, dest) => Promise.all(files.map(file => inlineFileAsync(file, dest)));

const copyFileAsync = (file, dest) => {
  const destPath = file.replace(getSource(file), dest);
  mkdirp(path.dirname(destPath));
  return readFileAsync(file, 'utf8')
    .then(content => inlineResourcesFromString(content, url => path.join(path.dirname(file), url)))
    .then(content => Promise.all([ Promise.resolve(content), writeFileAsync(destPath, content) ]));
};

/**
 * Inline templateUrl path to html text, inline stylesUrl to css text
 * convert the scss path to css
 * @param {ts source file} file 
 * @param {destination of inline ts file} dest 
 */
const inlineFileAsync = (file, dest) => {
  return copyFileAsync(file, '.tmp')
    .then(contents => {
      const tempPath = file.replace(getSource(file), '.tmp');
      const cachePath = file.replace(getSource(file), config.cacheBaseDir);
      const hasCache = (fs.existsSync(cachePath) && fs.statSync(tempPath).size === fs.statSync(cachePath).size)
      return (hasCache) ? Promise.resolve() 
        : Promise.all([ 
          Promise.resolve(tempPath),
          new Promise((resolve, reject) => {
            mkdirp(path.dirname(cachePath)); resolve();
          })
          .then(() => writeFileAsync(cachePath, contents[0]))
        ]);
    });
};

/**
 * BuildAsync files
 * @param {source of typescript file} src 
 * @param {destination where to write or save transpile file} dest 
 */
const buildProd = (src, dest) => {
  const files = getFiles(src || config.build.src);
  const destPath = dest || config.build.dest;
  return Promise.all(files.map(filePaths => copyFilesAsync(filePaths, destPath)))
    .then(results => {
      const files = results[0].filter(result => Array.isArray(result)).map(result =>  result[0]);
    });
};

module.exports = buildProd;