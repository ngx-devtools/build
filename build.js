const { 
  buildCopyPackageFile, 
  rollupBuild, 
  createRollupConfig, 
  clean, 
  globFiles, 
  mkdirp, 
  copyFileAsync, 
  writeFileAsync 
} =  require('@ngx-devtools/common');

const { resolve, sep, join, extname } = require('path');

(async function(){
  const PKG_NAME = 'build';
  const ENTRY_FILE = `.tmp/${PKG_NAME}.ts`;

  const files = await globFiles('src/**/*.*');

  const filter = file => extname(file) === '.ts';
  const map = file => `export * from '${file.replace(join(resolve(), sep, 'src', sep), './').replace('.ts', '')}';`;
  const sourceFiles = files.filter(filter).map(map).join('\n');
  
  await Promise.all([ clean('.tmp'), clean('dist') ]);

  await mkdirp('.tmp');

  await Promise.all([
    Promise.all(files.map(file => {
      const destPath = file.replace('src', '.tmp');
      return copyFileAsync(file, destPath);
    })),
    writeFileAsync(ENTRY_FILE, sourceFiles),
    buildCopyPackageFile(PKG_NAME)
  ])
  
  const rollupConfig = createRollupConfig({ 
    input: ENTRY_FILE, 
    tsconfig: '.tmp/tsconfig.json',
    external: [ 
      '@ngx-devtools/common'
    ],
    output: {
      file: `dist/${PKG_NAME}.js`, 
      format: 'cjs'
    }
  })

  await rollupBuild(rollupConfig);
})()