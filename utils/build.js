const vfs = require('vinyl-fs');

const sourcemaps = require('gulp-sourcemaps');
const base64 = require('gulp-base64-inline');

const { createProject } = require('gulp-typescript');
const { join, resolve } = require('path');

const { ng2InlineTemplate } = require('@ngx-devtools/common');

const tsProject = createProject(join(process.env.APP_ROOT_PATH, 'tsconfig.json'));

const config = require('./build-config');
const destTransform = require('./dest-transform');
const merge = require('./merge2');

const buildFactory = (src, dest) => {
  const fileSource = (src) ? src : config.build.src;
  const fileDest = (dest) ? dest : config.build.dest;

  const tsResult = vfs.src(fileSource)
    .pipe(sourcemaps.init()) 
    .pipe(ng2InlineTemplate(true))
    .pipe(base64())
    .pipe(tsProject());

  const result = merge([
    tsResult.dts.pipe(destTransform(fileDest)),
    tsResult.js.pipe(sourcemaps.write())
      .pipe(destTransform(fileDest))
  ]);

  return result;
};

exports.build = buildFactory;