const fs = require('fs');
const path = require('path');
const vfs = require('vinyl-fs');
const ternaryStream = require('ternary-stream');
const sourcemaps = require('gulp-sourcemaps');

const { Transform } = require('stream');
const { createProject } = require('gulp-typescript');
const { 
  getFiles, 
  getSource, 
  streamToPromise, 
  mkdirp, 
  copyFileAsync, 
  deleteFileAsync,
  readFileAsync,
  writeFileAsync
} = require('@ngx-devtools/common');

const config = require('./build-config');
const destTransform = require('./dest-transform');

const argv = require('yargs')
  .option('dts', { default: false, type: 'boolean' })
  .option('sourceMap', { default: false, type: 'boolean' })
  .argv;

const hasSourceMap = () => (argv['sourceMap'] && argv.sourceMap === true);

/**
 * Inline templateUrl path to html text, inline stylesUrl to css text
 * convert the scss path to css
 * @param {ts source file} file 
 * @param {destination of inline ts file} dest 
 */
const inlineFileAsync = (file, dest) => {
  return copyFileAsync(file, '.tmp')
    .then(content => {
      const tempPath = file.replace('src', '.tmp');
      const cachePath = file.replace('src', config.cacheBaseDir);
      const outDirFile = file.replace('src', dest).replace('.ts', '.js');
      const outDirFileMap = `${outDirFile}.map`;
      if (fs.existsSync(cachePath) 
        && fs.existsSync(outDirFile)
        && fs.statSync(tempPath).size === fs.statSync(cachePath).size
        && (hasSourceMap() && fs.existsSync(outDirFileMap))){
        return Promise.resolve();
      }
      const deleteFiles = () => Promise.all([ outDirFile, outDirFileMap ].map(outFile => deleteFileAsync(outFile)));
      mkdirp(path.dirname(cachePath));
      return Promise.all([ deleteFiles(), writeFileAsync(cachePath, content) ])
        .then(() => Promise.resolve(tempPath));
    });
};

/**
 * A build Stream to transpile typescript files
 * @param {list of files to be transpile} files 
 * @param {destination where transpiled js save} dest 
 */
const buildStream = (files, dest) => {
  const tsProject = createProject(path.join(process.env.APP_ROOT_PATH, 'tsconfig.json'));
  return vfs.src(files)
    .pipe(ternaryStream(hasSourceMap, sourcemaps.init()))
    .pipe(tsProject()).js
    .pipe(ternaryStream(hasSourceMap, sourcemaps.write('.')))
    .pipe(destTransform(dest));
};

/**
 * Build typescript files
 * @param {list of file paths return by the inlineSources} filePaths 
 * @param {destination where to write or save transpile file} dest 
 */
const build = (filePaths = [], dest) => {
  const files = filePaths.filter(file => (file !== undefined));
  return (files.length > 0) 
    ? streamToPromise(buildStream(files, dest))
    : Promise.resolve()
};

/**
 * BuildAsync files
 * @param {source of typescript file} src 
 * @param {destination where to write or save transpile file} dest 
 */
const buildAsync = (src, dest) => {
  const destDir = dest || config.build.dest;
  const files = getFiles(src || config.build.src).join(',').split(',');
  return Promise.all(files.map(file => inlineFileAsync(file, destDir)))
    .then(filePaths => build(filePaths, destDir));
};

exports.buildAsync = buildAsync;
exports.inlineFileAsync = inlineFileAsync;