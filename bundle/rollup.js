const path = require('path');
const resolve = require('rollup-plugin-node-resolve');

const { writeFileAsync, mkdirp } = require('@ngx-devtools/common');

const { rollup } = require('rollup');
const { rollupConfigs, configs } = require('./rollup.config');
const { uglify } = require('../rollup-plugins/uglify');

const getMinFile = file => 
  path.join(path.dirname(file), path.basename(file, '.js') + '.min.js');

const bundleRollup = (options) => {
  return rollup(options.inputOptions)
    .then(bundle => bundle.generate(options.outputOptions))
    .then(({ code, map }) => {
      const bundlePath = path.resolve(options.outputOptions.file);
      mkdirp(path.dirname(bundlePath));
      return Promise.all([
        writeFileAsync(bundlePath, code + `\n//# sourceMappingURL=${path.basename(bundlePath)}.map`),
        writeFileAsync(bundlePath + '.map', map.toString())
      ]);  
    }) 
};

const writeBundle = (options) => {
  const inputOptions = Object.assign({}, options.inputOptions, { 
    external: [], plugins: options.inputOptions.plugins.concat(uglify())
  });
  const outputOptions = Object.assign({}, options.outputOptions, { 
    globals: {}, file: getMinFile(options.outputOptions.file)
  });
  return bundleRollup({ inputOptions: inputOptions, outputOptions: outputOptions });
};

const bundleCode = (tmpSrc, dest) => {
  const rollupConfig = rollupConfigs(tmpSrc, dest); 
  return Promise.all(rollupConfig.overrides.map(override => {
    const config = rollupConfig.create(override.input, override.output);
    const inputOptions = Object.assign({}, config.inputOptions, { 
      plugins: [ resolve() ], 
      onwarn: configs.inputOptions.onwarn 
    });
    const options = { 
      inputOptions: inputOptions, 
      outputOptions: config.outputOptions
    };
    return Promise.all([
      ((config.outputOptions.format === 'umd') 
          ? writeBundle(options) 
          : Promise.resolve()), 
      bundleRollup(options)
    ]);
  }))
};

module.exports = bundleCode;