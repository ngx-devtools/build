
const Builder = require('systemjs-builder');

module.exports = done => {
  const options = {
    normalize: true,
    runtime: false,
    sourceMaps: true,
    sourceMapContents: true,
    minify: true,
    mangle: false
  };
  const builder = new Builder('./');
  builder.config({
    paths: {
      'n:*': 'node_modules/*',
      'rxjs/*': 'node_modules/rxjs/*.js',
      "rxjs/internal-compatibility": "node_modules/rxjs/internal-compatibility/index.js",
      "rxjs/testing": "node_modules/rxjs/testing/index.js",
      "rxjs/ajax": "node_modules/rxjs/ajax/index.js",
      "rxjs/operators": "node_modules/rxjs/operators/index.js",
      "rxjs/webSocket": "node_modules/rxjs/webSocket/index.js",
      "rxjs-compat/*": "node_modules/rxjs-compat/*.js"
    },
    map: {
      'rxjs': 'n:rxjs',
      'rxjs-compat': 'n:rxjs-compat'
    },
    packages: {
      'rxjs': {
        main: 'Rx.js', 
        defaultExtension: 'js'
      },
      "rxjs-compat": {
        main: "Rx.js",
        defaultExtension: "js"
      }
    }
  });
  return builder.bundle('rxjs', 'node_modules/.tmp/Rx.min.js', options)
    .then(() => done())
    .catch((error) => done(error));
};
