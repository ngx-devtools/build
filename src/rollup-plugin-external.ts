
import { globFiles } from '@ngx-devtools/common';

async function autoRxjsPlugin(external, globals){
  const _config: any = { external: external, globals: globals };
  const files = await globFiles([ 'node_modules/rxjs/*.js', 'node_modules/rxjs/add/**/*.js' ])
  files.map(file => file.substr(file.match('rxjs').index, file.length).replace('.js', ''))
    .forEach(file => {
      if (!(_config.external.find(value => value === file))) {
        _config.external.push(file);
      }
      if (!(Object.keys(_config.globals).find(key => key === file))) {
        _config.globals[file] = file.split('/').join('.')
      }
    })
  return _config;
}

async function overrideRollupConfig({ inputOptions, outputOptions  }){
  const options: any = await autoRxjsPlugin(inputOptions.external, outputOptions.globals);
  const externals: any[] = options.external.filter(value => !(inputOptions.external.includes(value)));
  inputOptions.external = externals.concat(inputOptions.external.filter(value => (value !== '')));
  outputOptions.globals = options.globals;
  return { inputOptions, outputOptions };
}

export { overrideRollupConfig }