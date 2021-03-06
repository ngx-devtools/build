const path = require('path');

const replace = require('rollup-plugin-replace');
const rxjsAutoPlugin = require('../rollup-plugins/rxjs');

const configs = {
  inputOptions: {
    treeshake: true,
    plugins: [
      replace({
        "exclude": "node_modules/**",
        "import * as $": "import $",
        "ObservableInput": ""
      })
    ],
    onwarn (warning) {
      if (warning.code === 'THIS_IS_UNDEFINED') { return; }
      console.log("Rollup warning: ", warning.message);
    },
    external: [
      "@angular/core", 
      "@angular/http", 
      "@angular/forms", 
      "@angular/common", 
      '@angular/common/http',
      "@angular/router", 
      '@angular/animations',
      "@angular/platform-browser/animations",
      "@angular/platform-browser",
      "@angular/platform-browser-dynamic",
      "@angular/elements",
      "Rx",
      "rxjs",
      "rxjs/ajax",
      "rxjs/operators",
      "rxjs/testing",
      "rxjs/webSocket",
      "rxjs/internal-compatibility",
      "rxjs-compat"
    ]
  },
  outputOptions: {
    sourcemap: true,
    exports: 'named',
    globals: {
      "@angular/core": "ng.core",
      "@angular/common": "ng.common",
      "@angular/forms": "ng.forms",
      "@angular/router": "ng.router",
      "@angular/http": "ng.http",  
      '@angular/animations': 'ng.animations',
      '@angular/common/http': 'ng.common.http',
      "@angular/platform-browser/animations": "ng.platformBrowser.animations",
      "@angular/platform-browser": "ng.platformBrowser",
      "@angular/platform-browser-dynamic": "ng.platformBrowserDynamic",
      "@angular/elements": "ng.elements",
      "Rx": "Rx",
      "rxjs": "rxjs",
      "rxjs/ajax": "rxjs.ajax",
      "rxjs/operators": "rxjs.operators",
      "rxjs/testing": "rxjs.testing",
      "rxjs/webSocket": "rxjs.webSocket",
      "rxjs/internal-compatibility": "rxjs.internal.compatibility",
      "rxjs-compat": "rxjs.compat"
    }
  }
}

const overrideRollupConfigs = (tmpSrc, dest) => {
  const esFolders = [ 'esm2015', 'esm5', 'umd' ];

  const folder = path.basename(tmpSrc);
  return esFolders.map(esFolder => {
    const inputFile = (!(esFolder.includes('umd'))) 
      ? path.join('.tmp', folder, esFolder, `${folder}.js`) 
      : path.join('.tmp', folder, 'esm5', `${folder}.js`)

    const file = (!(esFolder.includes('umd'))) 
      ? inputFile.replace('.tmp', dest)
      : path.join(dest, folder, 'bundles', `${folder}.umd.js`);

    const format = (esFolder.includes('umd') ? 'umd' : 'es');

    return {
      input: {
        input: inputFile
      },
      output: {
        name: folder, file: file, format: format
      }
    }
  });
};

const rollupConfigs = (tmpSrc, dest) => {
  return {
    create (input, output) {
      return { 
        inputOptions: { ...configs.inputOptions, ...input },
        outputOptions: { ...configs.outputOptions, ...output }
      } 
    },
    overrides: overrideRollupConfigs(tmpSrc, dest)
  }
};

exports.rollupConfigs = rollupConfigs;
exports.configs = configs;
