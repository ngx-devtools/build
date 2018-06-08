const path = require('path');
const fs = require('fs');

const { rollup } = require('rollup');
const { writeFileAsync, mkdirp } = require('@ngx-devtools/common');

const { rollupConfigs, configs } = require('./rollup.config');
const { minifyUmd } = require('./minify-umd');

const rollupConfigCachePath = path.resolve('node_modules/.tmp/cache/rollup.config.json');
const rollupConfigCache = fs.existsSync(rollupConfigCachePath) ? require(rollupConfigCachePath) : {};

const resolve = require('rollup-plugin-node-resolve');
const { gzip } = require('../rollup-plugins/gzip');

const bundleRollup = async (config, dest) => {
  return updateInputOptions(config)
    .then(inputOptions => rollup(inputOptions))
    .then(bundle => bundle.generate(
      (config.outputOptions.format.includes('umd')) 
        ? Object.assign({}, config.outputOptions, { globals: {} }) 
        : config.outputOptions
      )
    )
    .then(({ code, map }) => {
      const bundlePath = path.resolve(dest);
      mkdirp(path.dirname(bundlePath));
      return Promise.all([ 
        ((config.outputOptions.format === 'umd') 
          ? minifyUmd(code, bundlePath) 
          : Promise.resolve()), 
        writeFileAsync(bundlePath, code + `\n//# sourceMappingURL=${path.basename(bundlePath)}.map`),
        writeFileAsync(bundlePath + '.map', map.toString())
      ])
    });
};

const updateInputOptions = config => {
  const inputOptions = Object.assign({}, config.inputOptions);
  [ 'onwarn', 'plugins' ].forEach(value => { 
    inputOptions[value] = configs.inputOptions[value]
  });
  if (config.outputOptions.format.includes('umd')) {
    Object.assign(inputOptions, { external: [] });
    inputOptions.plugins = [
      resolve({ jsnext: true, main: true, browser: true }),
      gzip()
    ];
  }
  return Promise.resolve(inputOptions);
};

const enableCache = (rollupConfig, override) => {
  return (rollupConfigCache[override.output.file] === undefined)
    ? (() => {
      rollupConfigCache[override.output.file] = rollupConfig.create(override.input, override.output);
      mkdirp(path.dirname(rollupConfigCachePath));
      return writeFileAsync(rollupConfigCachePath, JSON.stringify(rollupConfigCache))
          .then(() => Promise.resolve(rollupConfigCache[override.output.file]));
    })() 
    : Promise.resolve(rollupConfigCache[override.output.file]);
};

// module.exports = (tmpSrc, dest) => {
//   const rollupConfig = rollupConfigs(tmpSrc, dest); 
//   return Promise.all(rollupConfig.overrides.map(override => {
//     return enableCache(rollupConfig, override).then(config => {
//       updateInputOptions(config); 
//       return bundleRollup(config, override.output.file);
//     }) 
//   }))
// };

module.exports = require('./rollup.code-split').bundleCode;