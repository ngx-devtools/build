const { ngxBuild } =  require('@ngx-devtools/common');
const { getRollupConfig } = require('./rollup.config'); 

(async function() {
  const PKG_NAME = 'build';
  await ngxBuild(PKG_NAME, getRollupConfig());
})();

