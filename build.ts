import { join, resolve, dirname } from 'path';

import { rollup, OutputChunk  } from 'rollup';
import { clean, writeFileAsync, mkdirp, readFileAsync } from '@ngx-devtools/common';

const depsResolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');

function createRollupConfig (formats: string[]) {
  return formats.map(format => {
    return {
      inputOptions: {
        input: 'src/build.ts',
        treeshake: true,
        plugins: [
          typescript({
            tsconfig: 'src/tsconfig.json',
            check: false,
            cacheRoot: join(resolve(), 'node_modules/.tmp/.rts2_cache'), 
            useTsconfigDeclarationDir: false
          }),
          depsResolve()
        ],
        external: [ 
          'fs', 
          'util', 
          'path', 
          'tslib', 
          '@ngx-devtools/common',
          'rollup-plugin-typescript2',
          'rollup-plugin-multi-entry',
          'rollup-plugin-node-resolve',
          'rollup'
        ],
        onwarn (warning) {
          if (warning.code === 'THIS_IS_UNDEFINED') { return; }
          console.log("Rollup warning: ", warning.message);
        }
      },
      outputOptions: {
        sourcemap: false,
        file: 'dist/build.js',
        format: format
      }
    }
  });
}

async function rollupBuild({ inputOptions, outputOptions }): Promise<OutputChunk> {
  return rollup(inputOptions).then(bundle => bundle.write(outputOptions));
}

async function copyPkgFile() {
  const pkgFilePath = resolve('package.json');
  return readFileAsync(pkgFilePath, 'utf8')
    .then(contents => {
      const destPath = resolve('dist/package.json');
      mkdirp(dirname(destPath));
      const pkgContent = JSON.parse(contents);
      delete(pkgContent.scripts);
      delete(pkgContent.devDependencies);
      const pkg = { 
        ...pkgContent,  
        ...{ typings: 'build.d.ts' },
        ...{ main: 'build.js' }
      };
      return writeFileAsync(destPath, JSON.stringify(pkg, null, 2));
    });
}

Promise.all([ clean('dist') ]).then(() => {
  const formats = [ 'cjs' ]
  return Promise.all([ copyPkgFile(), Promise.all(createRollupConfig(formats).map(config => rollupBuild(config)))])
});