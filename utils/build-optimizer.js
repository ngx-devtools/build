const { Transform } = require('stream');
const { buildOptimizer } = require('@angular-devkit/build-optimizer');

const inlineSourceMap = (map) => {
  return '// # sourceMappingURL=data:application/json;base64,' + new Buffer(JSON.stringify(map)).toString('base64');
};

const ngBuildOptimizer = () => new Transform({
  objectMode: true,
  transform(file, enc, done) {
    if (file.isBuffer()) {
      const res = buildOptimizer({
        content: file.contents.toString(),
        emitSourceMap: true
      });
      if (res.content) {
        file.contents = Buffer.from(res.content + inlineSourceMap(res.sourceMap), enc);
      }
      return done(null, file);
    }
  }
});

module.exports = ngBuildOptimizer;