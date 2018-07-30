import { join, basename, dirname } from 'path';

import { rollupGenerate, createRollupConfig, rollupPluginUglify } from '@ngx-devtools/common';
import { inlineElementResources, BuildElementOptions } from './build-dev';

import { configs } from './rollup-config';

async function rollupProd(src: any, dest: string, options?: any){ 
  const entry = Array.isArray(src) ? src : join(src, 'src', 'index.ts');

  const pkgName = (options && options.output) ? options.output.name: basename(src);
  const file = (options && options.output) 
    ? options.output.file
    : join(src.replace('.tmp', dest), 'bundles', `${pkgName}.umd.js`);

  const rollupConfig = createRollupConfig({
    input: entry,
    overrideExternal: true,
    external: [],
    plugins: [ rollupPluginUglify() ],
    output: {
      ...configs.outputOptions,
      file: file,
      format: 'umd',
      name: pkgName,
      dir: dirname(file),
      globals: {}
    }
  });

  return rollupGenerate(rollupConfig);
}

async function buildProdElements(options: BuildElementOptions) {
  return inlineElementResources(options).then(inputs => {
    const elements = basename(options.src), destPath = options.dest || 'dist';
    return rollupProd(inputs, destPath, {
      output: { name: elements, file: join(destPath, elements, 'bundles', `${elements}.umd.js`) }
    })
  })
}

export { rollupProd, buildProdElements }