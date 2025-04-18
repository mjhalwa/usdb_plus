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

// export async function isFirefox() {
//   return typeof InstallTrigger !== "undefined";
// }

// export async function isFirefox() {
//   if (browser.runtime.getBrowserInfo) {
//     const info = await browser.runtime.getBrowserInfo();
//     console.log(info.name.toLowerCase())
//     return info.name.toLowerCase() === "firefox";
//   } else {
//     return false; // Chrome doesn’t support getBrowserInfo
//   }
// }

export function isFirefox() {
  const ua = navigator.userAgent;
  return ua.includes("Firefox")
}

const CONFIG_KEY = "usdb_plus"

export async function set_config(new_usdb_config) {
  await browser.storage.local.set({[CONFIG_KEY]: new_usdb_config})
}

/**
 * check for configs still in sync storage as in versions <=1.2.0 and
 * import them to local storage, deletes sync storage config
 * @param {*} usdb_config currently valid configuration
 * @returns {Promise} reolving valid config of open imports from sync storage,
 *          else input `usdb_config` with checked `legacy.syncStorageImportDone`
 */
async function try_import_from_sync_storage(usdb_config) {
  const new_usdb_config = {...usdb_config}  // be sure to deep copy
  if (isFirefox()) {
    const OLD_CONFIG_KEY = "config"
    const sync_storage = await browser.storage.sync.get()
    // console.log("sync_storage")
    // console.log(sync_storage)

    if (OLD_CONFIG_KEY in sync_storage) {
      // retrieve settings from sync storage
      let old_usdb_config = sync_storage[OLD_CONFIG_KEY]

      // transition from v0.1.0 to v1.0.0
      if(Array.isArray(old_usdb_config)) {
        const newLocal = old_usdb_config = {
          "general": {
            // adding default values here
            "prepend_id_column": true,
            "remove_on_click": true,
            "categories_url": ""
          },
          "categories": old_usdb_config
        }
      }

      // merge into new config
      new_usdb_config.page.search_results.prepend_id_column=old_usdb_config.general.prepend_id_column
      new_usdb_config.page.search_results.remove_on_click=old_usdb_config.general.remove_on_click
      new_usdb_config.common.categories_url = old_usdb_config.general.categories_url
      new_usdb_config.common.categories = [...old_usdb_config.categories]

      // first set new config
      try {
        await set_config(new_usdb_config)
      } catch (error) {
        console.error(`Error updating config from legacy sync storage: ${error}`)
        throw error
      }

      console.log("successfully updated config from legacy sync storage")

      // ... then delete sync_storage
      try {
        await browser.storage.sync.remove(OLD_CONFIG_KEY)
      } catch (error) {
        console.error(`Error deleting legacy sync storage: ${error}`)
        throw error
      }

      console.log("successfully deleted config from sync storage")

      new_usdb_config.legacy.syncStorageImportDone = true
    }
  }

  // in any case mark importing from sync storage as done
  // (also for newer uses that have never uses sync storage versions of this addon)
  new_usdb_config.legacy.syncStorageImportDone = true
  await set_config(new_usdb_config)

  return new_usdb_config
}

export async function get_config_or_set_default() {
  // if (isFirefox()) {
  //   console.log("is Mozilla Firefox")
  // } else {
  //   console.log("should be Google Chrome")
  // }

  const local_storage = await browser.storage.local.get();
  // console.log(local_storage)

  // default settings
  let usdb_config;
  if (CONFIG_KEY in local_storage) {
    usdb_config = {...local_storage[CONFIG_KEY]}  // be sure to deep copy
  } else {
    usdb_config = {...get_config_default()}  // be sure to deep copy
    await set_config(usdb_config)
  }

  if (!usdb_config.legacy.syncStorageImportDone) {
    try {
      usdb_config = await try_import_from_sync_storage(usdb_config)
    } catch (error) {
      console.error("Sync storage import failed:", error);
    }
  }

  // No need to call set_config again - all changes where already set with await
  return usdb_config
}

export async function get_song_details(usdb_id) {
  const res = await fetch(`https://usdb.animux.de/?link=editsongs&id=${usdb_id}`)
  const htmlString = await res.text()
  // create a temporary container
  const temp_element = document.createElement("div")
  // // Parse the HTML string and append it to the container using DOMParser
  // // should be save then using .innerHTML directly
  // const parser = new DOMParser();
  // const parsedDocument = parser.parseFromString(htmlString, 'text/html');
  // temp_element.appendChild(parsedDocument.body);
  temp_element.innerHTML = htmlString;

  const coverInput = temp_element.querySelector('#editCoverSampleTable input[name="coverinput"]')
  const coverHref = coverInput.value
  const sampleInput = temp_element.querySelector('#editCoverSampleTable input[name="sampleinput"]')
  const sampleHref = sampleInput.value
  const txtTextarea = temp_element.querySelector('table textarea[name="txt"]')
  const txt = txtTextarea.textContent
  const metatags_str = txt.split("\n").filter(line => line.startsWith("#VIDEO"))[0]

  return {
    "coverHref": coverHref,
    "sampleHref": sampleHref,
    "metatags_str": metatags_str,
  }
}

/* created by ChatGPT */
export function createSpinner() {
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

export function get_sample_column(row) {
  let sample_elem = null
  if (isHeaderRow(row)) {
    sample_elem = document.createElement("td");  //!< Note: usdb uses <td> for heads
    sample_elem.textContent = "▶︎/❚❚"
  } else {
    sample_elem = document.createElement("td");
    sample_elem.classList.add("sample")
    sample_elem.appendChild(createSpinner())
  }
  return sample_elem
}

export function get_cover_column(row) {
  let cover_elem = null
  if (isHeaderRow(row)) {
    cover_elem = document.createElement("td");  //!< Note: usdb uses <td> for heads
    cover_elem.textContent = "Cover"
  } else {
    cover_elem = document.createElement("td");
    cover_elem.classList.add("usdb_cover")
    cover_elem.appendChild(createSpinner())
  }
  return cover_elem
}

export function updateButtonText(audio, isPlaying) {
  const playButton = document.querySelector(`#play_${audio.id}`);
  playButton.textContent = isPlaying ? '❚❚' : '▶︎';
}

export var currentlyPlaying = null;

export function togglePlayPause(audioId) {
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

export function apply_sample_to_row(usdb_id, sampleHref) {
  const sample_col = document.querySelector(`#row_${usdb_id} .sample`)
  if (sampleHref) {
    const source = document.createElement("source")
    source.src = sampleHref
    source.type="audio/mpeg"
    const audio = document.createElement("audio")
    audio.setAttribute("id", `audio_${usdb_id}`)
    audio.appendChild(source)
    const playButton = document.createElement("button")
    playButton.onclick = () => togglePlayPause(`audio_${usdb_id}`)
    playButton.textContent = "▶︎"
    playButton.setAttribute("id", `play_audio_${usdb_id}`)
    sample_col.replaceChild(audio, sample_col.firstElementChild)
    sample_col.appendChild(playButton)
  } else {
    sample_col.removeChild(sample_col.firstElementChild)
  }
}

export function apply_cover_to_row(usdb_id, coverHref) {
  const usdb_cover_col = document.querySelector(`#row_${usdb_id} .usdb_cover`)
  usdb_cover_col.style.height = "4em"
  usdb_cover_col.style.width = usdb_cover_col.style.height
  if (coverHref) {
    const img = document.createElement("img")
    img.src = coverHref
    img.style.height = "100%"
    img.style.aspectRatio = "1 / 1"
    usdb_cover_col.replaceChild(img, usdb_cover_col.firstElementChild)
  } else {
    usdb_cover_col.removeChild(usdb_cover_col.firstElementChild)
  }
}