# Installation
```sh
npm install
cordova prepare android
cordova prepare ios
cordova platform add android
cordova platform add ios
```
# Run
On device 
```sh
ionic cordova run android/ios --device 
```
On emulator
```sh
ionic cordova run android/ios 
```
Livereload
```sh
ionic cordova run android/ios --device --livereload 
```

# Build

Development
```sh
ionic cordova build android/ios --dev
```
Production 

```sh
ionic cordova build android/ios --prod --release 
```



# Clean
```sh
npm rm -rf node_modules/
npm rm -rf plugins/
cordova platform rm android
cordova platform add android
cordova prepare
cordova clean
```



