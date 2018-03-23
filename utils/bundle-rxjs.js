
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
      'rxjs/operators': 'node_modules/rxjs/operators.js'
    },
    map: {
      'rxjs': 'n:rxjs',
    },
    packages: {
      'rxjs': {main: 'Rx.js', defaultExtension: 'js'},
    }
  });
  return builder.bundle('rxjs', 'node_modules/.tmp/Rx.min.js', options)
    .then(() => done())
    .catch((error) => done(error));
};
