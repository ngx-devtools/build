const path = require('path');
const fs = require('fs');

const { writeFileAsync, mkdirp, memoize } = require('@ngx-devtools/common');
const { rollup } = require('rollup');

const { rollupConfigs } = require('./rollup.config');

const rollupConfigCachePath = path.resolve('node_modules/.tmp/cache/rollup.config.json');
const rollupConfigCache = fs.existsSync(rollupConfigCachePath) ? require(rollupConfigCachePath) : {};

const bundleRollup = async (config, dest) => {
  const bundle = await rollup(config.inputOptions);
  const { code, map } = await bundle.generate(config.outputOptions);
  const bundlePath = path.resolve(dest);
  mkdirp(path.dirname(bundlePath));
  return Promise.all([ 
    writeFileAsync(bundlePath, code + `\n//# sourceMappingURL=${path.basename(bundlePath)}.map`),
    writeFileAsync(bundlePath + '.map', map.toString())
  ]);
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

module.exports = (tmpSrc, dest) => {
  const rollupConfig = rollupConfigs(tmpSrc, dest); 
  return Promise.all(rollupConfig.overrides.map(override => {
    return enableCache(rollupConfig, override).then(config => {
      return bundleRollup(config, override.output.file);
    }) 
  }))
};