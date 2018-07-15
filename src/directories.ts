import { join } from 'path';
import { statSync } from 'fs';
import { isString } from 'util';

import { readdirAsync } from '@ngx-devtools/common';

interface SourceDirOptions {
  src: string;
  dest: string;
}

function getSource(directory: string | SourceDirOptions){
  return (isString(directory)) 
    ? { src: directory.replace('/**/*.ts', ''), dest: 'dist' }
    : { src: directory.src.replace('/**/*.ts', ''), dest: directory.dest }
};

async function getSrcDirectories(srcDir: string) {
  return readdirAsync(srcDir)
    .then(files => {
      const filePath = (file) => join(process.env.APP_ROOT_PATH, srcDir, file);
      const directories = files.filter(file => statSync(filePath(file)).isDirectory());
      return directories.map(directory => getSource(join(srcDir, directory, 'package.json')));
    });
}

export { getSrcDirectories, getSource, SourceDirOptions }