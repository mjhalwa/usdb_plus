function get_config_default() {
  // console.log("get_config_default")
  return {
    "page": {
      "search_results": {
        "prepend_id_column": true,
        "remove_on_click": true,
      }
    },
    "common": {
      "categories_url": "",
      "categories": [
        {"label": "My Songs", "color": "#C3EDC0", "ids": []}
      ]
    },
    "legacy": {
      "syncStorageImportDone": false
    }
  }
}

const CONFIG_KEY = "usdb_plus";

async function set_config(new_usdb_config) {
  await browser.storage.local.set({[CONFIG_KEY]: new_usdb_config});
}

/**
 * check for configs still in sync storage as in versions <=1.2.0 and
 * import them to local storage, deletes sync storage config
 * @param {*} usdb_config currently valid configuration
 * @returns {Promise} reolving valid config of open imports from sync storage,
 *          else input `usdb_config` with checked `legacy.syncStorageImportDone`
 */
async function try_import_from_sync_storage(usdb_config) {
  const new_usdb_config = {...usdb_config};  // be sure to deep copy
  const OLD_CONFIG_KEY = "config";
  const sync_storage = await browser.storage.sync.get();
  console.log("sync_storage");
  console.log(sync_storage);

  if (OLD_CONFIG_KEY in sync_storage) {
    // retrieve settings from sync storage
    let old_usdb_config = sync_storage[OLD_CONFIG_KEY];

    // transition from v0.1.0 to v1.0.0
    if(Array.isArray(old_usdb_config)) {
      old_usdb_config = {
        "general": {
          // adding default values here
          "prepend_id_column": true,
          "remove_on_click": true,
          "categories_url": ""
        },
        "categories": old_usdb_config
      };
    }

    // merge into new config
    new_usdb_config.page.search_results.prepend_id_column=old_usdb_config.general.prepend_id_column;
    new_usdb_config.page.search_results.remove_on_click=old_usdb_config.general.remove_on_click;
    new_usdb_config.common.categories_url = old_usdb_config.general.categories_url;
    new_usdb_config.common.categories = [...old_usdb_config.categories];

    // first set new config
    try {
      await set_config(new_usdb_config);
    } catch (error) {
      console.error(`Error updating config from legacy sync storage: ${error}`);
      throw error
    }

    console.log("successfully updated config from legacy sync storage");

    // ... then delete sync_storage
    try {
      await browser.storage.sync.remove(OLD_CONFIG_KEY);
    } catch (error) {
      console.error(`Error deleting legacy sync storage: ${error}`);
      throw error
    }

    console.log("successfully deleted config from sync storage");

    new_usdb_config.legacy.syncStorageImportDone = true;
  }

  // in any case mark importing from sync storage as done
  // (also for newer uses that have never uses sync storage versions of this addon)
  new_usdb_config.legacy.syncStorageImportDone = true;
  await set_config(new_usdb_config);

  return new_usdb_config
}

async function get_config_or_set_default() {

  const local_storage = await browser.storage.local.get();
  // console.log(local_storage)

  // default settings
  let usdb_config;
  if (CONFIG_KEY in local_storage) {
    usdb_config = {...local_storage[CONFIG_KEY]};  // be sure to deep copy
  } else {
    usdb_config = {...get_config_default()};  // be sure to deep copy
    await set_config(usdb_config);
  }

  if (!usdb_config.legacy.syncStorageImportDone) {
    try {
      usdb_config = await try_import_from_sync_storage(usdb_config);
    } catch (error) {
      console.error("Sync storage import failed:", error);
    }
  }

  // No need to call set_config again - all changes where already set with await
  return usdb_config
}

(async () => {
  // required work-around instead of top-level async/await until type="module" is supported in manifest.json

  // on every page load
  // ... first get config
  const usdb_config = await get_config_or_set_default();
  const commonConfig = usdb_config.common;

  // ... then execute
  const usdb_id = Number(new URLSearchParams(document.URL).get("id"));
  // console.log(usdb_id)
  const details_section = document.getElementById("tablebg")
                                  .getElementsByClassName("row1")[0]
                                  .getElementsByTagName("table")[0];

  for (let conf of commonConfig.categories) {
    // console.log(conf)
    if (conf.ids.includes(usdb_id)) {
      // console.log("found")
      // console.log(details_section)
      details_section.style["background-color"] = `${conf.color}`;
      // details_section.style["border"] = `2px solid ${conf.color}`
      break
    }
  }
})();
