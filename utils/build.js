const vfs = require('vinyl-fs');

const sourcemaps = require('gulp-sourcemaps');
const base64 = require('gulp-base64-inline');
const merge = require('merge2');
const ts = require('gulp-typescript');

const ng2InlineTemplate = require('./ng2-inline-template').ng2InlineTemplate;
const tsProject = ts.createProject('./tsconfig.json');

const config = require('./build-config');

const buildFactory = (src, dest) => {
  const fileSource = (src) ? src : config.build.src;
  const fileDest = (dest) ? dest : config.build.dest;

  const tsResult = vfs.src(fileSource)
    .pipe(sourcemaps.init()) 
    .pipe(ng2InlineTemplate(true))
    .pipe(base64())
    .pipe(tsProject());

  const result = merge([
    tsResult.dts.pipe(vfs.dest(fileDest)),
    tsResult.js.pipe(sourcemaps.write())
      .pipe(vfs.dest(fileDest))
  ]);

  return result;
};

exports.build = buildFactory;