const path = require('path');

const { readFileAsync, writeFileAsync, mkdirp } = require('@ngx-devtools/common');
const getPkgName = require('../utils/pkg-name');

/**
 * This will copy package.json file to the dist directory
 * @param {source directory of package.json} src 
 * @param {destination where to write file} dest 
 */
const copyPackageFile = (src, dest) => {
  const filePath = path.join(path.resolve(src.replace('/**/*.ts', '')), 'package.json');
  return readFileAsync(filePath)
    .then(content => {
      const pkg = JSON.parse(content);
      const pkgName = getPkgName(pkg);

      Object.assign(pkg, {
        main: `./bundles/${pkgName}.umd.js`,
        module: `./esm2015/${pkgName}.js`, 
        typings: `./${pkgName}.d.ts` 
      });

      content = JSON.stringify(pkg, '\t', 2);
      const destPath = path.join(path.resolve(dest), pkgName, 'package.json');
      mkdirp(path.dirname(destPath));
      return writeFileAsync(destPath, content).then(() => Promise.resolve(pkgName));
    });
}

exports.copyPackageFile = copyPackageFile;