const path = require('path');

const { getFiles, mkdirp, copyFile} = require('@ngx-devtools/common');

/**
 * Copy .d.ts and .json files
 * @param {*} tmpSrc 
 * @param {*} dest 
 */
const copyAssetFiles = (tmpSrc, dest) => {
  const src = [ `${tmpSrc}/esm2015/**/*.d.ts`, `${tmpSrc}/esm2015/*.json` ];
  const files = getFiles(src).join(',').split(',');
  return Promise.all(files.map(file => {
    const destPath = file.replace('.tmp', dest).replace(path.sep + 'esm2015', '');
    mkdirp(path.dirname(destPath));
    return copyFile(file, destPath);
  }));
};

exports.copyAssetFiles = copyAssetFiles;