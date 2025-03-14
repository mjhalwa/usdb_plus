import { get_config_or_set_default } from "./util.js"

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
