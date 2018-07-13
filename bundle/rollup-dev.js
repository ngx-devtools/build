const { join, basename, dirname } = require('path');

const { mkdirp, writeFileAsync } = require('@ngx-devtools/common');
const { rollup } = require('rollup');

const typescript = require('rollup-plugin-typescript2');
const multiEntry = require('rollup-plugin-multi-entry');
const depsResolve = require('rollup-plugin-node-resolve');

const { configs } = require('./rollup.config');

/**
 * bundle the component using rollup
 * @param {temporary source files of the elements|libs|app} src 
 * @param {destination path of the output file} dest 
 */
const rollupDev = (src, dest, options = {}) => {
  const entry = Array.isArray(src) ? src : join(src, 'src', 'index.ts')
  
  const pkgName = (options.output) ? options.output.name: basename(src);
  const file = (options.output) 
    ? options.output.file
    : join(src.replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);

  const inputOptions = { 
    input: entry,
    ...configs.inputOptions,
    plugins: [
      multiEntry(),
      typescript({ 
        useTsconfigDeclarationDir: true,
        check: false,
        cacheRoot: join(process.env.APP_ROOT_PATH, 'node_modules/.tmp/.rts2_cache')
      }),
      depsResolve()
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