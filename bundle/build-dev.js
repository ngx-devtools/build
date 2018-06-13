const path = require('path');
const fs = require('fs');

const { rollup } = require('rollup');
const { configs } = require('./rollup.config');
const { inlineSources } = require('./inline-sources');
const { getSrcDirectories } = require('./directories');
const { mkdirp, writeFileAsync, readFileAsync } = require('@ngx-devtools/common');

const typescript = require('rollup-plugin-typescript2');
const rxjsAutoPlugin = require('../rollup-plugins/rxjs');

const getPkgName = require('../utils/pkg-name');

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

  const entry = path.join(src, 'src', 'index.ts');
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
}

const readPackageFile = src => {
  const source = src.split(path.sep).join('/').replace('/**/*.ts', '');
  const filePath = path.join(source, 'package.json');
  return readFileAsync(filePath, 'utf8')
    .then(content => {
      const pkg = JSON.parse(content);
      return Promise.resolve(getPkgName(pkg));
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

const buildDevAll = () => {
  return getSrcDirectories().then(directories => {
    const folders = directories.map(folder => 
      Object.assign(folder, { src: folder.src.split(path.sep).join('/') + '/**/*.ts' })
    );
    return Promise.all(folders.map(folder => buildDev(folder.src, folder.dest)));
  }).catch(error => console.error(error));
};

exports.buildDev = buildDev;
exports.buildDevAll = buildDevAll;