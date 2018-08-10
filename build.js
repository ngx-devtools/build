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
  const entryFile = `.tmp/${PKG_NAME}.ts`;

  const files = await globFiles('src/**/*.*');

  const rootPathSrc = join(resolve(), sep, 'src', sep);
  const sourceFiles = files.filter(predicateFilter).map(predicateMap).join('\n');

  function predicateFilter(file){
    return extname(file) === '.ts'
  }

  function predicateMap(file){
    return `export * from '${file.replace(rootPathSrc, './').replace('.ts', '')}';`;
  }
  
  await Promise.all([ clean('.tmp'), clean('dist') ]);

  await mkdirp('.tmp');

  await Promise.all([
    Promise.all(files.map(file => {
      const destPath = file.replace('src', '.tmp');
      return copyFileAsync(file, destPath);
    })),
    writeFileAsync(entryFile, sourceFiles),
    buildCopyPackageFile(PKG_NAME)
  ])
  
  const rollupConfig = createRollupConfig({ 
    input: entryFile, 
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