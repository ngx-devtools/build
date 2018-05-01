const path = require('path');
const fs = require('fs');

const copyFile = require('util').promisify(fs.copyFile);

const { getFiles, mkdirp} = require('@ngx-devtools/common');

/**
 * 
 * @param {*} tmpSrc 
 * @param {*} dest 
 */
const copyAssetFiles = (tmpSrc, dest) => {
  const files = getFiles([ `${tmpSrc}/esm2015/**/*.d.ts`, `${tmpSrc}/esm2015/*.json` ]);
  const paths = files.map(file => {
    const values = [];
    file.forEach(value => values.push(value));
    return values.join(',');
  })
  .join(',')
  .split(',');
  return Promise.all(paths.map(pathFile => {
    const destPath = pathFile.replace('.tmp', dest).replace('\/esm2015', '');
    mkdirp(path.dirname(destPath));
    return copyFile(pathFile, destPath);
  }));
};

exports.copyAssetFiles = copyAssetFiles;