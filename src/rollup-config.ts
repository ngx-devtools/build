
const configs = {
  inputOptions: {
    treeshake: true,
    onwarn (warning) {
      if (warning.code === 'THIS_IS_UNDEFINED') { return; }
      console.log("Rollup warning: ", warning.message);
    },
    external: []
  },
  outputOptions: {
    sourcemap: true,
    exports: 'named',
    globals: {}
  }
}

export { configs }