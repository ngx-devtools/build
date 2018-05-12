const path = require('path');
const fs = require('fs');

const { getFiles, mkdirp } = require('@ngx-devtools/common');

const rxjsPluginCachePath = path.resolve('node_modules/.tmp/cache/rxjs.json');
const rxjsPluginCache = fs.existsSync(rxjsPluginCachePath) ? require(rxjsPluginCachePath) : undefined;

const autoRxjsPlugin = (opts) => {
  const copyConfig = Object.assign({}, opts);
  const files =  getFiles([ 'node_modules/rxjs/*.js', 'node_modules/rxjs/add/**/*.js' ])
    .map(file => file.join(','))
    .join(',')
    .split(',');
  
  copyConfig['globals'] = {};

  files.map(file => file.substr(file.match('rxjs').index, file.length).replace('.js', ''))
    .forEach(file => { 
      if (!(copyConfig.external.find(value => value === file))) {
        copyConfig.external.push(file);
      }
      if (!(Object.keys(copyConfig['globals']).find(key => key === file))) {
        copyConfig['globals'][file] = file.split('/').join('.')
      }
    });

  return copyConfig;   
};

module.exports = () => {
  return {
    name: "rxjs external globals",
    options (opts) {
      let config = rxjsPluginCache;
      if (rxjsPluginCache === undefined) {
        config = autoRxjsPlugin(opts);
        mkdirp(path.dirname(rxjsPluginCachePath));
        fs.writeFileSync(rxjsPluginCachePath, JSON.stringify(config));
      }
      const tempOpts =Object.assign({}, opts);
      const externals = config.external.filter(value => !(tempOpts.external.includes(value)));
      tempOpts.external = externals.concat(tempOpts.external.filter(value => (value !== '')));

      return tempOpts;
    }
  }
};