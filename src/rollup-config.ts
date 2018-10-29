
const configs = {
  inputOptions: {
    treeshake: true,
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

export { configs }