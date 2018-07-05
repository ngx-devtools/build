(() => {
  const importComponents = (files) => {
    return files.reduce((promise, file) => {
        switch(typeof file){
          case "string":
            return promise.then(() => System.import(file));
          case "object":
            if(Array.isArray(file)){
              return promise.then(() => Promise.all(file.map(fileMap => System.import(fileMap))));
            }
        }
    }, Promise.resolve());
  }
  fetch('/api/config')
    .then(res => res.json())
    .then(data => {
      System.config(data.config);
      const vendors = data.vendors, components = data.components;
      return Promise.all(vendors.map(vendor => System.import(vendor)))
          .then(() => importComponents(components))
    })
    .catch((e) => { console.error(e.stack || e) })
})();