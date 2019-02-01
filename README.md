#Instaltion
npm install
cordova prepare android/ios
cordova platform add android/ios

#Run
ionic cordova run android/ios --device (for running on device)
ionic cordova run android/ios (for runnin on emulator)
ionic cordova run android/ios --device --livereload (for enabling livereload)

#Build
ionic cordova build android/ios --prod --release (build apk or ipa file for release)
ionic cordova build android/ios --dev

#Clean
cordova clean
