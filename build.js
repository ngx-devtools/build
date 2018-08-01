const { buildCopyPackageFile, rollupBuild, createRollupConfig, clean, globFiles } =  require('@ngx-devtools/common');

(async function(){
  const PKG_NAME = 'build';
  const files = await globFiles('src/**/*.ts');

  const rollupConfig = createRollupConfig({ 
    input: files, 
    tsconfig: 'src/tsconfig.json',
    external: [ 
      '@ngx-devtools/common'
    ],
    output: {
      file: `dist/${PKG_NAME}.js`, 
      format: 'cjs'
    }
  })
  
  Promise.all([ clean('dist') ]).then(() => {
    return Promise.all([ buildCopyPackageFile(PKG_NAME), rollupBuild(rollupConfig) ])
  });
})();