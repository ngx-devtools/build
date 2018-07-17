import { sep, join, basename, dirname } from 'path';
import { rollup } from 'rollup';

import { inlineResource, globFiles, createRollupConfig, mkdirp, writeFileAsync } from '@ngx-devtools/common';

import { readPackageFile } from './read-package-file';
import { configs } from './rollup-config';

function getTempPath(file: string, pkgName: string){
  const tempSource = `.tmp\/${pkgName}\/src`;
  return file.replace(process.env.APP_ROOT_PATH + sep, '') 
    .replace('src' + sep, '')
    .replace('elements' + sep, '')
    .replace('libs' + sep, '')
    .replace(join(pkgName, 'src'), tempSource)
    .replace(`app`, tempSource);
}

async function rollBuildDev({ inputOptions, outputOptions }) {
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

async function rollupDev(src: any, dest: string, options?: any){ 
  const entry = Array.isArray(src) ? src : join(src, 'src', 'index.ts');

  const pkgName = (options && options.output) ? options.output.name: basename(src);
  const file = (options && options.output) 
    ? options.output.file
    : join(src.replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);

  const rollupConfig = createRollupConfig({
    input: entry,
    overrideExternal: true,
    external: configs.inputOptions.external,
    output: {
      file: file,
      format: 'umd',
      name: pkgName,
      dir: dirname(file),
      ...configs.outputOptions,
    }
  })

  return rollBuildDev(rollupConfig);
}

async function inlineSources(src: string | string[], pkgName: string){
  return globFiles(src).then(files => {
    return Promise.all(files.map(file => { 
      return inlineResource(file, getTempPath(file, pkgName)) 
    }))
  }).then(() => join('.tmp', pkgName))
}

async function buildDev(src: string, dest: string) {
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
    .then(tmpSrc => rollupDev(tmpSrc, dest))
}

export { buildDev, inlineSources, getTempPath, rollupDev, rollBuildDev }