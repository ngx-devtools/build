const path = require('path');

const resolve = require('rollup-plugin-node-resolve');
const { uglify } = require('../rollup-plugins/uglify');

const { writeFileAsync, mkdirp } = require('@ngx-devtools/common');

const { rollup } = require('rollup');
const { rollupConfigs, configs } = require('./rollup.config');

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
    external: [],
    onwarn: configs.inputOptions.onwarn,
    plugins: [ resolve({ jsnext: true, main: true, browser: true }), uglify() ]
  });
  const outputOptions = Object.assign({}, options.outputOptions, { globals: {} });
  return rollup(inputOptions)
    .then(bundle => bundle.generate(outputOptions))
    .then(({ code, map }) => {
      const bundlePath = path.resolve(options.outputOptions.file);
      const minifyPath = path.join(path.dirname(bundlePath), path.basename(bundlePath, '.js') + '.min.js');
      mkdirp(path.dirname(minifyPath));
      return Promise.all([
        writeFileAsync(minifyPath, code + `\n//# sourceMappingURL=${path.basename(minifyPath)}.map`),
        writeFileAsync(minifyPath + '.map', map)
      ]);       
    })
};

const bundleCode = (tmpSrc, dest) => {
  const rollupConfig = rollupConfigs(tmpSrc, dest); 
  return Promise.all(rollupConfig.overrides.map(override => {
    const config = rollupConfig.create(override.input, override.output);
    const inputOptions = Object.assign({}, config.inputOptions, { 
      plugins: configs.inputOptions.plugins, 
      onwarn: configs.inputOptions.onwarn 
    });
    const options = { inputOptions: inputOptions, outputOptions: config.outputOptions };
    return Promise.all([
      ((config.outputOptions.format === 'umd') 
        ? writeBundle(options) : Promise.resolve()), 
      bundleRollup(options)
    ]);
  }))
};

exports.bundleCode = bundleCode;