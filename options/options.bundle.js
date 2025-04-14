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
  // console.log("sync_storage")
  // console.log(sync_storage)

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

function showSuccess() {
  // show success and hide it after 3 sec
  const successMessage = document.querySelector("#success-msg");
  successMessage.style.display = "block";
  setTimeout(function () {
      successMessage.style.opacity = 1;
  }, 10); // Delay the fade-in just a bit for the transition to work

  // Set a timeout to hide the success message after 3 seconds with a fade-out
  setTimeout(function () {
      successMessage.style.opacity = 0;
      setTimeout(function () {
          successMessage.style.display = "none";
      }, 500); // Make sure to hide the element after the fade-out transition
  }, 3000);
}


async function showError(message) {
  // show success and hide it after 3 sec
  const errorMessage = document.querySelector("#error-msg");
  errorMessage.style.display = "block";
  errorMessage.innerHTML = `<b>Error:</b> ${message}`;
  setTimeout(function () {
    errorMessage.style.opacity = 1;
  }, 10); // Delay the fade-in just a bit for the transition to work

  // Set a timeout to hide the success message after 3 seconds with a fade-out
  setTimeout(function () {
    errorMessage.style.opacity = 0;
      setTimeout(function () {
        errorMessage.style.display = "none";
      }, 500); // Make sure to hide the element after the fade-out transition
  }, 10000);
}

async function saveOptions(event) {
  event.preventDefault();
  // console.log("save pressed")

  const new_usdb_config = {
    "page": {
      "search_results": {
        "prepend_id_column": document.querySelector("#cb-search_results-prepend-id-column").checked,
        "remove_on_click": document.querySelector("#cb-search_results-remove-onclick").checked,
      }
    },
    "common": {
      "categories_url": document.querySelector("#le-categories-url").value,
      /* https://stackoverflow.com/a/53350150
        * > If you're using ES6, you can use [...selectors] syntax, like this:
        */
      "categories": [
          ...document.querySelector("#categories-section").querySelectorAll("section")
        ].map( (obj, index) => {
          const label = document.querySelector(`#label-${index}`).textContent;
          const color = document.querySelector(`#color-${index}`).value;
          const ids = document.querySelector(`#ids-${index}`).value
                      .replace(/\s/g,",")
                      .replace(/,+/g,",")
                      .split(",")
                      .filter(val => val !== "")
                      .map(val => Number(val));
          return {
            "label": label,
            "color": color,
            "ids": [...new Set(ids)] //!< unique ids
                  .sort((a,b) => { if (a<b) {return -1} return 1})
          }
      })
    },
  };
  // console.log(new_usdb_config)

  try {
    const last_usdb_config = await get_config_or_set_default();
    await set_config({...last_usdb_config, ...new_usdb_config}); // last_config in order to keep all unmentioned configs (e.g. legacy)
  } catch (error) {
    if (error.message.startsWith("QuotaExceededError")) {
      showError("saving changes failed, not enough space available");
      console.error(error);
    } else {
      showError(`saving changes failed due to ${error.message}`);
      console.error(error);
    }
    return
  }

  await restoreOptions();
  showSuccess();
}

function getCategorySectionTemplate() {
  const template = document.querySelector("#category-section-template");
  const section = template.content.querySelector("section");
  const clonedSection = section.cloneNode(true);
  return clonedSection;
}

function createCategorySection(data, index) {
  const new_section = getCategorySectionTemplate();
  const header = new_section.querySelector("h2");
  header.setAttribute("id", `label-${index}`);
  header.textContent = data["label"];
  const color_input = new_section.querySelector("input");
  color_input.setAttribute("id", `color-${index}`);
  color_input.setAttribute("name", `color-${index}`);
  color_input.value = data["color"];
  color_input.style["background-color"] = data["color"];
  const ids_textarea = new_section.querySelector("textarea");
  ids_textarea.setAttribute("id", `ids-${index}`);
  ids_textarea.setAttribute("name", `ids-${index}`);
  ids_textarea.value = data["ids"]
    .sort((a,b) => { if (a<b) {return -1} return 1})
    .join(",");
  return new_section
}

function writeCategories(categories) {
  const section = document.querySelector("#categories-section");
  // remove existing categories from settings page
  section.innerHTML = "<h1>USDB ID Categories</h1>";
  // create and append categorie sections
  for (let index in categories) {
    new_section = createCategorySection(categories[index], index);
    section.appendChild(new_section);
  }
}

async function restoreOptions() {
  // console.log("restoreOptions")

  let usdb_config;
  try {
    usdb_config = await get_config_or_set_default();
  } catch (error) {
    showError(error);
    return
  }

  document.querySelector("#cb-search_results-prepend-id-column").checked = usdb_config.page.search_results.prepend_id_column;
  document.querySelector("#cb-search_results-remove-onclick").checked = usdb_config.page.search_results.remove_on_click;
  document.querySelector("#le-categories-url").value = usdb_config.common.categories_url;
  writeCategories(usdb_config.common.categories);
}

async function reloadCategoriesFromUrl() {
  // console.log("reloadCategoriesFromUrl")
  const url = document.querySelector("#le-categories-url").value;
  if (url.length) {
    const res = await fetch(url);
    const content = await res.text();
    try {
      const json_content = JSON.parse(content);
      // console.log(json_content)
      if (!Array.isArray(json_content)) {
        showError("expected array in JSON");
        return
      }
      if (json_content.length === 0) {
        showError("expected array length >= 0");
        return
      }
      for (let index in json_content) {
        for ( property of ["label", "color", "ids"]) {
          if (!json_content[index].hasOwnProperty(property)) {
            showError(`missing property '${property}' in Element ${index}`);
            return
          }
        }
        if (!(typeof json_content[index]["label"] === "string") ) {
          showError("invalid format of property 'label', has to be a string");
          return
        }
        if (!json_content[index]["label"].match(/^[\w _-]+$/)) {
          showError("invalid format of property 'label', allows are only (non-empty) word characters, space, underscore and dash");
          return
        }
        if (!(typeof json_content[index]["color"] === "string") ) {
          showError("invalid format of property 'color', has to be a string");
          return
        }
        if (!json_content[index]["color"].match(/^#[a-fA-F0-9]{6}$/)) {
          showError("invalid format of property 'color', must be '#' followed by 3 hex values");
          return
        }
        if (!Array.isArray(json_content[index]["ids"])) {
          showError("invalid format of property 'ids', has to be an array");
          return
        }
        if (!json_content[index]["ids"].every(x => x>0)) {
          showError("invalid format of property 'ids', every array element has to be a positive integer");
          return
        }
      }
      writeCategories(json_content);
    } catch (error) {
      showError("invalid JSON!");
      console.error(error);
      return
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await restoreOptions();
});
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#url-reload-btn").addEventListener("click", reloadCategoriesFromUrl);
