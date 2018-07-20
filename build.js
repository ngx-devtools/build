const { buildCopyPackageFile, rollupBuild, createRollupConfig, clean } =  require('@ngx-devtools/common');

const PKG_NAME = 'build';

const rollupConfig = createRollupConfig({ 
  input: `src/${PKG_NAME}.ts`, 
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