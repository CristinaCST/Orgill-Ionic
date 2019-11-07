# Installation
```sh
npm install
cordova prepare android
cordova prepare ios
cordova platform add android
cordova platform add ios
```
# Run

## On device 

* For Android:
```sh
ionic cordova run android --device 
```

* For iOS:
```sh
ionic cordova run ios --device 
```

## On emulator

* For Android:
```sh
ionic cordova run android 
```

* For iOS:
```sh
ionic cordova run ios 
```

## Livereload

* For Android: 
```sh
ionic cordova run android --device --livereload 
```

* For iOS: 
```sh
ionic cordova run ios --device --livereload 
```

# Build

## Development

* For Android:
```sh
ionic cordova build android
```

* For iOS:
```sh
ionic cordova build ios
```

## Production 

* For Android:
```sh
ionic cordova build android --release -- --prod
```

* For iOS:
```sh
ionic cordova build ios --release -- --prod
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
