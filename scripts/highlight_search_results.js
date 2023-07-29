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
        