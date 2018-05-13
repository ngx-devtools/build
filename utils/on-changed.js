const path = require('path');

const { watch } = require('./build-config');
const { buildDev } = require('../bundle/build-dev');
 
const onClientFileChanged = src => {
  const results = src.replace(path.resolve() + path.sep, '').split(path.sep);
  const dir = (results.includes('app') ? 'src/app' : `src/libs/${results[2]}`) + path.sep + '**/*.ts';
  return (src && src.includes('src')) ? buildDev(dir, watch.dest) : Promise.resolve();
};

exports.onClientFileChanged = onClientFileChanged;