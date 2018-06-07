const { uglifyJS } = require('@ngx-devtools/common');

function uglify (userOptions, minifier = uglifyJS.minify) {
  const options = Object.assign({ sourceMap: true }, userOptions);
  return {
    name: "uglify",
    transformBundle (code) {
      const result = minifier(code, options);
      if (result.error) {
        const { message, line, col: column } = result.error;
        throw result.error;
      }
      return result;
    }
  };
}

exports.uglify = uglify;
