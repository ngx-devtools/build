import { dirname, basename, join } from 'path';
import { rollup, OutputOptionsFile } from 'rollup';

import { writeFileAsync, mkdirp } from '@ngx-devtools/common';

import { configs } from './rollup-config';

const typescript = require('rollup-plugin-typescript2');
const multiEntry = require('rollup-plugin-multi-entry');
const depsResolve = require('rollup-plugin-node-resolve');

async function rollupBuild({ inputOptions, outputOptions }){
  return rollup(inputOptions)
    .then(bundle => bundle.generate(outputOptions))
    .then(({ code, map }) => {
      mkdirp(dirname(outputOptions.file));
      return Promise.all([ 
        writeFileAsync(outputOptions.file, code + `\n//# sourceMappingURL=${basename(outputOptions.file)}.map`),
        writeFileAsync(outputOptions.file + '.map', map.toString())
      ])
    });
}

async function rollupBuildDev(src: string | string[], dest: string, output?: OutputOptionsFile) {
  const entry = Array.isArray(src) ? src : join(src, 'src', 'index.ts')

  const pkgName = (output) ? output.name: basename(<string>src);
  const file = (output) ? output.file: join((<string>src).replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);
  
  const rollupConfig = {
    inputOptions: {
      input: entry,
      ...configs.inputOptions,
      onwarn: configs.inputOptions.onwarn,
      plugin: [
        multiEntry(),
        typescript({ 
          useTsconfigDeclarationDir: true,
          check: false,
          cacheRoot: join(process.env.APP_ROOT_PATH, 'node_modules/.tmp/.rts2_cache')
        }),
        depsResolve()
      ]
    },
    outputOptions: {
      ...configs.outputOptions, 
      format: 'umd',
      name: pkgName, 
      file: file,
    }
  }

  return rollupBuild(rollupConfig);
}

export { rollupBuild, rollupBuildDev }