const { join, basename, dirname } = require('path');
const { existsSync } = require('fs');

const { mkdirp, writeFileAsync, readdirAsync } = require('@ngx-devtools/common');
const { rollup } = require('rollup');
const { configs } = require('./rollup.config');
const { readPackageFile } = require('./read-package-file');
const { inlineSources } = require('./inline-sources');

const typescript = require('rollup-plugin-typescript2');
const multiEntry = require('rollup-plugin-multi-entry');

const getElements = (src) => {   
  const getSource = (directory) => {
    return (util.isString(directory)) 
      ? { src: directory.replace('/**/*.ts', ''), dest: 'dist' }
      : { src: directory.src.replace('/**/*.ts', ''), dest: directory.dest }
  };
  const readdir = (srcDir) => {
    return readdirAsync(srcDir)
      .then(files => {
        const filePath = (file) => path.join(path.resolve(), srcDir, file);
        const directories = files.filter(file => fs.statSync(filePath(file)).isDirectory());
        return directories.map(directory => getSource(path.join(srcDir, directory, 'package.json')));
      });
  };
  return readdir(src);
};

const rollupElements = (src, dest) => {
  const file = join(src.replace('.tmp', dest), 'bundles', 'elements.umd.js');

  const inputOptions = { 
    input: src,
    ...configs.inputOptions,
    plugins: [
      multiEntry(),
      typescript({ 
        useTsconfigDeclarationDir: true,
        check: false,
        cacheRoot: join(process.env.APP_ROOT_PATH, 'node_modules/.tmp/.rts2_cache')
      })
    ],
    onwarn: configs.onwarn
  };
  
  const outputOptions = { 
    ...configs.outputOptions, 
    format: 'umd',
    name: 'elements', 
    file: file
  };

  return rollup(inputOptions)
    .then(bundle => bundle.generate(outputOptions))
    .then(({ code, map }) => {
      mkdirp(dirname(file));
      return Promise.all([ 
        writeFileAsync(file, code + `\n//# sourceMappingURL=${basename(file)}.map`),
        writeFileAsync(file + '.map', map.toString())
      ])
    });
};

const buildElements = () => {
  return getElements('src/elements').then(packages => {
      return Promise.all(packages.map(package => {
        return readPackageFile(package.src)
          .then(pkgName => inlineSources(package.src, pkgName))
          .then(tmpSrc => path.join(tmpSrc, 'src', 'index.ts'))
      }))
    }).then(inputs => rollupElements(inputs, 'dist');
};

exports.rollupElements = rollupElements;
exports.getElements = getElements;
exports.buildElements = buildElements;