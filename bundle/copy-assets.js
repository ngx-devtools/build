const path = require('path');
const fs = require('fs');

const { getFiles, mkdirp, copyFile} = require('@ngx-devtools/common');

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
    const destPath = pathFile.replace('.tmp', dest).replace(path.sep + 'esm2015', '');
    mkdirp(path.dirname(destPath));
    return copyFile(pathFile, destPath);
  }));
};

exports.copyAssetFiles = copyAssetFiles;