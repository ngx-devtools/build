const { createRollupConfig } = require('@ngx-devtools/common');

const getRollupConfig = (options = {}) => {
  const PKG_NAME = 'build';
  const ENTRY_FILE = `.tmp/${PKG_NAME}.ts`;
  const rollupOptions = { 
    input: ENTRY_FILE, 
    tsconfig: '.tmp/tsconfig.json',
    external: [ 
      '@ngx-devtools/common'
    ],
    output: {
      file: `dist/${PKG_NAME}.js`, 
      format: 'cjs'
    }
  }
  return createRollupConfig({ ...rollupOptions, ...options });
}

exports.getRollupConfig = getRollupConfig;