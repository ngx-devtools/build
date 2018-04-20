const fs = require('fs');
const path = require('path');
const util = require('util');
const vfs = require('vinyl-fs');
const ternaryStream = require('ternary-stream');
const sourcemaps = require('gulp-sourcemaps');

const promisify = util.promisify;

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const { Transform } = require('stream');
const { createProject } = require('gulp-typescript');
const { getFiles, streamToPromise, mkdirp, copyFileAsync, deleteFolderAsync } = require('@ngx-devtools/common');

const config = require('./build-config');

const getSource = (file) => file.replace(/\/$/, '').replace(path.resolve() + '/', '').split('/')[0];

const argv = require('yargs')
  .option('dts', { default: false, type: 'boolean' })
  .option('sourceMap', { default: false, type: 'boolean' })
  .argv;

const copyFilesAsync = (files, dest) => {
  return Promise.all(files.map(file => inlineFileAsync(file, dest)));
};

const inlineFileAsync = (file, dest) => {
  const tempPath = file.replace(getSource(file), '.tmp');
  return copyFileAsync(file, '.tmp')
    .then(content => {
      const cachePath = file.replace(getSource(file), config.cacheBaseDir);
      const outDirFile = file.replace(getSource(file), dest).replace('.ts', '.js');
      if (fs.existsSync(cachePath) 
        && fs.existsSync(outDirFile)
        && fs.statSync(tempPath).size === fs.statSync(cachePath).size){
        return Promise.resolve();
      }
      mkdirp(path.dirname(cachePath));
      return writeFileAsync(cachePath, content).then(() => Promise.resolve(tempPath));
    });
};

const destTransform = (dest) => new Transform({
  objectMode: true,
  transform(file, enc, done) {
    file.path = (dest) ? file.path.replace(config.build.dest, dest) : file.path;
    const dirName = path.dirname(file.path);
    if (!(fs.existsSync(dirName))) {
      mkdirp(dirName);
    }
    writeFileAsync(file.path, file.contents);
    done();    
  }
});

const build = (filePaths, dest) => {
  let files = [];
  filePaths.forEach(filePath => 
    filePath.filter(file => file !== undefined)
      .forEach(file => files.push(file))
  );
  const hasSourceMap = () => (argv['sourceMap'] && argv.sourceMap === true);
  const tsProject = createProject(
    path.join(process.env.APP_ROOT_PATH, 'tsconfig.json'), 
    { rootDir: '.tmp' }
  );
  return (files.length > 0) ? streamToPromise (
    vfs.src(files)
      .pipe(ternaryStream(hasSourceMap, sourcemaps.init()))
      .pipe(tsProject()).js
      .pipe(ternaryStream(hasSourceMap, sourcemaps.write('.')))
      .pipe(destTransform(dest))
  ) : Promise.resolve()
};

const buildAsync = (src, dest) => {
  const files = getFiles(src || config.build.src);
  return Promise.all(files.map(filePaths => copyFilesAsync(filePaths, dest || config.build.dest)))
    .then(filePaths => build(filePaths, dest || config.build.dest));
};

module.exports = buildAsync;