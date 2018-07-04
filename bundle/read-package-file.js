const { sep, join, basename } = require('path');
const { readFileAsync, memoize  } = require('@ngx-devtools/common');

const getPkgName = memoize(require('../utils/pkg-name'));

const readPackageFile = src => {
  const source = src.split(sep).join('/').replace('/**/*.ts', '');
  const filePath = (basename(source).includes('package.json')) ? source : join(source, 'package.json');
  return readFileAsync(filePath, 'utf8')
    .then(content => {
      const pkg = JSON.parse(content);
      return Promise.resolve(getPkgName(pkg));
    });
};

exports.readPackageFile = readPackageFile;