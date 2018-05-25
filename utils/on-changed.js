const path = require('path');

const { watch } = require('./build-config');
const { buildDev } = require('../bundle/build-dev');
const { copyFile, injectLiveReload  } = require('@ngx-devtools/common');

const onClientFileChanged = src => {
  const results = src.replace(path.resolve() + path.sep, '').split(path.sep);
  const dir = (results.includes('app') ? 'src/app' : `src/libs/${results[2]}`) + path.sep + '**/*.ts';
  return (src && src.includes('src')) 
    ? (results.includes('index.html') 
        ? copyFile(path.resolve(src), path.resolve(src).replace('src', 'dist'))
            .then(() => injectLiveReload())
        : buildDev(dir, watch.dest))
    : Promise.resolve();
};

exports.onClientFileChanged = onClientFileChanged;