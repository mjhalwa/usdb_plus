browser.storage.sync.get().then( sync_storage => {
  console.log(sync_storage)
  if ("config" in sync_storage) {
    const usdb_config = sync_storage["config"]
    const result_table = document.getElementById("tablebg").getElementsByTagName("table")[0]
    const result_rows = result_table.getElementsByTagName("tr")
            
    for ( let i=0; i<result_rows.length; i++ ) {
      const first_original_column = result_rows[i].children[0]
      if (result_rows[i].className === "list_head") {
        // Table Head
        // insert head for column with usdb ID
        const th_usdb_id = document.createElement("td");  //!< Note: usdb uses <td> for heads
        th_usdb_id.baseURI = first_original_column.baseURI
        const order_link = document.createElement("a");
        order_link.href = first_original_column.children[0].href.replace("&order=interpret","&order=id")
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
        result_rows[i].insertBefore(th_usdb_id, first_original_column)

      } else {
        // Table Row
        const attr_onclick = first_original_column.attributes["onclick"]
        const usdb_id = Number(attr_onclick.textContent.replace(/^[^0-9]*([0-9]+)[^0-9]*$/, "$1"))

        // insert column with usdb ID
        const td_usdb_id = document.createElement("td");
        td_usdb_id.attributes = first_original_column.attributes
        td_usdb_id.textContent = usdb_id.toString()
        result_rows[i].insertBefore(td_usdb_id, first_original_column)

        // apply row background color based on configuration and usdb_id
        for (let conf of usdb_config) {
          if (conf.ids.includes(usdb_id)) {
            result_rows[i].style["background-color"] = `${conf.color}`
            break
          }
        }
      }
    }
  } else {
    console.log("empty config!")
  }
})
        