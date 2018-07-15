import { sep, join } from 'path';

import { inlineResource, globFiles } from '@ngx-devtools/common';

import { readPackageFile } from './read-package-file';

const getTempPath = (file: string, pkgName: string) => {
  const tempSource = `.tmp\/${pkgName}\/src`;
  return file.replace(process.env.APP_ROOT_PATH + sep, '') 
    .replace('src' + sep, '')
    .replace('elements' + sep, '')
    .replace('libs' + sep, '')
    .replace(join(pkgName, 'src'), tempSource)
    .replace(`app`, tempSource);
}

async function inlineSources(src: string | string[], pkgName: string){
  return globFiles(src).then(files => {
    return Promise.all(files.map(file => {
      return inlineResource(file, getTempPath(file, pkgName))
    }))
  })
}

async function buildDev(src: string, dest: string) {
  return readPackageFile(src)
    .then(pkgName => inlineSources(src, pkgName))
}

export { buildDev, inlineSources, getTempPath }