import { basename, join, dirname } from 'path';
import { existsSync } from 'fs';

import { mkdirp, writeFileAsync } from '@ngx-devtools/common';

const tsconfig = {
  "compilerOptions": {
    "declaration": true,
    "module": "es2015",
    "target": "es2015",
    "baseUrl": ".",
    "sourceMap": false,
    "stripInternal": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "outDir": "./esm2015",
    "rootDir": ".",
    "lib": ["es2015", "dom"],
    "skipLibCheck": true,
    "types": []
  },
  "angularCompilerOptions": {
    "annotateForClosureCompiler": true,
    "strictMetadataEmit": true,
    "skipTemplateCodegen": true,
    "flatModuleOutFile": "package-name-js",
    "flatModuleId": "package-name"
  },
  "files": [
    "./public_api.ts"
  ]
}

const esm5 = { 
  compilerOptions: { ...tsconfig.compilerOptions, ...{ target: 'es5', outDir: './esm5' } },
  angularCompilerOptions: { ...tsconfig.angularCompilerOptions },
  files: tsconfig.files
};

const entry = {
  "index.ts": `export * from './public_api'`,
  "public_api.ts": `export * from './src/index';`,
  "tsconfig-esm2015.json": JSON.stringify(tsconfig, null, 2),
  "tsconfig-esm5.json": JSON.stringify(esm5, null, 2)
}

export async function copyEntry(pkgName: string) {
  const tempSrc = join('.tmp', pkgName);
  return Promise.all(Object.keys(entry).map(file => {
    const pkgName = basename(tempSrc);
    const content = entry[file].replace('package-name-js', `${pkgName}.js`).replace('package-name', pkgName);
    const pathFile = join(tempSrc, file);
    mkdirp(dirname(pathFile));
    return (existsSync(pathFile)) ? Promise.resolve() : writeFileAsync(pathFile, content);    
  })).then(() => tempSrc);
};

