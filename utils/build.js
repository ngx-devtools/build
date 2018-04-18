
const vfs = require('vinyl-fs');
const base64 = require('gulp-base64-inline');
const sourcemaps = require('gulp-sourcemaps');
const ternaryStream = require('ternary-stream');
const Transform = require('stream').Transform;

const { createProject } = require('gulp-typescript');
const { join, resolve } = require('path');

const { ng2InlineTemplate, streamToPromise } = require('@ngx-devtools/common');

const tsProject = createProject(join(process.env.APP_ROOT_PATH, 'tsconfig.json'));

const config = require('./build-config');
const merge = require('./merge2');
const destTransform = require('./dest-transform');

const buildFactory = (src, dest) => {
  const fileSource = (src) ? src : config.build.src;
  const fileDest = (dest) ? dest : config.build.dest;

  let result;

  const argv = require('yargs')
    .option('dts', { default: false, type: 'boolean' })
    .option('sourceMap', { default: false, type: 'boolean' })
    .argv;

  const hasSourceMap = () => (argv['sourceMap'] && argv.sourceMap === true);

  const tsResult = vfs.src(fileSource)
    .pipe(ng2InlineTemplate(true))
    .pipe(base64())
    .pipe(ternaryStream(hasSourceMap, sourcemaps.init()))
    .pipe(tsProject());

  if (!(argv['dts']) || argv.dts === false){
    result = tsResult.js
      .pipe(ternaryStream(hasSourceMap, sourcemaps.write()))
      .pipe(destTransform(fileDest));
  } else {
    result = merge([
      tsResult.dts.pipe(destTransform(fileDest)),
      tsResult.js
        .pipe(ternaryStream(hasSourceMap, sourcemaps.write()))
        .pipe(destTransform(fileDest))
    ]);
  }

  return result;
};

exports.build = buildFactory;