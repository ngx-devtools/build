
const path = require('path');
const fs = require('fs');

const misc = require('../utils/misc.json');

const { writeFileAsync, mkdirp } = require('@ngx-devtools/common');

const updateEntryFile = (dest) => {
  const src = path.join(dest, 'src', 'main.ts');
  const entryFile = () => (!(fs.existsSync(src)) 
    ? writeFileAsync(path.join(dest, 'public_api.ts'), "export * from './src/index';") 
    : Promise.resolve());
  return entryFile().then(() => Promise.resolve(dest));
};

const copyEntryFiles = (dest) => {
  return Promise.all(Object.keys(misc).map(file => {
    const pkgName = path.basename(dest);
    const content = misc[file].replace('package-name-js', `${pkgName}.js`).replace('package-name', pkgName);
    const pathFile = path.join(dest, file);
    mkdirp(path.dirname(pathFile));
    return (fs.existsSync(pathFile)) ? Promise.resolve() : writeFileAsync(pathFile, content);    
  }));
};

const copyEntry = (pkgName) => {
  const tempSrc = path.join('.tmp', pkgName);
  return copyEntryFiles(tempSrc).then(() => updateEntryFile(tempSrc));
};

exports.copyEntry = copyEntry;
exports.updateEntryFile = updateEntryFile;
exports.copyEntryFiles = copyEntryFiles;