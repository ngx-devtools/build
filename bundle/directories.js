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

/**
 * Transform derictory to
 * { "src": "src\/app\/**\/*.ts", "dest": "dist" }
 */
const getSource = (directory) => {
  return (util.isString(directory)) 
    ? { src: directory.replace('/**/*.ts', ''), dest: 'dist' }
    : { src: directory.src.replace('/**/*.ts', ''), dest: directory.dest }
};

/**
 * Get All currect directories und `src` folder 
 * return [ { "src": "src\/app\/**\/*.ts", "dest": "dist" } ]
 */
const getSrcDirectories = () => { 
  const srcFolders = [
    'src/libs',
    'src/elements'
  ], 
  appSrc = [ 'src/app' ].map(directory => getSource(directory));
  return Promise.all(srcFolders.map(srcFolder => {
    const srcDir = path.join(process.env.APP_ROOT_PATH, srcFolder);
    return readdirAsync(srcDir)
      .then(files => {
        const filePath = (file) => path.join(process.env.APP_ROOT_PATH, srcFolder, file);
        const directories = files.filter(file => fs.statSync(filePath(file)).isDirectory());
        return directories.map(directory => getSource(path.join(srcFolder, directory)))
      });
  })).then(results => {
    const folders = [ appSrc[0] ];
    results.forEach(result => {
      Array.isArray(result) 
        ? result.forEach(value => folders.push(value))
        : folders.push(result)
    });
    return folders;
  });
};

exports.getSrcDirectories = getSrcDirectories;