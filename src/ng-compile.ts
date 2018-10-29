import { resolve, dirname, sep, join } from 'path';
import { existsSync } from 'fs';

import { globFiles, mkdirp, copyFileAsync, rollupGenerate, depsResolve, createNgRollupConfig, rollupPluginUglify } from '@ngx-devtools/common';

import { inlineSources, getPackages, BuildOptions } from './build-dev';
import { configs } from './rollup-config';
import { copyEntry } from './ng-copy-entry-file';
import { copyPackageFile } from './ng-copy-package-file';
import { getSrcDirectories } from './directories';

const formats = [ 'esm2015', 'esm5', 'umd' ];

async function ngCompile(tmpSrc: string, appFolder = 'main') {
  const ngc = require('@angular/compiler-cli/src/main').main; 
  const tempFolder = resolve(tmpSrc.replace('/**/*.ts', '')).replace('app', appFolder)
  return Promise.all([
    ngc([ '--project', `${tempFolder}/tsconfig-esm5.json` ]),
    ngc([ '--project', `${tempFolder}/tsconfig-esm2015.json` ]) 
  ]).then(() => tmpSrc);
}

async function ngCopyAssets(tmpSrc: string, dest?: string) {
  const files = await globFiles([ `${tmpSrc}/esm2015/**/*.d.ts`, `${tmpSrc}/esm2015/*.json` ])
  return Promise.all(files.map(file => {
    const destPath = file.replace('.tmp', dest).replace(sep + 'esm2015', '');
    mkdirp(dirname(destPath));
    return copyFileAsync(file, destPath);
  }));
}

async function ngRollupProd(tmpSrc: string, dest: string) {
  const options = { inputOptions: { ...configs.inputOptions  }, outputOptions: { ...configs.outputOptions } };
  const rollupConfigs = formats.map(format => {
    return createNgRollupConfig({ tmpSrc: tmpSrc, dest: dest, format: format, options: options })
  })
  return Promise.all(rollupConfigs.map(rollupConfig => rollupGenerate(rollupConfig)));
}

async function ngRollupProdBundle(tmpSrc: string, dest: string) {
  const options = { 
    inputOptions: { ...configs.inputOptions, ...{ external: [], plugins: [ depsResolve(), rollupPluginUglify() ] }  }, 
    outputOptions: { ...configs.outputOptions, ...{ globals: {} } } 
  }
  const rollupConfig = createNgRollupConfig({
    tmpSrc: tmpSrc, dest: dest, format: 'umd', options: options, minify: true
  })
  return rollupGenerate(rollupConfig); 
}

async function ngBuildProd({ src, dest }) {
  return copyPackageFile(src, dest)
    .then(pkgName => Promise.all([ copyEntry(pkgName), inlineSources(src, pkgName) ]))
    .then(results => ngCompile(results[0]))
    .then(tmpSrc => Promise.all([ ngCopyAssets(tmpSrc, dest), ngRollupProd(tmpSrc, dest), ngRollupProdBundle(tmpSrc, dest) ]))
}

async function ngCompileProdApp(src?: string, dest?: string) {
  const options = {
    src: src || join('src', 'app', 'package.json'),
    dest: dest || 'dist'
  }
  return ngBuildProd(options);
}

async function ngCompileLibs(src: string) {
  return existsSync(join(process.env.APP_ROOT_PATH, src))
    ? (async function(){
      const packages = await getSrcDirectories(src);
      return Promise.all(packages.map(pkg => {
        return ngBuildProd({ src: pkg.src, dest: pkg.dest });
      }))
     })()
    : Promise.resolve();
}

async function ngCompilePackageLibs(options: BuildOptions) {
  return existsSync(join(process.env.APP_ROOT_PATH, options.src))
    ? (async function(){
      const packages = await getPackages(options);
      return Promise.all(packages.map(pkg => {
        return ngBuildProd({ src: pkg.src, dest: pkg.dest });
      }))
     })()
    : Promise.resolve();  
}

export{ ngCompile, ngCopyAssets, ngRollupProd, ngCompileProdApp, ngBuildProd, ngCompileLibs, ngCompilePackageLibs, ngRollupProdBundle }