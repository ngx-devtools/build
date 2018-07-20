import { sep, join, basename, dirname } from 'path';

import { inlineResource, globFiles, createRollupConfig, rollupGenerate } from '@ngx-devtools/common';

import { readPackageFile } from './read-package-file';
import { getSrcDirectories } from './directories';
import { configs } from './rollup-config';

interface BuildElementOptions {
  src: string;
  dest?: string;
  packages?: string[];
}

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

async function getPackages(options: BuildElementOptions){
  return (options.packages) ? options.packages.map(pkg => { 
      return {
        src: join(options.src, pkg, 'package.json'),
        dest: options.dest || 'dist'
      }
  }): await getSrcDirectories(options.src);
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

  return rollupGenerate(rollupConfig);
}

async function inlineSources(src: string | string[], pkgName: string){
  return globFiles(getSourceFile(src)).then(files => {
    return Promise.all(files.map(file => { 
      return inlineResource(file, getTempPath(file, pkgName)) 
    }))
  }).then(() => join('.tmp', pkgName))
}

async function inlineElementResources(options: BuildElementOptions){
  const packages = await getPackages(options);
  return Promise.all(packages.map(pkg => {
    return readPackageFile(pkg.src)
      .then(pkgName => inlineSources(pkg.src, pkgName))
      .then(tmpSrc => join(tmpSrc, 'src', 'index.ts'))
  }));
}

async function buildDev(src: string, dest: string){
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
    .then(tmpSrc => rollupDev(tmpSrc, dest))
}

async function buildDevElements(options: BuildElementOptions){
  return inlineElementResources(options).then(inputs => {
    const elements = basename(options.src), destPath = options.dest || 'dist';
    return rollupDev(inputs, destPath, {
      output: { name: elements, file: join(destPath, elements, 'bundles', `${elements}.umd.js`) }
    })
  })
}

async function buildDevLibs(src: string, dest?: string){
  const packages = await getSrcDirectories(src);
  return Promise.all(packages.map(pkg => {
    return buildDev(pkg.src, dest || pkg.dest);
  }))
}

async function buildDevApp(src?: string, dest?: string){
  const options = {
    src: src || join('src', 'app', 'package.json'),
    dest: dest || 'dist'
  };
  return buildDev(options.src, options.dest);
}

async function buildDevAll(){
  return Promise.all([ buildDevElements({ src: 'src/elements' }), buildDevLibs('src/libs'), buildDevApp() ])
}

export { 
  buildDev, 
  inlineSources, 
  getTempPath, 
  rollupDev, 
  buildDevElements, 
  BuildElementOptions, 
  buildDevLibs,
  buildDevApp, 
  buildDevAll,
  getPackages,
  inlineElementResources
}