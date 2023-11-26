// UTILITY FUNCTIONS

function get_config_default() {
  // console.log("get_config_default")
  return {
    "general": {
      "prepend_id_column": true,
      "remove_on_click": true,
      "categories_url": ""
    },
    "categories": [
      {"label": "My Songs", "color": "#C3EDC0", "ids": []}
    ]
  }
}

function get_config_or_set_default(sync_storage) {
  // default settings
  let usdb_config = {...get_config_default()}
  if ("config" in sync_storage) {
    // retrieve settings from sync storage
    usdb_config = sync_storage["config"]
    // transition from v0.1.0 to v1.0.0
    if(Array.isArray(usdb_config)) {
      usdb_config = {...get_config_default(), "categories": usdb_config}
      browser.storage.sync.set({"config": usdb_config})
    }
  } else {
    // set default settings
    browser.storage.sync.set({"config": usdb_config})
  }
  return usdb_config
}

// 
//
//

browser.storage.sync.get().then( sync_storage => {
    usdb_config = get_config_or_set_default(sync_storage)
    const usdb_id = Number(new URLSearchParams(document.URL).get("id"))
    // console.log(usdb_id)
    const details_section = document.getElementById("tablebg")
                                    .getElementsByClassName("row1")[0]
                                    .getElementsByTagName("table")[0]



    for (let conf of usdb_config.categories) {
      // console.log(conf)
      if (conf.ids.includes(usdb_id)) {
        // console.log("found")
        // console.log(details_section)
        details_section.style["background-color"] = `${conf.color}`
        // details_section.style["border"] = `2px solid ${conf.color}`
        break
      }
    }
  }
)
