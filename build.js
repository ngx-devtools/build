const { ngxBuild } =  require('@ngx-devtools/common');
const { getRollupConfig } = require('./rollup.config'); 

ngxBuild('build', getRollupConfig());