function saveOptions(e) {
  e.preventDefault();
  // console.log("save pressed")

  browser.storage.sync.get().then( sync_storage => {
    const new_usdb_config = sync_storage["config"].map( (obj, index) => {
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
    console.log(new_usdb_config)

    browser.storage.sync.set({
      "config": new_usdb_config,
    });

    restoreOptions()
  })

}

function restoreOptions() {
  // console.log("restoreOptions")

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.sync.get().then( sync_storage => {
      // console.log(sync_storage)
      // default settings
      let usdb_config = [
        {"label": "done", "color": "#C3EDC0", "ids": []},
        {"label": "staged", "color": "#FDFFAE", "ids": []},
        {"label": "challenging", "color": "#FF9B9B", "ids": []}
      ]
      if ("config" in sync_storage) {
        // retrieve settings from sync storage
        usdb_config = sync_storage["config"]
      } else {
        // set default settings
        browser.storage.sync.set({"config": usdb_config})
      }

      for (let index in usdb_config) {
        const scope = usdb_config[index]
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

    const sections = document.getElementsByTagName("section")
    for (let i=0; i<sections.length; i++) {
      sections[i].style["display"] = "flex"
      sections[i].style["flex-direction"] = "column"
      sections[i].style["gap"] = "0.5em"
    }
    const headlines = document.getElementsByTagName("h2")
    for (let i=0; i<headlines.length; i++) {
      headlines[i].style["margin-bottom"] = "0.1em"
    }
    const labels = document.getElementsByTagName("label")
    for (let i=0; i<labels.length; i++) {
      labels[i].style["display"] = "flex"
      labels[i].style["flex-direction"] = "column"
      labels[i].style["gap"] = "0.25em"
    }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);