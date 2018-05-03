const path = require('path');
const fs = require('fs');
const util = require('util');

const { readdirAsync, devtools } = require('@ngx-devtools/common');

/**
 * --libs=<your-folder-libs-in-src-folder>
 * --libs <your-folder-libs-in-src-folder>
 * i.e `npm run build --libs libs`
 *    you libs code will be inside src/libs
 *    about module -> src/libs/about
 *    home module -> src/libs/home
 */
const argv = require('yargs')
  .option('libs', { default: 'libs', type: 'string' })
  .argv;

/// Transform derictory to
// { "src": "src/app/**/*.ts", "dest": "dist" }
const getSource = (directory) => {
  return (util.isString(directory)) 
    ? { src: directory.replace('/**/*.ts', ''), dest: 'dist' }
    : { src: directory.src.replace('/**/*.ts', ''), dest: directory.dest }
}

/// Get All currect directories und `src` folder 
// return [ { "src": "src/app/**/*.ts", "dest": "dist" } ]
const getSrcDirectories = () => { 
  const libSrc = `src/${argv.libs}`;
  return (devtools && devtools['build'] && devtools.build['prod'])
    ? Promise.resolve(devtools.build['prod'].files.map(directory => getSource(directory)))
    : readdirAsync(path.resolve(libSrc)).then(files => {
        const filePath = (file) => path.resolve(path.join(libSrc, file));
        const directories = files.filter(file => fs.statSync(filePath(file)).isDirectory());
        const folders = ['src/app'].concat(directories.map(directory => path.join(libSrc, directory)));
        return Promise.resolve(folders.map(directory => getSource(directory)));
      });
};

exports.getSrcDirectories = getSrcDirectories;