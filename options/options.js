function saveOptions(e) {
  e.preventDefault();
  // console.log("save pressed")

  browser.storage.sync.get().then( sync_storage => {
    const new_usdb_config = {
      "general": {
        "prepend_id_column": document.querySelector("#cb-prepend-id-column").checked
      },
      "categories": sync_storage["config"]["categories"].map( (obj, index) => {
        label = document.querySelector(`#label-${index}`).textContent
        color = document.querySelector(`#color-${index}`).value
        ids = document.querySelector(`#ids-${index}`).value
              .replace(/\s/g,",")
              .replace(/,+/g,",")
              .split(",")
              .filter(val => val !== "")
              .map(val => Number(val))
        return {
          "label": label,
          "color": color,
          "ids": [...new Set(ids)] //!< unique ids
                .sort((a,b) => { if (a<b) {return -1}; return 1})
        }
      })
    }

    browser.storage.sync.set({
      "config": new_usdb_config,
    });

    restoreOptions()
  })
}

function get_config_default() {
  return {
    "general": {
      "prepend_id_column": true
    },
    "categories": [
      {"label": "done", "color": "#C3EDC0", "ids": []},
      {"label": "staged", "color": "#FDFFAE", "ids": []},
      {"label": "challenging", "color": "#FF9B9B", "ids": []}
    ]
  }
}

function restoreOptions() {
  // console.log("restoreOptions")

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.sync.get().then( sync_storage => {
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

      document.querySelector("#cb-prepend-id-column").checked = usdb_config.general.prepend_id_column
      for (let index in usdb_config.categories) {
        const scope = usdb_config.categories[index]
        document.querySelector(`#label-${index}`).textContent = scope["label"]
        document.querySelector(`#color-${index}`).value = scope["color"]
        document.querySelector(`#color-${index}`).style["background-color"] = scope["color"]
        document.querySelector(`#ids-${index}`).value = scope["ids"]
          .sort((a,b) => { if (a<b) {return -1}; return 1})
          .join(",")
        const ids_label = document.querySelector(`#ids-${index}`).parentElement
        // ids_label.style["display"] = "flex"
        // ids_label.style["flex-direction"] = "column"
      }
    },
    onError)

    const headlines = document.getElementsByTagName("h2")
    for (let i=0; i<headlines.length; i++) {
      headlines[i].style["margin-bottom"] = "0.1em"
    }

    const categoriesSection = document.querySelector("#categories-section")
    const categoriesHeadline = categoriesSection.getElementsByTagName("h1")[0]
    categoriesHeadline.style.marginTop = "2em";
    categoriesHeadline.style.marginBottom = 0

    const sections = categoriesSection.getElementsByTagName("section")
    for (let i=0; i<sections.length; i++) {
      sections[i].style["display"] = "flex"
      sections[i].style["flex-direction"] = "column"
      sections[i].style["gap"] = "0.5em"
    }
    const labels = categoriesSection.getElementsByTagName("label")
    for (let i=0; i<labels.length; i++) {
      labels[i].style["display"] = "flex"
      labels[i].style["flex-direction"] = "column"
      labels[i].style["gap"] = "0.25em"
    }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);