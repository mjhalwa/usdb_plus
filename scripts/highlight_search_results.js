browser.storage.sync.get().then( sync_storage => {
  console.log(sync_storage)
  if ("config" in sync_storage) {
    const usdb_config = sync_storage["config"]
    const result_table = document.getElementById("tablebg").getElementsByTagName("table")[0]
    const result_rows = result_table.getElementsByTagName("tr")
            
    for ( let i=0; i<result_rows.length; i++ ) {
      const attr_onclick = result_rows[i].children[0].attributes["onclick"]
      if (attr_onclick ?? false) {
        const usdb_id = Number(attr_onclick.textContent.replace(/^[^0-9]*([0-9]+)[^0-9]*$/, "$1"))
        for (let conf of usdb_config) {
          if (conf.ids.includes(usdb_id)) {
            result_rows[i].style["background-color"] = `${conf.color}`
            break
          }
        }
      }
    }
  } else {
    console.log("empty config!")
  }
})
        