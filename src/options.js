import { get_config_or_set_default, set_config } from "./util.js"

function showSuccess() {
  // show success and hide it after 3 sec
  const successMessage = document.querySelector("#success-msg")
  successMessage.style.display = "block";
  setTimeout(function () {
      successMessage.style.opacity = 1;
  }, 10); // Delay the fade-in just a bit for the transition to work

  // Set a timeout to hide the success message after 3 seconds with a fade-out
  setTimeout(function () {
      successMessage.style.opacity = 0;
      setTimeout(function () {
          successMessage.style.display = "none";
      }, 500); // Make sure to hide the element after the fade-out transition
  }, 3000);
}


async function showError(message) {
  // show success and hide it after 3 sec
  const errorMessage = document.querySelector("#error-msg")
  errorMessage.style.display = "block";
  errorMessage.innerHTML = `<b>Error:</b> ${message}`
  setTimeout(function () {
    errorMessage.style.opacity = 1;
  }, 10); // Delay the fade-in just a bit for the transition to work

  // Set a timeout to hide the success message after 3 seconds with a fade-out
  setTimeout(function () {
    errorMessage.style.opacity = 0;
      setTimeout(function () {
        errorMessage.style.display = "none";
      }, 500); // Make sure to hide the element after the fade-out transition
  }, 10000);
}

async function saveOptions(event) {
  event.preventDefault();
  // console.log("save pressed")

  const new_usdb_config = {
    "page": {
      "search_results": {
        "prepend_id_column": document.querySelector("#cb-search_results-prepend-id-column").checked,
        "remove_on_click": document.querySelector("#cb-search_results-remove-onclick").checked,
      }
    },
    "common": {
      "categories_url": document.querySelector("#le-categories-url").value,
      /* https://stackoverflow.com/a/53350150
        * > If you're using ES6, you can use [...selectors] syntax, like this:
        */
      "categories": [
          ...document.querySelector("#categories-section").querySelectorAll("section")
        ].map( (obj, index) => {
          const label = document.querySelector(`#label-${index}`).textContent
          const color = document.querySelector(`#color-${index}`).value
          const ids = document.querySelector(`#ids-${index}`).value
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
    },
  }
  // console.log(new_usdb_config)

  try {
    const last_usdb_config = await get_config_or_set_default()
    await set_config({...last_usdb_config, ...new_usdb_config}) // last_config in order to keep all unmentioned configs (e.g. legacy)
  } catch (error) {
    if (error.message.startsWith("QuotaExceededError")) {
      showError("saving changes failed, not enough space available")
      console.error(error)
    } else {
      showError(`saving changes failed due to ${error.message}`)
      console.error(error)
    }
    return
  }

  await restoreOptions()
  showSuccess()
}

function getCategorySectionTemplate() {
  const template = document.querySelector("#category-section-template");
  const section = template.content.querySelector("section");
  const clonedSection = section.cloneNode(true);
  return clonedSection;
}

function createCategorySection(data, index) {
  const new_section = getCategorySectionTemplate()
  const header = new_section.querySelector("h2")
  header.setAttribute("id", `label-${index}`)
  header.textContent = data["label"]
  const color_input = new_section.querySelector("input")
  color_input.setAttribute("id", `color-${index}`)
  color_input.setAttribute("name", `color-${index}`)
  color_input.value = data["color"]
  color_input.style["background-color"] = data["color"]
  const ids_textarea = new_section.querySelector("textarea")
  ids_textarea.setAttribute("id", `ids-${index}`)
  ids_textarea.setAttribute("name", `ids-${index}`)
  ids_textarea.value = data["ids"]
    .sort((a,b) => { if (a<b) {return -1}; return 1})
    .join(",")
  return new_section
}

function writeCategories(categories) {
  const section = document.querySelector("#categories-section")
  // remove existing categories from settings page
  section.innerHTML = "<h1>USDB ID Categories</h1>"
  // create and append categorie sections
  for (let index in categories) {
    new_section = createCategorySection(categories[index], index)
    section.appendChild(new_section)
  }
}

async function restoreOptions() {
  // console.log("restoreOptions")

  let usdb_config
  try {
    usdb_config = await get_config_or_set_default()
  } catch (error) {
    showError(error);
    return
  }

  document.querySelector("#cb-search_results-prepend-id-column").checked = usdb_config.page.search_results.prepend_id_column
  document.querySelector("#cb-search_results-remove-onclick").checked = usdb_config.page.search_results.remove_on_click
  document.querySelector("#le-categories-url").value = usdb_config.common.categories_url
  writeCategories(usdb_config.common.categories)
}

async function reloadCategoriesFromUrl() {
  // console.log("reloadCategoriesFromUrl")
  const url = document.querySelector("#le-categories-url").value
  if (url.length) {
    const res = await fetch(url)
    const content = await res.text()
    try {
      const json_content = JSON.parse(content)
      // console.log(json_content)
      if (!Array.isArray(json_content)) {
        showError("expected array in JSON")
        return
      }
      if (json_content.length === 0) {
        showError("expected array length >= 0")
        return
      }
      for (let index in json_content) {
        for ( property of ["label", "color", "ids"]) {
          if (!json_content[index].hasOwnProperty(property)) {
            showError(`missing property '${property}' in Element ${index}`)
            return
          }
        }
        if (!(typeof json_content[index]["label"] === "string") ) {
          showError("invalid format of property 'label', has to be a string")
          return
        }
        if (!json_content[index]["label"].match(/^[\w _-]+$/)) {
          showError("invalid format of property 'label', allows are only (non-empty) word characters, space, underscore and dash")
          return
        }
        if (!(typeof json_content[index]["color"] === "string") ) {
          showError("invalid format of property 'color', has to be a string")
          return
        }
        if (!json_content[index]["color"].match(/^#[a-fA-F0-9]{6}$/)) {
          showError("invalid format of property 'color', must be '#' followed by 3 hex values")
          return
        }
        if (!Array.isArray(json_content[index]["ids"])) {
          showError("invalid format of property 'ids', has to be an array")
          return
        }
        if (!json_content[index]["ids"].every(x => x>0)) {
          showError("invalid format of property 'ids', every array element has to be a positive integer")
          return
        }
      }
      writeCategories(json_content)
    } catch (error) {
      showError("invalid JSON!")
      console.error(error)
      return
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await restoreOptions();
});
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#url-reload-btn").addEventListener("click", reloadCategoriesFromUrl);
