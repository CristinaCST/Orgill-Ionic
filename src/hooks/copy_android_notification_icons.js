#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filestocopy = [{
  "resources/android/icon/drawable-hdpi-icon.png":
    "platforms/android/app/src/main/res/drawable-hdpi/ic_stat_onesignal_default.png"
}, {
  "resources/android/icon/drawable-mdpi-icon.png":
    "platforms/android/app/src/main/res/drawable-mdpi/ic_stat_onesignal_default.png"
}, {
  "resources/android/icon/drawable-xhdpi-icon.png":
    "platforms/android/app/src/main/res/drawable-xhdpi/ic_stat_onesignal_default.png"
}, {
  "resources/android/icon/drawable-xxhdpi-icon.png":
    "platforms/android/app/src/main/res/drawable-xxhdpi/ic_stat_onesignal_default.png"
}, {
  "resources/android/icon/drawable-xxxhdpi-icon.png":
    "platforms/android/app/src/main/res/drawable-xxxhdpi/ic_stat_onesignal_default.png"
}];

module.exports = function (context) {
  const rootdir = context.opts.projectRoot;

  filestocopy.forEach(function (obj) {
    Object.keys(obj).forEach(function (key) {
      const val = obj[key];
      const srcfile = path.join(rootdir, key);
      const destfile = path.join(rootdir, val);

      const destdir = path.dirname(destfile);
      if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
        fs.createReadStream(srcfile).pipe(
          fs.createWriteStream(destfile));
      }
    });
  });

};
