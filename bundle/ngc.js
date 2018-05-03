const path = require('path');

const ngc = require('@angular/compiler-cli/src/main').main;

const compile = (tmpSrc, appFolder = 'main') => {
  const tempFolder = path.resolve(tmpSrc.replace('/**/*.ts', '')).replace('app', appFolder)
  return Promise.all([ 
    ngc([ '--project', `${tempFolder}/tsconfig-esm5.json` ]), 
    ngc([ '--project', `${tempFolder}/tsconfig-esm2015.json` ]) 
  ]).then(() => Promise.resolve(tempFolder));
};

exports.compile = compile;