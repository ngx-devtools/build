import { join, basename, dirname, resolve, sep } from 'path';
import { existsSync } from 'fs';

import { rollupGenerate, createRollupConfig, rollupPluginUglify, globFiles, mkdirp, copyFileAsync } from '@ngx-devtools/common';
import { inlineElementResources, BuildElementOptions, inlineSources } from './build-dev';

import { configs } from './rollup-config';
import { getSrcDirectories } from './directories';
import { readPackageFile } from './read-package-file';
import { copyPackageFile } from './ng-copy-package-file';
import { copyEntry } from './ng-copy-entry-file';

const ngc = require('@angular/compiler-cli/src/main').main; 

async function ngCompile(tmpSrc: string, appFolder = 'main') {
  const tempFolder = resolve(tmpSrc.replace('/**/*.ts', '')).replace('app', appFolder)
  return Promise.all([
    ngc([ '--project', `${tempFolder}/tsconfig-esm5.json` ]),
    ngc([ '--project', `${tempFolder}/tsconfig-esm2015.json` ]) 
  ]).then(() => tmpSrc);
}

async function ngCopyAssets(tmpSrc: string, dest?: string){
  const files = await globFiles([ `${tmpSrc}/esm2015/**/*.d.ts`, `${tmpSrc}/esm2015/*.json` ])
  return Promise.all(files.map(file => {
    const destPath = file.replace('.tmp', dest).replace(sep + 'esm2015', '');
    mkdirp(dirname(destPath));
    return copyFileAsync(file, destPath);
  }));
}

async function ngCompileProdApp(src?: string, dest?: string) {
  const options = {
    src: src || join('src', 'app', 'package.json'),
    dest: dest || 'dist'
  }
  return copyPackageFile(options.src, options.dest)
    .then(pkgName => Promise.all([ copyEntry(pkgName), inlineSources(options.src, pkgName) ]))
    .then(results => ngCompile(results[0]))
    .then(tmpSrc => Promise.all([ ngCopyAssets(tmpSrc, options.dest) ]))
}

async function rollupProd(src: any, dest: string, options?: any){ 
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

async function buildProd(src: string, dest?: string){
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
    .then(tmpSrc => rollupProd(tmpSrc, dest || 'dist'))
}

async function buildProdLibs(src: string, dest?: string){
  return existsSync(join(process.env.APP_ROOT_PATH, src))
    ? getSrcDirectories(src).then(packages => Promise.all(packages.map(pkg => buildProd(pkg.src))))
    : Promise.resolve()
}

async function buildProdApp(src?: string, dest?: string){
  const options = {
    src: src || join('src', 'app', 'package.json'),
    dest: dest || 'dist'
  };
  return buildProd(options.src, options.dest)
}

export { rollupProd, buildProdElements, buildProdLibs, buildProdApp, ngCompileProdApp, ngCompile, ngCopyAssets }