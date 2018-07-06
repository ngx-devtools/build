const { join } = require('path');
const { statSync } = require('fs');
const { isString } = require('util');

const { readdirAsync } = require('@ngx-devtools/common');

/**
 * Transform derictory to
 * { "src": "src\/app\/**\/*.ts", "dest": "dist" }
 */
const getSource = (directory) => {
  return (isString(directory)) 
    ? { src: directory.replace('/**/*.ts', ''), dest: 'dist' }
    : { src: directory.src.replace('/**/*.ts', ''), dest: directory.dest }
};

const getSrcDirectories = (srcDir) => {   
  return readdirAsync(srcDir)
    .then(files => {
      const filePath = (file) => join(process.env.APP_ROOT_PATH, srcDir, file);
      const directories = files.filter(file => statSync(filePath(file)).isDirectory());
      return directories.map(directory => getSource(join(srcDir, directory, 'package.json')));
    });
};

exports.getSrcDirectories = getSrcDirectories;