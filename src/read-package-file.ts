import { sep, join, basename } from 'path';

import { readFileAsync  } from '@ngx-devtools/common';
import { getPkgName } from './pkg-name';

function getFilePath(src) {
  const source = src.split(sep).join('/').replace('/**/*.ts', '');
  return (basename(source).includes('package.json')) ? source : join(source, 'package.json');
}

async function readPackageFile(src) {
  return readFileAsync(getFilePath(src), 'utf8').then(content => {
    return getPkgName(content);
  });
};

export { readPackageFile }