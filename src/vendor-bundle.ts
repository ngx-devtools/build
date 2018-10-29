import { concat, clean, minify, writeFileAsync, mkdirp, minifyContent } from '@ngx-devtools/common';
import { dirname, join } from 'path';
import { bundleRxjs } from './bundle-rxjs';

const angularFiles = [
  'core/bundles/core.umd.min.js',
  'common/bundles/common.umd.min.js',
  'common/bundles/common-http.umd.min.js',
  'compiler/bundles/compiler.umd.min.js',
  'animations/bundles/animations.umd.min.js',
  'animations/bundles/animations-browser.umd.min.js',
  'platform-browser/bundles/platform-browser.umd.min.js',
  'platform-browser/bundles/platform-browser-animations.umd.js',
  'platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js',
  'router/bundles/router.umd.min.js',
  'forms/bundles/forms.umd.min.js',
  'elements/bundles/elements.umd.min.js'
];

const minifyVendorsFiles = [
  { src: 'node_modules/livereload-js/dist/livereload.js', dest: 'node_modules/.tmp/livereload.js' },
  { src: 'node_modules/@webcomponents/custom-elements/src/native-shim.js',  dest: 'node_modules/.tmp/native-shim.min.js' }
];

const shimsFiles = [
  'node_modules/.tmp/native-shim.min.js',
  'node_modules/@webcomponents/custom-elements/custom-elements.min.js',
  'node_modules/core-js/client/shim.min.js', 
  'node_modules/systemjs/dist/system.js',
  'node_modules/zone.js/dist/zone.min.js'
];

const systemjsScripts = `
  (() => {
    const importComponents = (files) => {
      return files.reduce((promise, file) => {
          switch(typeof file){
            case "string":
              return promise.then(() => System.import(file));
            case "object":
              if(Array.isArray(file)){
                return promise.then(() => Promise.all(file.map(fileMap => System.import(fileMap))));
              }
          }
      }, Promise.resolve());
    }
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        System.config(data.config);
        const vendors = data.vendors, components = data.components;
        return Promise.all(vendors.map(vendor => System.import(vendor)))
            .then(() => importComponents(components))
      })
      .catch((e) => { console.error(e.stack || e) })
  })();
`

interface MinifyOptions {
  src: string;
  dest: string;
}

async function minifyVendors(files: MinifyOptions[]){
  return Promise.all(files.map(file => {
    return minify(file.src).then(content => {
      mkdirp(dirname(file.dest));
      return writeFileAsync(file.dest, content.code);
    })
  }))
}

async function minifySystemJs(dest: string){
  return minifyContent(systemjsScripts).then(content => {
    const destPath = join(process.env.APP_ROOT_PATH, dest, 'systemjs-script.min.js');
    mkdirp(dirname(destPath));
    return writeFileAsync(destPath, content.code);
  })
}

async function vendorBundle(dest: string) {
  return clean(dest)
    .then(() => minifyVendors(minifyVendorsFiles))
    .then(() => Promise.all([ 
      bundleRxjs(),
      concat(angularFiles.map(file => `node_modules/@angular/${file}`), `${dest}/angular.min.js`), 
      concat(shimsFiles, `${dest}/shims.min.js`),
      minifySystemJs(dest)
    ]))
}

export { vendorBundle }