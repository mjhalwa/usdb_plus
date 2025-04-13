# USDB Plus

![Firefox Extension Badge](https://img.shields.io/badge/Mozilla_Firefox-Mozilla_Firefox_Webbrowser?logo=firefoxbrowser&color=%2300539F)

<a href="https://addons.mozilla.org/addon/usdb-plus/"><img src="https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png" alt="Get USDB Plus for Firefox"></a>

Web browser extension to provided extras to [USDB](https://usdb.animux.de)

with

![screenshot of a search result page with this Add-on enabled](./screenshots/search-result-on.png)

without

![screenshot of a search result page without this Add-on enabled](./screenshots/search-result-off.png)

## Features

- highlight specific USDB IDs in search results and detail pages
- dynamic number of USDB ID lists with individual color settings and label
- Sync lists via [Firefox Sync](https://www.mozilla.org/de/firefox/sync/) to use the same configuration on all of your devices.

## Development

using `nodejs == v18.20.7`

``` powershell
npm install --dev
```

Debug in the browser:

1. Open Firefox
2. Goto `about:debugging`
3. Click __This Firefox__ in left sidenav
4. Click __Load Temporary Add-on__ on the top right
5. Select `manifest.json`
6. Goto [usdb.animux.de](usdb.animux.de) and try out

Apply changes:

1. change js code in `src` directory
2. build `.bundle.js` files by replacing imports with function bodies

    ``` powershell
    npm run build
    ```

3. click __Reload__ button in `about:debugging`

## Links

- [MDN - Browser Extension Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Firefox Source Docs - about:debugging](https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html)
- [MDN - storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)
- [MDN - manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
  
  > It is a JSON-formatted file, with one exception: __it is allowed to contain "//"-style comments.__

- [MDN - icons](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)

  > You can use SVG and the browser will scale your icon appropriately. There are currently two caveats though:
  > 1. You need to specify a viewBox in the image. E.g.: `viewBox="0 0 48 48"` [for size `"48"`]
  > 2. Even though you can use one file, you still need to specify various size of the icon in your manifest.

- [MDN - Debugging - Developer tools toolbox](https://extensionworkshop.com/documentation/develop/debugging/#developer-tools-toolbox)
- [MDN - Options page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Options_pages)

  Note: `console.log()` output on Add-on Preferences pages are __NOT visible__ in the usual debugging console. They __ONLY appear__ in the __developer toolbox console__

- [MDN - Submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)

- [Extension Workshop - Developing extensions for Firefox for Android](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/)

Examples

- [MDN - Your first Extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
- [MDN - Your second Extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_second_WebExtension)
- [MDN - Implement a settings page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Implement_a_settings_page)