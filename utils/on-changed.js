const { join, sep } = require('path');

const { watch } = require('./build-config');
const { buildDev, buildElements } = require('../bundle/build-dev');
const { copyFile, injectHtml  } = require('@ngx-devtools/common');

const BASE_LIBS = join('src', 'libs');
const BASE_APP = join('src', 'app');

const htmlChanged = src => {
  const fileSrc = path.resolve(src);
  const fileDest = fileSrc.replace('src', 'dist');
  return copyFile(fileSrc, fileDest).then(() => injectHtml(fileDest));   
};

const build = src => {
  const package = (src.includes(BASE_APP)) 
    ? join(BASE_APP, 'package.json')
    : (src.includes(BASE_LIBS)) 
      ? join(BASE_LIBS, src.split(sep)[2], 'package.json')
      : undefined;
  return (package) 
    ? buildDev(package, watch.dest)
    : buildElements() 
};

const onClientFileChanged = src => {
  return (src && src.includes('src')) 
    ? (src.includes('index.html') ? htmlChanged(src): build(src))
    : Promise.resolve();
};

exports.onClientFileChanged = onClientFileChanged;