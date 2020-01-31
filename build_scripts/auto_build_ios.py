import os
import subprocess
import xml.etree.ElementTree as ET
import re

# config.xml Namespaces
ET.register_namespace('', "http://www.w3.org/ns/widgets")
ET.register_namespace('android', "http://schemas.android.com/apk/res/android")
ET.register_namespace('cdv', "http://cordova.apache.org/ns/1.0")

#########################################################
# This area MUST be edited, to set the version of the app
version = '6.7.11'
version_code = '86'
build_type = "test" #"regular"
#########################################################
app_name = "Orgill Test" if build_type == "test" else "Orgill"
oneSignalAppID = "be33b136-2960-435a-b22f-b12ade07e393" if build_type == "test" else "a11b3e10-bce2-41e9-a6d0-746042798d7e"
oneSignalFirebaseName = "orgill-test" if build_type == "test" else "orgill-5a5ba"

def injectVersionInCode():
    file = open('./src/util/version.ts', 'r+')
    lines = file.read().splitlines()
    lines[0] = "export const VERSION: string = '" + version +"';"
    lines[1] = "export const API_KEY: string = '"+oneSignalAppID+"';"
    lines[2] = "export const PROJECT_TITLE: string = '"+oneSignalFirebaseName+"';"
    file.truncate(0)
    file.seek(0)
    file.write('\n'.join(lines))

def applyBuildParameters():
    tree = ET.parse('config.xml')
    root = tree.getroot()
    root.attrib['android-versionCode'] = version_code
    root.attrib['id'] = ( 'com.orgill.test' if build_type == "test" else 'com.orgill.ionic')
    root.attrib['version'] = version
    print(root.attrib['android-versionCode'])
    tree.write('config.xml')

os.system("echo \************************************************")
os.system("echo Building iOS '" + app_name + "' with version=" + version + " version_code=" + version_code)
os.system("echo \************************************************")

injectVersionInCode()
applyBuildParameters()

os.system("cordova platform rm ios")
os.system("ionic cordova run ios --release -- --prod")
os.chdir("./platforms/ios")
os.system("sudo gem install cocoapods")
os.system("cp ../../build_resources/Podfile-test ./Podfile")
os.system("pod repo update")
os.system("pod install")
