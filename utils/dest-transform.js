const path = require('path');

const { Transform } = require('stream');
const { mkdirp, writeFileAsync }= require('@ngx-devtools/common');

const config = require('./build-config');

const destTransform = (dest) => new Transform({
  objectMode: true,
  transform(file, enc, done) {
    file.path = (dest) ? file.path.replace(config.build.dest, dest) : file.path;
    mkdirp(path.dirname(file.path));
    writeFileAsync(file.path, file.contents);
    done();    
  }
});

module.exports = destTransform;