import { sep, join, basename, dirname } from 'path';

import { inlineResource, globFiles, rollupBuild, createRollupConfig } from '@ngx-devtools/common';

import { readPackageFile } from './read-package-file';
import { configs } from './rollup-config';

const getTempPath = (file: string, pkgName: string) => {
  const tempSource = `.tmp\/${pkgName}\/src`;
  return file.replace(process.env.APP_ROOT_PATH + sep, '') 
    .replace('src' + sep, '')
    .replace('elements' + sep, '')
    .replace('libs' + sep, '')
    .replace(join(pkgName, 'src'), tempSource)
    .replace(`app`, tempSource);
}

async function rollupDev(src: any, dest: string, options?: any){ 
  const entry = Array.isArray(src) ? src : join(src, 'src', 'index.ts');

  const pkgName = (options && options.output) ? options.output.name: basename(src);
  const file = (options && options.output) 
    ? options.output.file
    : join(src.replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);

  const rollConfig = createRollupConfig({
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

  return rollupBuild(rollConfig)
    .catch(error => console.error(error));
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

export { buildDev, inlineSources, getTempPath, rollupDev }