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

async function addColumnsFromEditPage(row, usdb_id) {
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

    const res = await fetch(`https://usdb.animux.de/?link=editsongs&id=${usdb_id}`);
    const htmlString = await res.text();
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
 * @param {*} commonConfig
 * @param {*} usdb_id 
 */
function highlight_row(row, commonConfig, usdb_id) {
  if (!isHeaderRow(row)) {
    for (let conf of commonConfig.categories) {
      if (conf.ids.includes(usdb_id)) {
        row.style["background-color"] = `${conf.color}`;
        break
      }
    }
  }
}

(async () => {
  // required work-around instead of top-level async/await until type="module" is supported in manifest.json

  // on every page load
  // ... first get config
  const usdb_config = await get_config_or_set_default();
  const pageConfig = usdb_config.page.search_results;
  const commonConfig = usdb_config.common;

  // ... then execute
  const result_table = document.getElementById("tablebg").getElementsByTagName("table")[0];
  const result_rows = result_table.getElementsByTagName("tr");
          
  for ( let i=0; i<result_rows.length; i++ ) {
    const usdb_id = get_row_usdb_id(result_rows[i]);
    setRowId(result_rows[i], usdb_id);
    if (pageConfig.prepend_id_column) {
      prependIdColumn(result_rows[i], usdb_id);
    }
    await addColumnsFromEditPage(result_rows[i], usdb_id);
    if (pageConfig.remove_on_click) {
      removeOnClick(result_rows[i]);
    }
    highlight_row(result_rows[i], commonConfig, usdb_id);
  }
})();
