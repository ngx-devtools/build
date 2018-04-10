
const { build } = require('./build');
const { watch } = require('./build-config');

const { streamToPromise } = require('@ngx-devtools/common');

const onClientFileChanged = (path) => {
  const file = path.replace('.scss', '.ts').replace('.css', '.ts').replace('.html', '.ts');
  return (path && path.includes('src')) ? streamToPromise(build(file, watch.dest)) : Promise.resolve();
};

module.exports = onClientFileChanged;