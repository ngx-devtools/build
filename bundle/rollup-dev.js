const { join, basename, dirname } = require('path');
const { existsSync } = require('fs');

const { mkdirp, writeFileAsync } = require('@ngx-devtools/common');
const { rollup } = require('rollup');
const { configs } = require('./rollup.config');

const typescript = require('rollup-plugin-typescript2');
const multiEntry = require('rollup-plugin-multi-entry');

/**
 * bundle the component using rollup
 * @param {temporary source files of the elements|libs|app} src 
 * @param {destination path of the output file} dest 
 */
const rollupDev = (src, dest, options = {}) => {
  const main = join(src, 'src', 'main.ts');
  const entry = existsSync(main) ? main : join(src, 'src', 'index.ts');
  
  const pkgName = basename(src);
  const file = join(src.replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);

  const inputOptions = { 
    input: entry,
    ...configs.inputOptions,
    plugins: [
      multiEntry(),
      typescript({ 
        useTsconfigDeclarationDir: true,
        check: false,
        cacheRoot: join(process.env.APP_ROOT_PATH, 'node_modules/.tmp/.rts2_cache')
      })
    ],
    onwarn: configs.onwarn,
    ...options.input
  };
  
  const outputOptions = { 
    ...configs.outputOptions, 
    format: 'umd',
    name: pkgName, 
    file: file,
    ...options.output
  };

  return rollup(inputOptions)
    .then(bundle => bundle.generate(outputOptions))
    .then(({ code, map }) => {
      mkdirp(dirname(outputOptions.file));
      return Promise.all([ 
        writeFileAsync(outputOptions.file, code + `\n//# sourceMappingURL=${basename(outputOptions.file)}.map`),
        writeFileAsync(outputOptions.file + '.map', map.toString())
      ])
    });
};

exports.rollupDev = rollupDev;