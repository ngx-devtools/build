const path = require('path');

const { writeFileAsync, mkdirp} = require('@ngx-devtools/common');
const { rollup } = require('rollup')

const config = {
  input: '.tmp/main/esm5/main.js',
  treeshake: true,
  plugins: [
    require('../rollup-plugin/jquery'),
    require('../rollup-plugin/marked'),
    require('../rollup-plugin/prismjs')
  ],
  onwarn: (warning) => {
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
    "Rx"      
  ],
  output: {
    format: 'es',
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
      "Rx": "Rx"
    }
  }
};

const bundleRollup = (config, dest) => {
  return rollup(config)
    .then(bundle => bundle.generate(config.output))
    .then(result => {
      const bundlePath = path.resolve(dest);
      mkdirp(path.dirname(bundlePath));
      return Promise.all([ 
        writeFileAsync(bundlePath, result.code + '\n//# sourceMappingURL=bundle.js.map'),
        writeFileAsync(bundlePath + '.map', result.map.toString())
      ]);
    });
}

module.exports = (folder, dest) => {
  const formats = [{ 
      input: { input: `.tmp/${folder}/esm5/${folder}.js` }, 
      dest: `${dest}/${folder}/esm5/${folder}.js` 
    }, { 
      input: { input: `.tmp/${folder}/esm2015/${folder}.js` }, 
      dest: `${dest}/${folder}/esm2015/${folder}.js` 
  }];
  return Promise.all(formats.map(format => 
    bundleRollup(Object.assign(config, format.input), format.dest)
  ));
};