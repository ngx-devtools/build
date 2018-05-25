const path = require('path');

const TMP_FOLDER = 'node_modules/.tmp/systemjs-script.min.js';

const { minify, writeFileAsync, readFileAsync } = require('@ngx-devtools/common');

const minifyScript = () => {
  return minify(path.join(__dirname, 'systemjs-script.js'))
    .then(content => writeFileAsync(path.resolve(TMP_FOLDER), content.code));
};

const attachedToIndexHtml = async (pathToHtml) => {
 const [ minStr, htmlStr  ] = await Promise.all([ readFileAsync(TMP_FOLDER, 'utf8'), readFileAsync(pathToHtml, 'utf8') ]);
 return writeFileAsync(pathToHtml, htmlStr.replace('<!-- systemjs -->', minStr));
};  

exports.minifyScript = minifyScript;
exports.attachedToIndexHtml = attachedToIndexHtml;