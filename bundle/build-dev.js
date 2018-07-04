const path = require('path');
const fs = require('fs');

const { rollup } = require('rollup');
const { configs } = require('./rollup.config');
const { inlineSources } = require('./inline-sources');
const { getSrcDirectories } = require('./directories');
const { mkdirp, writeFileAsync, memoize } = require('@ngx-devtools/common');
const { readPackageFile } = require('./read-package-file');

const typescript = require('rollup-plugin-typescript2');

const getFolderTempBaseDir = (dest, pkgName) => {
  const destSrc = path.resolve(dest);
  return path.join(destSrc.replace(path.basename(destSrc), '.tmp'), pkgName);
};


const rollupDev = (src, dest) => {
  const inputOptions = { 
    ...configs.inputOptions,
    plugins: [
      typescript({ 
        useTsconfigDeclarationDir: true,
        check: false,
        cacheRoot: path.resolve('node_modules/.tmp/.rts2_cache')
      })
    ],
    onwarn: configs.onwarn
  };
  
  const outputOptions = {
    ...configs.outputOptions,
    format: 'umd'
  };
  const main = path.join(src, 'src', 'main.ts');
  const entry = fs.existsSync(main) ? main : path.join(src, 'src', 'index.ts');
  return rollup({ ...inputOptions, ...{ input: entry } })
    .then(async bundle => {
      const tmpSrcDir = path.dirname(entry);
      const pkgName = path.basename(tmpSrcDir.replace('src', ''))
      const file = path.join(tmpSrcDir.replace('.tmp', dest).replace('src', 'bundles'), `${pkgName}.umd.js`);
      const { code, map } = await bundle.generate({ ...outputOptions, ...{ name: pkgName, file: file } });
      mkdirp(path.dirname(file));
      return Promise.all([ 
        writeFileAsync(file, code + `\n//# sourceMappingURL=${path.basename(file)}.map`),
        writeFileAsync(file + '.map', map.toString())
      ])
    });
};

const buildDev = (src, dest) => {
  return readPackageFile(src)
    .then(pkgName => {
      const destSrc = path.resolve(dest);
      const folderTempBaseDir = path.join(destSrc.replace(path.basename(destSrc), '.tmp'), pkgName);
      return inlineSources(src, pkgName)
        .then(() => Promise.resolve(folderTempBaseDir));
    })
    .then(tmpSrc => rollupDev(tmpSrc, dest));
};

const buildDevPackage = (srcPkg, dest) =>  {
  return readPackageFile(srcPkg)
    .then(async pkgName => {
      await inlineSources(path.join(path.dirname(srcPkg), '**/*.ts').split(path.sep).join('/'), pkgName);
      return Promise.resolve()
    })
    .then(tmpSrc => rollupDev(tmpSrc, dest));
};

const buildDevAll = () => {
  return getSrcDirectories().then(directories => {
    const folders = directories.map(folder => 
      Object.assign(folder, { src: folder.src.split(path.sep).join('/') + '/**/*.ts' })
    );
    return Promise.all(folders.map(folder => buildDev(folder.src, folder.dest)));
  }).catch(error => console.error(error));
};

exports.buildDevPackage = buildDevPackage;
exports.buildDev = buildDev;
exports.buildDevAll = buildDevAll;