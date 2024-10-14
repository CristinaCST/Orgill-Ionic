/**
 * This hook helps with location feature on older android devices.
 */

const fs = require('fs');
const path = require('path');
const hookTag = '[REQUIRED-GPS]';

module.exports = function (ctx) {
  let android = false;
  ctx.opts.platforms.forEach(platform => {
    if (platform.indexOf('android') > -1) {
      android = true;
    }
  });

  if (!android) return;

  // if (ctx.opts.cordova.plugins.indexOf('cordova-plugin-geolocation') === -1) {
  //     console.error('\x1b[31m%s\x1b[0m', hookTag + ' HOOK ERROR: Location hook was called but geolocation plugin is missing, if you use another plugin or think this is an error please check the hook.');
  //     return;
  // }

  const androidJsonPath = path.join(ctx.opts.projectRoot, 'platforms/android/android.json');
  const androidManifestPath = path.join(ctx.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');

  if (!fs.existsSync(androidJsonPath) || !fs.existsSync(androidManifestPath)) {
    // If the file doesn't exist we print such error and abort
    console.error('\x1b[31m%s\x1b[0m', hookTag + " HOOK ERROR: at least one of the targeted files doesn't exist");
    return;
  }

  try {
    const androidJsonFileContents = fs.readFileSync(androidJsonPath).toString();
    const androidManifestFileContents = fs.readFileSync(androidManifestPath).toString();
    fs.writeFileSync(
      androidJsonPath,
      androidJsonFileContents.replace(
        'android:name=\\"android.hardware.location.gps\\" />',
        'android:name=\\"android.hardware.location.gps\\" required=\\"true\\" />'
      )
    );
    fs.writeFileSync(
      androidManifestPath,
      androidManifestFileContents.replace('<uses-feature android:name="android.hardware.location.gps" />', '')
    );
  } catch (e) {
    console.error('\x1b[31m%s\x1b[0m', hookTag + ' HOOK ERROR: ' + e); // If we get any error print it and abort
    return;
  }

  console.log('\x1b[32m%s\x1b[0m', hookTag + ' INFO: Added required to feature.'); // If we got here everything was good
};
