const path = require('path');

const { writeFileAsync, minifyContent } = require('@ngx-devtools/common');

const minifyUmd = (content, bundlePath) => {
  const minifyPath = path.join(path.dirname(bundlePath), path.basename(bundlePath, '.js') + '.min.js');
  return minifyContent(content, { sourceMap: true })
    .then(({ code, map }) => {
      return Promise.all([
        writeFileAsync(minifyPath, code + `\n//# sourceMappingURL=${path.basename(minifyPath)}.map`),
        writeFileAsync(minifyPath + '.map', map)
      ])
    });
};

exports.minifyUmd = minifyUmd;

