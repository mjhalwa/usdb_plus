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

export function get_config_or_set_default(sync_storage) {
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