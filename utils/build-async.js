const fs = require('fs');
const path = require('path');
const util = require('util');
const vfs = require('vinyl-fs');
const ternaryStream = require('ternary-stream');
const sourcemaps = require('gulp-sourcemaps');

const promisify = util.promisify;

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const { createProject } = require('gulp-typescript');
const { getFiles, streamToPromise, inlineResourcesFromString, mkdirp } = require('@ngx-devtools/common');

const config = require('./build-config');
const destTransForm = require('./dest-transform');

const getSource = (file) => file.replace(/\/$/, '').replace(path.resolve() + '/', '').split('/')[0];

const tsProject = createProject(path.join(process.env.APP_ROOT_PATH, 'tsconfig.json'));

const argv = require('yargs')
  .option('dts', { default: false, type: 'boolean' })
  .option('sourceMap', { default: false, type: 'boolean' })
  .argv;

const buildFiles = (files, dest) => {
  return Promise.all(files.map(file => copyFileAsync(file, dest)));
};

const copyFileAsync = (file, dest) => {
  const destPath = file.replace(getSource(file), dest);
  mkdirp(path.dirname(destPath));
  return readFileAsync(file, 'utf8')
    .then(content => inlineResourcesFromString(content, url => path.join(path.dirname(file), url)))
    .then(content => writeFileAsync(destPath, content).then(() => Promise.resolve(content)))
    .then(content => {
      const cachePath = file.replace(getSource(file), 'node_modules/.tmp/cache');
      const outDirFile = file.replace(getSource(file), 'dist').replace('.ts', '.js');
      if (fs.existsSync(cachePath) 
        && fs.existsSync(outDirFile)
        && fs.statSync(destPath).size === fs.statSync(cachePath).size){
        return Promise.resolve();
      }
      mkdirp(path.dirname(cachePath));
      return writeFileAsync(cachePath, content).then(() => Promise.resolve(destPath));
    });
};

const buildAsync = (src, dest) =>{
  const files = getFiles(src || config.build.src);
  return Promise.all(files.map(filePaths => buildFiles(filePaths, '.tmp')))
    .then(filePaths => {
      let files = [];
      filePaths.forEach(filePath => 
        filePath.filter(file => file !== undefined)
          .forEach(file => files.push(file))
      );
      const hasSourceMap = () => (argv['sourceMap'] && argv.sourceMap === true);
      return (files.length > 0) ? streamToPromise(
        vfs.src(files)
          .pipe(ternaryStream(hasSourceMap, sourcemaps.init()))
          .pipe(tsProject()).js
          .pipe(ternaryStream(hasSourceMap, sourcemaps.write()))
          .pipe(destTransForm(dest))
      ) : Promise.resolve()
    });
};

module.exports = buildAsync;