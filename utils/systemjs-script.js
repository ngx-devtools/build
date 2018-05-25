(() => {
  fetch('/api/config')
    .then(res => res.json())
    .then(data => {
      System.config(data.config);
      const vendors = data.vendors, components = data.components;
      return Promise.all(vendors.map(vendor => System.import(vendor)))
        .then(() => { 
          return Promise.all(components.map(component => System.import(component))) 
        });
    })
    .catch((e) => { console.error(e.stack || e) })
})()