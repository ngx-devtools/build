const path = require('path');

const { watch } = require('./build-config');
const { buildDev } = require('../bundle/build-dev');
const { copyFile, injectHtml  } = require('@ngx-devtools/common');

const htmlChanged = src => {
  const fileSrc = path.resolve(src);
  const fileDest = fileSrc.replace('src', 'dist');
  return copyFile(fileSrc, fileDest).then(() => injectHtml(fileDest));   
};

const onClientFileChanged = src => {
  const results = src.replace(path.resolve() + path.sep, '').split(path.sep);
  const dir = (results.includes('app') ? 'src/app' : `src/libs/${results[2]}`) + '/**/*.ts';
  return (src && src.includes('src')) 
    ? (results.includes('index.html') 
        ? htmlChanged(src)
        : buildDev(dir, watch.dest))
    : Promise.resolve();
};

exports.onClientFileChanged = onClientFileChanged;