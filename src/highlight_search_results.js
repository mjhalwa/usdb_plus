import { get_config_or_set_default, get_song_details, createSpinner } from "./util.js"

function isHeaderRow(row) {
  return (row.className === "list_head")
}

function getColumnHeaderIds(result_rows) {
  const header_row = Array.from(result_rows).filter(row => isHeaderRow(row))[0]
  return Array.from(header_row.children).map(col => col.firstElementChild?.id)
}

/**
 * find usdb id from non-header column
 * @param {*} row 
 * @returns 
 */
function get_row_usdb_id(row) {
  if (isHeaderRow(row)) {
    throw "cannot find id in header row"
  }
  const attr_onclick_text = Array
    .from(row.children)
    .map(col => col.attributes["onclick"]?.textContent)
    .filter(t => t !== undefined && t.match(/^show_detail\(\d+\)/))[0]
  usdb_id = Number(attr_onclick_text.replace(/^[^0-9]*([0-9]+)[^0-9]*$/, "$1"))
  return usdb_id
}

function setRowId(row, usdb_id) {
  if (!isHeaderRow(row)) {
    row.setAttribute("id", `row_${usdb_id}`)
  }
}

function prependIdColumn(row, usdb_id, column_header_ids) {
  const interpret_column = row.children[column_header_ids.indexOf("list_artist")]
  if (isHeaderRow(row)) {
    const th_usdb_id = document.createElement("td");  //!< Note: usdb uses <td> for heads
    th_usdb_id.baseURI = interpret_column.baseURI
    const order_link = document.createElement("a");
    order_link.href = interpret_column.firstElementChild.href.replace("&order=interpret","&order=id")
    if (window.location.href.includes("&order=id")) {
      order_link.href += (window.location.href.includes("&ud=asc")) ? "&ud=desc" : "&ud=asc"
    } else {
      order_link.href = order_link.href.replace(/&ud=(?:desc|asc)/, "" )
      order_link.href += "&ud=asc"
    }
    order_link.textContent = "ID"
    order_link.style = "color: #FFFFFF;text-decoration: none;"
    th_usdb_id.appendChild(order_link)
    if (window.location.href.includes("&order=id")) {
      if (window.location.href.includes("&ud=asc")) {
      } if (window.location.href.includes("&ud=desc")) {
        order_img = document.createElement("img")
        order_img.alt="absteigender"
        order_img.src="images/down_small.png"
        th_usdb_id.appendChild(order_img)
      } else {
        order_img = document.createElement("img")
        order_img.alt="aufsteigender"
        order_img.src="images/up_small.png"
        th_usdb_id.appendChild(order_img)
      }
    }
    row.insertBefore(th_usdb_id, interpret_column)

  } else {
    // insert column with usdb ID
    const td_usdb_id = document.createElement("td");
    td_usdb_id.attributes = interpret_column.attributes
    td_usdb_id.textContent = usdb_id.toString()
    row.insertBefore(td_usdb_id, interpret_column)
  }
}

async function addColumnsFromEditPage(row, usdb_id) {
  const last_column = row.lastElementChild
  if (isHeaderRow(row)) {
    for (col of ["v","a","co","bg"]) {
      const th_i = document.createElement("td");  //!< Note: usdb uses <td> for heads
      th_i.textContent = col
      row.insertBefore(th_i, last_column)
    }

    const th_players = document.createElement("td");  //!< Note: usdb uses <td> for heads
    th_players.textContent = "p1/p2"
    row.insertBefore(th_players, last_column)
  } else {
    for (col of ["v","a","co","bg"]) {
      const td_i = document.createElement("td");  //!< Note: usdb uses <td> for heads
      td_i.classList.add(col)
      td_i.appendChild(createSpinner())
      row.insertBefore(td_i, last_column)
    }

    const td_players = document.createElement("td");  //!< Note: usdb uses <td> for heads
    td_players.classList.add("players")
    td_players.appendChild(createSpinner())
    row.insertBefore(td_players, last_column)

    const song_details = await get_song_details(usdb_id)

    metatags = song_details.metatags_str.replace(/^#VIDEO:/,"").split(",").reduce((prev,curr) => {
      i = curr.search("=")
      value = curr.split("=")
      key = value[0]
      value = value.slice(1).join("=")
      return {...prev, [key]: value}
    }, {})

    for (col of ["v","a","co","bg"]) {
      const col_i = document.querySelector(`#row_${usdb_id} .${col}`)
      col_i.removeChild(col_i.firstElementChild)
      if (col in metatags) {
        col_i.textContent=col
        col_i.title=metatags[col]
      }
    }
    
    const col_players = document.querySelector(`#row_${usdb_id} .players`)
    col_players.removeChild(col_players.firstElementChild)
    if ("p1" in metatags && "p2" in metatags) {
      col_players.textContent=`${metatags["p1"]} / ${metatags["p2"]}`
    }
  }
}

function removeOnClick(row) {
  if (!isHeaderRow(row)) {
    [...row.querySelectorAll("td")].map(td => {
      td.removeAttribute("onclick")
      td.style.cursor = "auto"
    })
  }
}

/**
 * apply row background color based on configuration and usdb_id
 * @param {*} row 
 * @param {*} commonConfig
 * @param {*} usdb_id 
 */
function highlight_row(row, commonConfig, usdb_id) {
  if (!isHeaderRow(row)) {
    for (let conf of commonConfig.categories) {
      if (conf.ids.includes(usdb_id)) {
        row.style["background-color"] = `${conf.color}`
        break
      }
    }
  }
}

(async () => {
  // required work-around instead of top-level async/await until type="module" is supported in manifest.firefox.json

  // on every page load
  // ... first get config
  const usdb_config = await get_config_or_set_default()
  const pageConfig = usdb_config.page.search_results;
  const commonConfig = usdb_config.common;

  // ... then execute
  const result_table = document.getElementById("tablebg").getElementsByTagName("table")[0]
  const result_rows = result_table.getElementsByTagName("tr")

  const column_header_ids = getColumnHeaderIds(result_rows)
  for ( let i=0; i<result_rows.length; i++ ) {
    const usdb_id = (!isHeaderRow(result_rows[i])) ? get_row_usdb_id(result_rows[i]) : null
    setRowId(result_rows[i], usdb_id)
    if (pageConfig.prepend_id_column) {
      prependIdColumn(result_rows[i], usdb_id, column_header_ids)
    }
    await addColumnsFromEditPage(result_rows[i], usdb_id, column_header_ids)
    if (pageConfig.remove_on_click) {
      removeOnClick(result_rows[i])
    }
    highlight_row(result_rows[i], commonConfig, usdb_id)
  }
})();
