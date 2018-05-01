const path = require('path');

const { writeFileAsync, mkdirp} = require('@ngx-devtools/common');
const { rollup } = require('rollup');

const { inputOptions, outputOptions } = require('./rollup-config');

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

const createConfig = (format) => {
  return { 
    inputOptions: { ...inputOptions, ...format.input },
    outputOptions: { ...outputOptions, ...format.output }
  };
};

module.exports = (folder, dest) => {
  const formats = [{ 
      input: { input: `.tmp/${folder}/esm5/${folder}.js` }, 
      output: { name: folder, file: `${dest}/${folder}/esm5/${folder}.js` },
    }, { 
      input: { input: `.tmp/${folder}/esm2015/${folder}.js` }, 
      output: { name: folder, file: `${dest}/${folder}/esm2015/${folder}.js` }
  }, {
    input: { input: `.tmp/${folder}/esm5/${folder}.js` }, 
    output: { format: 'umd', name: folder, file: `${dest}/${folder}/bundles/${folder}.umd.js` }
  }];
  return Promise.all(formats.map(format => bundleRollup(createConfig(format), format.output.file)));
};