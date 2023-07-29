# USDB Plus

![Firefox Extension Badge](https://img.shields.io/badge/Mozilla_Firefox-Mozilla_Firefox_Webbrowser?logo=firefoxbrowser&color=%2300539F)

Web browser extension to provided extras to [USDB](https://usdb.animux.de)

## Features

- highlight specific USDB IDs in search results and detail pages
- dynamic number of USDB ID lists with individual color settings and label
- Sync lists via [Firefox Sync](https://www.mozilla.org/de/firefox/sync/) to use the same configuration on all of your devices.

## Development

1. Open Firefox
2. Goto `about:debugging`
3. Click __This Firefox__ in left sidenav
4. Click __Load Temporary Add-on__ on the top right
5. Select `manifest.json`
6. Goto [usdb.animux.de](usdb.animux.de) and try out
7. Change source and click __Reload__ button if you changed source to view results

## Links

- [MDN - Browser Extension Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Firefox Source Docs - about:debugging](https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html)
- [MDN - storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)
- [MDN - manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
  
  > It is a JSON-formatted file, with one exception: __it is allowed to contain "//"-style comments.__

- [MDN - Debugging - Developer tools toolbox](https://extensionworkshop.com/documentation/develop/debugging/#developer-tools-toolbox)
- [MDN - Options page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Options_pages)

  Note: `console.log()` output on Add-on Preferences pages are __NOT visible__ in the usual debugging console. They __ONLY appear__ in the __developer toolbox console__

Examples

- [MDN - Your first Extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [MDN - Your second Extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_second_WebExtension)
- [MDN - Implement a settings page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Implement_a_settings_page)