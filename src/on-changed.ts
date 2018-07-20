import { buildDevElements, buildDevApp, buildDev } from './build-dev';
import { resolve, join, sep } from 'path';
import { copyFileAsync, injectHtml } from '@ngx-devtools/common';

const folders = [
  'elements',
  'app',
  'libs',
  'index.html'
]

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = resolve();
}

async function htmlChanged(src: string ){
  const source = join(process.env.APP_ROOT_PATH, src);
  const dest = source.replace('src', 'dist');
  return copyFileAsync(source, dest).then(() => {
    return injectHtml(dest)
  })
}

function getPaths(sources: string[], count: number) {
  const results = [];
  for (let i = 0; i < count; i++){
    results.push(sources[i]);
  }
  return results;
} 

async function build(src: string){
  const sources = src.split(sep);
  const buildClient = { 
    app: src => buildDevApp(),
    libs: src => buildDev(join(...getPaths(sources, 3), 'package.json'), 'dist'),
    elements: src => buildDevElements({ src: join(...getPaths(sources, 2)) })
  }
  return buildClient[sources[1]](src);
}

async function onClientFileChanged(src: string) {
  return (src && folders.find(folder => src.includes(folder))) 
    ? (src.includes('index.html')) ? htmlChanged(src): build(src)
    : Promise.resolve();
}

export { onClientFileChanged }