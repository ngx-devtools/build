
const { build } = require('./build');
const { watch } = require('./build-config');

const { streamToPromise } = require('@ngx-devtools/common');

const onClientChanged = (event, path) => {
  const file = path.replace('.scss', '.ts').replace('.css', '.ts').replace('.html', '.ts');
  return streamToPromise(build(file, watch.dest))
    .then(() => Promise.resolve(path));
};

module.exports = onClientChanged;