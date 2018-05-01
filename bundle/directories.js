const path = require('path');
const fs = require('fs');

const { readdirAsync, devtools } = require('@ngx-devtools/common');

const argv = require('yargs')
  .option('libs', { default: 'libs', type: 'string' })
  .argv;

/**
 * Get All currect directories und `src` folder 
 **/
const getSrcDirectories = () => {
  const libSrc = `src/${argv.libs}`;
  return (devtools && devtools['build'] && devtools.build['prod'])
    ? Promise.resolve(devtools.build['prod'].src.map(directory => directory.replace('/**/*.ts', '')))
    : readdirAsync(path.resolve(libSrc)).then(files => {
        const filePath = (file) => path.resolve(path.join(libSrc, file));
        const directories = files.filter(file => fs.statSync(filePath(file)).isDirectory());
        const folders = ['src/app'].concat(directories.map(directory => path.join(libSrc, directory)))
        return Promise.resolve(folders);
      });
};

exports.getSrcDirectories = getSrcDirectories;