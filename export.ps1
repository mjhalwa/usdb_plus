New-Item -ItemType Directory -Force -Path ./export

$version = Get-Content package.json `
| ConvertFrom-Json `
| ForEach-Object {$_.version}

pwsh build.ps1

("firefox", "chrome") | ForEach-Object {
  Compress-Archive -Path "build/$_/*" -DestinationPath "./export/usdb_plus-$_-$version.zip"
}