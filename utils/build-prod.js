const fs = require('fs');
const path = require('path');
const util = require('util');

const ngc = require('@angular/compiler-cli/src/main').main;

const { 
  getFiles, 
  getSource, 
  mkdirp, 
  readFileAsync,
  writeFileAsync,
  readdirAsync,
  inlineResourcesFromString,
  copyFiles,
  devtools
} = require('@ngx-devtools/common');

const config = require('./build-config');
const destTransform = require('./dest-transform');
const misc = require('./misc.json');

const argv = require('yargs')
  .option('main', { default: 'main', type: 'string' })
  .option('libs', { default: 'libs', type: 'string' })
  .argv;

/**
 * Get Package Name
 * @param {string content of package.json} content 
 */
const getPkgName = (content) => {
  if (util.isString(content)) content = JSON.parse(content);
  const names = content.name.split('/');
  return ((names.length < 2) ? content.name : names[1]);
};

/**
 * Common directory setup
 * @param {src file or files} src 
 * @param {destination of output file} dest 
 */
const getDir = (src, dest) => {
  const tmp = '.tmp', folder = getFolder(src), srcBaseDir = src.replace('/**/*.ts', '');
  const pkgFileSrc = require(path.join(path.resolve(srcBaseDir), 'package.json'));
  const pkgName = getPkgName(pkgFileSrc);
  return {
    folder: folder,
    files: getFiles(src),
    destPath: dest || config.build.dest,
    tmp: tmp,
    pkgName: pkgName,
    pkgFileSrc: pkgFileSrc,
    destBaseDir: path.join(path.resolve(tmp), pkgName),
    srcBaseDir: srcBaseDir
  }
};

/**
 * Get the Temporary path
 * @param {sourc file} file 
 * @param {destination file} dest 
 */
const getTempPath = (file, dir) => { 
  return file.replace('src', `${dir.tmp}`)
    .replace(`/${argv.libs}/${dir.pkgName}`, `/${dir.pkgName}/src`)
    .replace(`/app`, `/${dir.pkgName}/src`);
};

/** Get source folder */
const getFolder = (src) => path.basename(path.dirname(src.replace('/**', '')))

/**
 * It will inline a template and style
 * @param {src file to be inline} file 
 * @param {destination of of the file} dest 
 */
const copyFileAsync = (file, dest) => {
  mkdirp(path.dirname(dest));
  return readFileAsync(file, 'utf8')
    .then(content => inlineResourcesFromString(content, url => path.join(path.dirname(file), url)))
    .then(content => Promise.all([ Promise.resolve(content), writeFileAsync(dest, content) ]));
};

/**
 * Inline templateUrl path to html text, inline stylesUrl to css text
 * convert the scss path to css
 * @param {ts source file} file 
 * @param {destination of inline ts file} dest 
 */
const inlineFileAsync = (file, dir) => {
  const tempPath = getTempPath(file, dir);
  return copyFileAsync(file, tempPath)
    .then(contents => {
      const cachePath = file.replace(getSource(file), config.cacheBaseDir);
      const hasCache = (fs.existsSync(cachePath) && fs.statSync(tempPath).size === fs.statSync(cachePath).size);
      return (hasCache) ? Promise.resolve() 
        : Promise.all([ 
          Promise.resolve(tempPath),
          new Promise((resolve, reject) => {
            mkdirp(path.dirname(cachePath)); 
            resolve(cachePath);
          }).then(cachePath => writeFileAsync(cachePath, contents[0]))
        ]);
    });
};

/**
 * Copy all inline files
 * @param {list of files} files 
 * @param {destination of the output file} dest 
 */
const copyFilesAsync = (files, dir) => Promise.all(files.map(file => inlineFileAsync(file, dir)));

/**
 * This will copy ts and json files
 * @param {destination of the files} dest 
 */
const copyEntryAsync = (dir) => {
  return Promise.all(Object.keys(misc).map(file => {
    const pkgName = getPkgName(Object.assign({}, dir.pkgFileSrc));
    const content = misc[file].replace('package-name-js', pkgName).replace('package-name', `${pkgName}.js`);
    return writeFileAsync(path.join(dir.destBaseDir, file), content) 
  }));
};

/**
 * It will copy package.json file
 * @param {common directory} dir 
 */
const copyPkgFile = (dir) => {
  const pkgName = getPkgName(dir.pkgFileSrc), destPath = path.join(dir.destBaseDir, 'package.json');
  if (!(dir.pkgFileSrc['typings'])) {
    Object.assign(dir.pkgFileSrc, { typings: `./${pkgName}.d.ts` });
  }
  return writeFileAsync(destPath, JSON.stringify(dir.pkgFileSrc, '\t', 2));
};

/**
 * BuildAsync files
 * @param {source of typescript file} src 
 * @param {destination where to write or save transpile file} dest 
 */
const buildProd = (src, dest) => {
  const dir = getDir(src, dest);
  mkdirp(path.resolve(dir.destBaseDir));
  return Promise.all([ copyPkgFile(dir), copyEntryAsync(dir), Promise.all(dir.files.map(filePaths => copyFilesAsync(filePaths, dir))) ])
    .then(() => {
      const tempFolder = path.join(dir.tmp, getFolder(src)).replace('app', argv.main);
      return Promise.all([
        ngc([ '--project', `${tempFolder}/tsconfig-esm5.json` ]),
        ngc([ '--project', `${tempFolder}/tsconfig-esm2015.json` ])
      ])
    });
};

/**
 * Get All currect directories und `src` folder
 */
const getSrcDirectories = () => {
  const libSrc = `src/${argv.libs}`;
  return (devtools && devtools['build'] && devtools.build['prod'])
    ? Promise.resolve(devtools.build['prod'].src.map(directory => directory.replace('/**/*.ts', '')))
    : readdirAsync(path.resolve(libSrc)).then(files => {
        const filePath = (file) => path.resolve(path.join(libSrc, file));
        const directories = files.filter(file => fs.statSync(filePath(file)).isDirectory());
        const folders = ['src/app/'].concat(directories.map(directory => path.join(libSrc, directory)))
        return Promise.resolve(folders);
      });
};

/**
 * Execute the build with current directories
 */
const build = () => {
  return getSrcDirectories().then(directories => {
    const folders = directories.map(folder => path.join(folder, '/**/*.ts'));
    return Promise.all(folders.map(folder => buildProd(folder)))
  });
};

exports.build = build;
exports.buildProd = buildProd;