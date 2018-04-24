const { rollup } = require('rollup')

const config = {
  input: null,
  treeshake: true,
  output: {
    name: '',
    format: '',
    sourcemap: true,
    exports: 'named',
    globals: {
    },
    external: [
    ] 
  }
};

module.exports = () => {
  rollup(config)
    .then(bundle => {
      
    })
};