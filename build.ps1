npm run build

if ($?) {
  if (Test-Path -Path ./build) {
    Remove-Item -Path ./build -Recurse
  }

  New-Item -ItemType Directory -Force -Path ./build/firefox
  New-Item -ItemType Directory -Force -Path ./build/chrome

  ("./scripts", "./options", "./icons") | ForEach-Object {
    Copy-Item -Force -Recurse $_ ./build/firefox
    Copy-Item -Force -Recurse $_ ./build/chrome
  }

  Copy-Item -Force -Recurse "./lib" ./build/chrome  

  Copy-Item -Force -Recurse ./manifest.firefox.json ./build/firefox/manifest.json
  Copy-Item -Force -Recurse ./manifest.chrome.json ./build/chrome/manifest.json
}