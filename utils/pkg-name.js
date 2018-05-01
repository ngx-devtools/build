const util = require('util');
const memoize = require('fast-memoize');

const getPkgName = (content) => {
  if (util.isString(content)) content = JSON.parse(content);
  const names = content.name.split('/');
  return ((names.length < 2) ? content.name : names[1]);
};

module.exports = memoize(getPkgName);