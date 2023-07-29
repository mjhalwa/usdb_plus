const usdb_config = [
  {
    "label": "done",
    "color": "C3EDC0", // green
    "ids": [
      1327,
      1324,
      3715
    ]
  },
  {
    "label": "staged",
    "color": "FDFFAE", //yellow
    "ids": [
      1322,
      1555,
    ]
  },
  {
    "label": "challenging",
    "color": "FF9B9B", //red
    "ids": [
      1391,
      2311
    ]
  },
]

const usdb_id = Number(new URLSearchParams(document.URL).get("id"))
console.log(usdb_id)
const details_section = document.getElementById("tablebg")
                                .getElementsByClassName("row1")[0]
                                .getElementsByTagName("table")[0]



for (let conf of usdb_config) {
  console.log(conf)
  if (conf.ids.includes(usdb_id)) {
    console.log("found")
    console.log(details_section)
    details_section.style["background-color"] = `${conf.color}`
    // details_section.style["border"] = `2px solid ${conf.color}`
    break
  }
}
