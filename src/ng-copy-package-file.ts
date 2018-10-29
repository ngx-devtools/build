import { dirname, join } from 'path';

import { readFileAsync, writeFileAsync, mkdirp } from '@ngx-devtools/common';

import { getFilePath } from 'read-package-file';
import { getPkgName } from 'pkg-name';

export async function copyPackageFile(src: string, dest?: string) {
  return readFileAsync(getFilePath(src), 'utf8').then(content => {
    const pkg = JSON.parse(content);
    const pkgName = getPkgName(pkg);

    Object.assign(pkg, {
      main: `./bundles/${pkgName}.umd.js`,
      module: `./esm2015/${pkgName}.js`, 
      typings: `./${pkgName}.d.ts` 
    });

    content = JSON.stringify(pkg, null, 2);
    const destPath = join(process.env.APP_ROOT_PATH, dest, pkgName, 'package.json');
    mkdirp(dirname(destPath));
    return writeFileAsync(destPath, content).then(() => pkgName);
  });
}