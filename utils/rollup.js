const path = require('path');
const fs = require('fs');

const { writeFileAsync, mkdirp, memoize } = require('@ngx-devtools/common');
const { rollup } = require('rollup');

const { rollupConfigs } = require('../bundle/rollup.config');

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

const writeToCache = async (rollupConfig, override) => {
  console.log(override);
  rollupConfigCache[override.input.input] = rollupConfig.create(override.input, override.output);
  await writeFileAsync(rollupConfigCachePath, rollupConfigCache);
  return rollupConfigCache[override.input.input];
};

module.exports = (tmpSrc, dest) => {
  const rollupConfig = rollupConfigs(tmpSrc, dest); 
  return Promise.all(rollupConfig.overrides.map(async (override) => {
    const config = (rollupConfigCache[override.input.input] === undefined) 
      ? rollupConfigCache[override.input.input] 
      : await writeToCache(rollupConfig, override);
    await bundleRollup(config, override.output.file)
  }))
};