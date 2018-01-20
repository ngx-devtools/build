const { Transform } = require('stream');
const { dirname } = require('path');
const { writeFile, existsSync } = require('fs');

const { build } = require('./build-config');

const mkdirp = require('mkdirp');

const destTransform = (dest) => new Transform({
  objectMode: true,
  transform (file, enc, done) {
    file.path = (dest) ? file.path.replace(build.dest, dest) : file.path;
    const dirName = dirname(file.path);
    if (!(existsSync(dirName))){
      mkdirp.sync(dirName);
    }
    new Promise((resolve, reject) => {
      writeFile(file.path, 
        file.contents.toString('utf8'), 
        (error) => {
          if (error) reject();
          resolve();
        });
    });
    done();
  }
});

module.exports = destTransform;