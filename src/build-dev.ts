import { sep, join, basename, dirname } from 'path';

import { inlineResource, globFiles, createRollupConfig, rollBuildDev } from '@ngx-devtools/common';

import { readPackageFile } from './read-package-file';
import { getSrcDirectories } from './directories';
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

function getSourceFile(src){
  return src.includes('package.json') 
    ? join(dirname(src), '**/*.ts').split(sep).join('/')
    : src; 
};

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
  return globFiles(getSourceFile(src)).then(files => {
    return Promise.all(files.map(file => { 
      return inlineResource(file, getTempPath(file, pkgName)) 
    }))
  }).then(() => join('.tmp', pkgName))
}

async function buildDev(src: string, dest: string){
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
    .then(tmpSrc => rollupDev(tmpSrc, dest))
}

async function buildElements(src: string, dest?: string){
  const packages = await getSrcDirectories(src);
  return Promise.all(packages.map(pkg => {
    return readPackageFile(pkg.src)
      .then(pkgName => inlineSources(pkg.src, pkgName))
      .then(tmpSrc => join(tmpSrc, 'src', 'index.ts'))
  }))
  .then(inputs => {
    const elements = basename(src), destPath = dest || 'dist';
    return rollupDev(inputs, destPath, {
      output: { name: elements, file: join(destPath, elements, 'bundles', `${elements}.umd.js`) }
    })
  })
}

async function buildLibs(src: string, dest?: string){
  const packages = await getSrcDirectories(src);
  return Promise.all(packages.map(pkg => {
    return buildDev(pkg.src, dest || pkg.dest);
  }))
}

async function buildApp(src?: string, dest?: string){
  const options = {
    src: src || join('src', 'app', 'package.json'),
    dest: dest || 'dist'
  };
  return buildDev(options.src, options.dest);
}

async function buildAll(){
  return Promise.all([ buildElements('src/elements'), buildLibs('src/libs'), buildApp() ])
}

export { buildDev, inlineSources, getTempPath, rollupDev, buildElements, buildLibs, buildApp, buildAll }