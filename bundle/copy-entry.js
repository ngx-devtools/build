
const path = require('path');
const fs = require('fs');

const getPkgName = require('../utils/pkg-name')
const misc = require('../utils/misc.json');

const { writeFileAsync, mkdirp } = require('@ngx-devtools/common');

const copyEntryFiles = (dest) => {
  return Promise.all(Object.keys(misc).map(file => {
    const pkgName = path.basename(dest);
    const content = misc[file].replace('package-name-js', pkgName).replace('package-name', `${pkgName}.js`);
    const pathFile = path.join(dest, file);
    mkdirp(path.dirname(pathFile));
    return (fs.existsSync(pathFile)) ? Promise.resolve() : writeFileAsync(pathFile, content);    
  }));
};

exports.copyEntryFiles = copyEntryFiles;