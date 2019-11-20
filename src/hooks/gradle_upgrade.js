/**
 * This hook helps with automatically getting the project ready for build with the upgraded gradle version.
 */

const fs = require('fs');
const path = require('path');
const hookTag = '[GRADLE-UPGRADE]';

module.exports = function (ctx) {
    let android = false;
    ctx.opts.platforms.forEach(platform => {
        if (platform.indexOf('android') > -1) {
            android = true;
        }
    });

    if (!android) {
        return;
    }

    const gradleVersionPath = path.join(ctx.opts.projectRoot, 'platforms/android/build.gradle');
    const gradleWrapperPath = path.join(ctx.opts.projectRoot, 'platforms/android/cordova/lib/builders/ProjectBuilder.js');
    // const androidManifestPath = path.join(ctx.opts.projectRoot,'platforms/android/app/src/main/AndroidManifest.xml');
    // const buildGradlePath = path.join(ctx.opts.projectRoot,'platforms/android/app/build.gradle');

    if (!fs.existsSync(gradleVersionPath) || !fs.existsSync(gradleWrapperPath)) {  // If the file doesn't exist we print such error and abort
        console.error('\x1b[31m%s\x1b[0m', hookTag + ' HOOK ERROR: at least one of the files targeted were not found, please check the hook, it may be deprecated.');
        return;
    }

    try {
        const gradleVersionFileContents = fs.readFileSync(gradleVersionPath).toString();
        const gradleWrapperFileContents = fs.readFileSync(gradleWrapperPath).toString();
        // const androidManifestFileContents = fs.readFileSync(androidManifestPath).toString();
        // const buildGradleFileContents = fs.readFileSync(buildGradlePath).toString();

        // const sdkRegex = new RegExp('<uses-sdk.*?android:minSdkVersion=".*', 'g');
        // const regexLine = sdkRegex.exec(androidManifestFileContents)[0];
        // const minSdk = regexLine.split('=')[1].substr(0,4).replace(/"/g,'');

        fs.writeFileSync(gradleVersionPath, gradleVersionFileContents.replace('com.android.tools.build:gradle:3.3.0', 'com.android.tools.build:gradle:3.4.0'));
        fs.writeFileSync(gradleWrapperPath, gradleWrapperFileContents.replace('/distributions/gradle-4.10.3-all.zip', '/distributions/gradle-5.1.1-all.zip'));
        // fs.writeFileSync(androidManifestPath, androidManifestFileContents.replace(regexLine,''));
        // fs.writeFileSync(buildGradlePath, buildGradleFileContents.replace('defaultConfig {','defaultConfig {\n        minSdkVersion ' + minSdk));

    } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', hookTag + ' HOOK ERROR: ' + e);  // If we get any error print it and abort
        return;
    }

    console.log('\x1b[32m%s\x1b[0m', hookTag + ' INFO: Upgraded gradle in android studio project.');  // If we got here everything was good
}