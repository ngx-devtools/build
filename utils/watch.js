
const vfs = require('vinyl-fs');

const chokidar = require('chokidar');
const { dirname, base, extname } = require('path');

const { watch } = require('./build-config');
const { build } = require('./build');

let isReady = false;

const fileWatch = (event, path) => {
  const utils = {
    log: (event, path) =>  console.log(`> ${event}: ${path}.`),
    fileDest: path =>  dirname(path.replace(watch.src, watch.dest))
  };

  utils.log(event, path);

  const file = path.replace('.scss', '.ts').replace('.css', '.ts');
  build(file, utils.fileDest(file));
};

const watchReady = () => {
  isReady = true;
  console.log('> Initial scan complete. Ready for changes.'); 
};

const WATCH_EVENT = {
  ADD: 'add',
  CHANGE: 'change',
  DELETE: 'unlink',
  READY: 'ready'
};

exports.watch = () => {
  chokidar.watch(watch.src)
    .on(WATCH_EVENT.READY, watchReady)
    .on('all', (event, path) => {
      if (isReady){
        switch(event) {
          case WATCH_EVENT.ADD:
          case WATCH_EVENT.CHANGE: 
            fileWatch(event, path); break;
          case WATCH_EVENT.DELETE:
            console.log(`> ${event}: ${path}.`); break;
        }
      } 
    });
};