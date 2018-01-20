
const vfs = require('vinyl-fs');
const chokidar = require('chokidar');

const { watch } = require('./build-config');
const { build } = require('./build');

let isReady = false;

const log = (event, path) => console.log(`> ${event}: ${path}.`);

const fileWatch = (event, path) => {
  log(event, path);

  const file = path.replace('.scss', '.ts').replace('.css', '.ts').replace('.html', '.ts');
  build(file, watch.dest);
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
            log(event, path); break;
        }
      } 
    });
};