const path = require('path');

const pkg = require(path.resolve('package.json'));

module.exports = {
  name: "auto-external",
  options (opts) {
    if (pkg['dependencies']) {
      const dependenciesKeys = Object.keys(pkg.dependencies);
      if (dependenciesKeys){
        
      }
    }
  }
}