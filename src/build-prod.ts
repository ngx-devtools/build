import { join, basename, dirname } from 'path';
import { existsSync } from 'fs';

import { rollupGenerate, createRollupConfig, rollupPluginUglify, Devtools  } from '@ngx-devtools/common';
import { inlineElementResources, BuildElementOptions, inlineSources, BuildOptions, getPackages } from './build-dev';

import { configs } from './rollup-config';
import { readPackageFile } from './read-package-file';

const argv = require('yargs')
  .option('lib-name', { default: null, type: 'string' })
  .option('config', { default: null, type: 'string' })
  .argv;

async function rollupProd(src: any, dest: string, options?: any) { 
  const entry = Array.isArray(src) ? src : join(src, 'src', 'index.ts');

  const pkgName = (options && options.output) ? options.output.name: basename(src);
  const file = (options && options.output) 
    ? options.output.file
    : join(src.replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);

  const rollupConfig = createRollupConfig({
    input: entry,
    overrideExternal: true,
    external: [],
    plugins: [ rollupPluginUglify() ],
    output: {
      ...configs.outputOptions,
      file: file,
      format: 'umd',
      name: pkgName,
      dir: dirname(file),
      globals: {}
    }
  });

  return rollupGenerate(rollupConfig);
}

async function buildProdElements(options: BuildElementOptions) {
  return inlineElementResources(options).then(inputs => {
    const elements = basename(options.src), destPath = options.dest || 'dist';
    return rollupProd(inputs, destPath, {
      output: { name: elements, file: join(destPath, elements, 'bundles', `${elements}.umd.js`) }
    })
  })
}

async function buildProd(src: string, dest?: string) {
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
    .then(tmpSrc => rollupProd(tmpSrc, dest || 'dist'))
}

async function buildProdLibs(options: BuildOptions) {
  return existsSync(join(process.env.APP_ROOT_PATH, options.src))
    ? (async function(){
        const destPath = options.dest || 'dist';
        const name = argv.libName || argv.config;
        return (options.packages) 
          ? inlineElementResources(options).then(inputs => {
              return rollupProd(inputs, destPath, {
                output: { name: name, file: join(destPath, name, 'bundles', `${name}.umd.min.js`) }
              })
            }) 
          : getPackages(options).then(packages => {
              return Promise.all(packages.map(pkg => buildProd(pkg.src, destPath)))
            })
      })()
    : Promise.resolve()
}

async function buildProdApp(src?: string, dest?: string) {
  const options = {
    src: src || join('src', 'app', 'package.json'),
    dest: dest || 'dist'
  };
  return buildProd(options.src, options.dest)
}

async function buildProdComponents(keys: Array<string>) {
  return Promise.all(keys.map(key => {
    const sources = [ 'src/elements', 'src/libs' ];
    const packages = sources.map(source => {
      const values = Devtools.config.build.prod[key].filter(lib => {
        const tempPath = join(source, lib, 'package.json');
        return existsSync(tempPath);
      });
      return (values) ? values.map(value => join(source, value, 'package.json')).join(','): null;
    })
    .filter(value => value !== '')
    .join(',')
    .split(',')
    .map(pkg => ({ src: pkg, dest: 'dist' }))
    return Promise.all(packages.map(pkg => {
      return readPackageFile(pkg.src)
        .then(pkgName => inlineSources(pkg.src, pkgName))
        .then(tmpSrc => join(tmpSrc, 'src', 'index.ts'))
    })).then(inputs => {
      return rollupProd(inputs, 'dist', {
        output: { name: key, file: join('dist', key, 'bundles', `${key}.umd.min.js`) }
      })
    })
  }))        
}

export { rollupProd, buildProdElements, buildProdLibs, buildProdApp, buildProdComponents }