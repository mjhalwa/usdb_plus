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

function get_config_or_set_default(sync_storage) {
  // default settings
  let usdb_config = {...get_config_default()};
  if ("config" in sync_storage) {
    // retrieve settings from sync storage
    usdb_config = sync_storage["config"];
    // transition from v0.1.0 to v1.0.0
    if(Array.isArray(usdb_config)) {
      usdb_config = {...get_config_default(), "categories": usdb_config};
      browser.storage.sync.set({"config": usdb_config});
    }
  } else {
    // set default settings
    browser.storage.sync.set({"config": usdb_config});
  }
  return usdb_config
}

var currentlyPlaying = null;

function isHeaderRow(row) {
  return (row.className === "list_head")
}

function get_row_usdb_id(row) {
  let usdb_id = -1;
  if (!isHeaderRow(row)) {
    const attr_onclick = row.firstElementChild.attributes["onclick"];
    usdb_id = Number(attr_onclick.textContent.replace(/^[^0-9]*([0-9]+)[^0-9]*$/, "$1"));
  }
  return usdb_id
}

function setRowId(row, usdb_id) {
  if (!isHeaderRow(row)) {
    row.setAttribute("id", `row_${usdb_id}`);
  }
}

function prependIdColumn(row, usdb_id) {
  const first_original_column = row.firstElementChild;
  if (isHeaderRow(row)) {
    const th_usdb_id = document.createElement("td");  //!< Note: usdb uses <td> for heads
    th_usdb_id.baseURI = first_original_column.baseURI;
    const order_link = document.createElement("a");
    order_link.href = first_original_column.firstElementChild.href.replace("&order=interpret","&order=id");
    if (window.location.href.includes("&order=id")) {
      order_link.href += (window.location.href.includes("&ud=asc")) ? "&ud=desc" : "&ud=asc";
    } else {
      order_link.href = order_link.href.replace(/&ud=(?:desc|asc)/, "" );
      order_link.href += "&ud=asc";
    }
    order_link.textContent = "ID";
    order_link.style = "color: #FFFFFF;text-decoration: none;";
    th_usdb_id.appendChild(order_link);
    if (window.location.href.includes("&order=id")) {
      if (window.location.href.includes("&ud=asc")) ; if (window.location.href.includes("&ud=desc")) {
        order_img = document.createElement("img");
        order_img.alt="absteigender";
        order_img.src="images/down_small.png";
        th_usdb_id.appendChild(order_img);
      } else {
        order_img = document.createElement("img");
        order_img.alt="aufsteigender";
        order_img.src="images/up_small.png";
        th_usdb_id.appendChild(order_img);
      }
    }
    row.insertBefore(th_usdb_id, first_original_column);

  } else {
    // insert column with usdb ID
    const td_usdb_id = document.createElement("td");
    td_usdb_id.attributes = first_original_column.attributes;
    td_usdb_id.textContent = usdb_id.toString();
    row.insertBefore(td_usdb_id, first_original_column);
  }
}

/* created by ChatGPT */
function createSpinner() {
  const spinnerContainer = document.createElement('div');
  spinnerContainer.classList.add('spinner-container');
  spinnerContainer.style.display = 'flex';
  spinnerContainer.style.justifyContent = 'center';
  spinnerContainer.style.alignItems = 'center';

  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  spinner.style.border = '0.2em solid rgba(0, 0, 0, 0.1)';
  spinner.style.borderTop = '0.2em solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '1em';
  spinner.style.height = '1em';
  spinner.style.animation = 'spin 1s linear infinite';

  let keyframesStyle = document.getElementById('spinner-keyframes');

  if (!keyframesStyle) {
    keyframesStyle = document.createElement('style');
    keyframesStyle.id = 'spinner-keyframes';
    keyframesStyle.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(keyframesStyle);
  }

  spinnerContainer.appendChild(spinner);
  return spinnerContainer;
}

function updateButtonText(audio, isPlaying) {
  const playButton = document.querySelector(`#play_${audio.id}`);
  playButton.textContent = isPlaying ? '❚❚' : '▶︎';
}

function togglePlayPause(audioId) {
  const audio = document.querySelector(`#${audioId}`);

  if (currentlyPlaying && currentlyPlaying !== audio) {
      currentlyPlaying.pause();
      updateButtonText(currentlyPlaying, false);
  }

  if (audio.paused) {
      audio.play();
      currentlyPlaying = audio;
      updateButtonText(audio, true);
  } else {
      audio.pause();
      currentlyPlaying = null;
      updateButtonText(audio, false);
  }
}

function addColumnsFromEditPage(row, usdb_config, usdb_id) {
  const first_column = row.firstElementChild;
  const last_column = row.lastElementChild;
  if (isHeaderRow(row)) {
    const th_sample = document.createElement("td");  //!< Note: usdb uses <td> for heads
    th_sample.textContent = "▶︎/❚❚";
    row.insertBefore(th_sample, first_column);

    const th_usdb_cover = document.createElement("td");  //!< Note: usdb uses <td> for heads
    th_usdb_cover.textContent = "Cover";
    row.insertBefore(th_usdb_cover, first_column);

    for (col of ["v","a","co","bg"]) {
      const th_i = document.createElement("td");  //!< Note: usdb uses <td> for heads
      th_i.textContent = col;
      row.insertBefore(th_i, last_column);
    }

    const th_players = document.createElement("td");  //!< Note: usdb uses <td> for heads
    th_players.textContent = "p1/p2";
    row.insertBefore(th_players, last_column);
  } else {
    const td_sample = document.createElement("td");
    td_sample.classList.add("sample");
    td_sample.appendChild(createSpinner());
    row.insertBefore(td_sample, first_column);

    const td_usdb_cover = document.createElement("td");
    td_usdb_cover.classList.add("usdb_cover");
    td_usdb_cover.appendChild(createSpinner());
    row.insertBefore(td_usdb_cover, first_column);

    for (col of ["v","a","co","bg"]) {
      const td_i = document.createElement("td");  //!< Note: usdb uses <td> for heads
      td_i.classList.add(col);
      td_i.appendChild(createSpinner());
      row.insertBefore(td_i, last_column);
    }

    const td_players = document.createElement("td");  //!< Note: usdb uses <td> for heads
    td_players.classList.add("players");
    td_players.appendChild(createSpinner());
    row.insertBefore(td_players, last_column);

    fetch(`https://usdb.animux.de/?link=editsongs&id=${usdb_id}`)
      .then(res => res.text())
      .then(htmlString => {
        // create a temporary container
        const temp_element = document.createElement("div");
        // // Parse the HTML string and append it to the container using DOMParser
        // // should be save then using .innerHTML directly
        // const parser = new DOMParser();
        // const parsedDocument = parser.parseFromString(htmlString, 'text/html');
        // temp_element.appendChild(parsedDocument.body);
        temp_element.innerHTML = htmlString;

        const coverInput = temp_element.querySelector('#editCoverSampleTable input[name="coverinput"]');
        const coverHref = coverInput.value;
        const sampleInput = temp_element.querySelector('#editCoverSampleTable input[name="sampleinput"]');
        const sampleHref = sampleInput.value;
        const txtTextarea = temp_element.querySelector('table textarea[name="txt"]');
        const txt = txtTextarea.textContent;
        const metatags_str = txt.split("\n").filter(line => line.startsWith("#VIDEO"))[0];

        const sample_col = document.querySelector(`#row_${usdb_id} .sample`);
        if (sampleHref) {
          const source = document.createElement("source");
          source.src = sampleHref;
          source.type="audio/mpeg";
          const audio = document.createElement("audio");
          audio.setAttribute("id", `audio_${usdb_id}`);
          audio.appendChild(source);
          const playButton = document.createElement("button");
          playButton.onclick = () => togglePlayPause(`audio_${usdb_id}`);
          playButton.textContent = "▶︎";
          playButton.setAttribute("id", `play_audio_${usdb_id}`);
          sample_col.replaceChild(audio, sample_col.firstElementChild);
          sample_col.appendChild(playButton);
        } else {
          sample_col.removeChild(sample_col.firstElementChild);
        }

        const usdb_cover_col = document.querySelector(`#row_${usdb_id} .usdb_cover`);
        usdb_cover_col.style.height = "4em";
        usdb_cover_col.style.width = usdb_cover_col.style.height;
        if (coverHref) {
          const img = document.createElement("img");
          img.src = coverHref;
          img.style.height = "100%";
          img.style.aspectRatio = "1 / 1";
          usdb_cover_col.replaceChild(img, usdb_cover_col.firstElementChild);
        } else {
          usdb_cover_col.removeChild(usdb_cover_col.firstElementChild);
        }

        metatags = metatags_str.replace(/^#VIDEO:/,"").split(",").reduce((prev,curr) => {
          i = curr.search("=");
          value = curr.split("=");
          key = value[0];
          value = value.slice(1).join("=");
          return {...prev, [key]: value}
        }, {});
 
        for (col of ["v","a","co","bg"]) {
          const col_i = document.querySelector(`#row_${usdb_id} .${col}`);
          col_i.removeChild(col_i.firstElementChild);
          if (col in metatags) {
            col_i.textContent=col;
            col_i.title=metatags[col];
          }
        }
        
        const col_players = document.querySelector(`#row_${usdb_id} .players`);
        col_players.removeChild(col_players.firstElementChild);
        if ("p1" in metatags && "p2" in metatags) {
          col_players.textContent=`${metatags["p1"]} / ${metatags["p2"]}`;
        }
      });
  }
}

function removeOnClick(row) {
  if (!isHeaderRow(row)) {
    [...row.querySelectorAll("td")].map(td => {
      td.removeAttribute("onclick");
      td.style.cursor = "auto";
    });
  }
}

/**
 * apply row background color based on configuration and usdb_id
 * @param {*} row 
 * @param {*} usdb_id 
 */
function highlight_row(row, usdb_config, usdb_id) {
  if (!isHeaderRow(row)) {
    for (let conf of usdb_config.categories) {
      if (conf.ids.includes(usdb_id)) {
        row.style["background-color"] = `${conf.color}`;
        break
      }
    }
  }
}

browser.storage.sync.get().then( sync_storage => {
    const usdb_config = get_config_or_set_default(sync_storage);
    const result_table = document.getElementById("tablebg").getElementsByTagName("table")[0];
    const result_rows = result_table.getElementsByTagName("tr");
            
    for ( let i=0; i<result_rows.length; i++ ) {
      const usdb_id = get_row_usdb_id(result_rows[i]);
      setRowId(result_rows[i], usdb_id);
      if (usdb_config.general.prepend_id_column) {
        prependIdColumn(result_rows[i], usdb_id);
      }
      addColumnsFromEditPage(result_rows[i], usdb_config, usdb_id);
      if (usdb_config.general.remove_on_click) {
        removeOnClick(result_rows[i]);
      }
      highlight_row(result_rows[i], usdb_config, usdb_id);
    }
  }
);
