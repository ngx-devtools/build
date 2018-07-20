import { isString } from 'util';

function getPkgName(content: any){
  if (isString(content)) content = JSON.parse(content);
  const names = content.name.split('/');
  return ((names.length < 2) ? content.name : names[1]);
}

export { getPkgName }

