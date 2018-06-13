const path = require('path');
const fs = require('fs');

const { writeFileAsync, readFileAsync, minifyContent, mkdirp } = require('@ngx-devtools/common');

const minifyUmd = async (content, file) => {
  const minifyPath = path.join(path.dirname(file), path.basename(file, '.js') + '.min.js');
  const minifyCachePath = minifyPath.replace('dist', 'node_modules/.tmp/cache').replace('.js', '.json');
  if (!fs.existsSync(minifyCachePath)) {
    mkdirp(path.dirname(minifyCachePath));
    await writeFileAsync(minifyCachePath, JSON.stringify({}), 'utf8');
  }
  const options = { 
    sourceMap: true,
    mangle: {
      properties: true
    },
    nameCache: await readFileAsync(minifyCachePath, 'utf8')
      .then(value => Promise.resolve(JSON.parse(value)))
  };
  return minifyContent(content, options)
    .then(({ code, map }) => {
      mkdirp(path.dirname(minifyPath));
      return Promise.all([
        writeFileAsync(minifyPath, code + `\n//# sourceMappingURL=${path.basename(minifyPath)}.map`),
        writeFileAsync(minifyPath + '.map', map),
        writeFileAsync(minifyCachePath, JSON.stringify(options.nameCache))
      ])
    })
};

exports.minifyUmd = minifyUmd;

