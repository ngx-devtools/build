const { join, basename, dirname } = require('path');

const { mkdirp, writeFileAsync } = require('@ngx-devtools/common');
const { rollup } = require('rollup');
const { configs } = require('./rollup.config');
const { readPackageFile } = require('./read-package-file');
const { inlineSources } = require('./inline-sources');
const { getSrcDirectories } = require('./directories');
const { rollupDev } = require('./rollup-dev');

const typescript = require('rollup-plugin-typescript2');
const multiEntry = require('rollup-plugin-multi-entry');

const SRC_ELEMENTS_PATH = join('src', 'elements');


const rollupElements = (src, dest) => {
  const file = join(dest, 'elements', 'bundles', 'elements.umd.js');

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
  return getSrcDirectories(SRC_ELEMENTS_PATH).then(packages => {
      return Promise.all(packages.map(package => {
        return readPackageFile(package.src)
          .then(pkgName => inlineSources(package.src, pkgName))
          .then(tmpSrc => join(tmpSrc, 'src', 'index.ts'))
      }))
    }).then(inputs => {
      const options = {
        input: { input: inputs },
        output: {
          name: 'elements',
          file: join(dest, 'elements', 'bundles', 'elements.umd.js')
        }
      }
      return rollupDev()
    });
};

exports.buildElements = buildElements;