import os

from auto_build import applyBuildParameters, app_name, version_code, version, build_type

applyBuildParameters()

os.system("echo \************************************************")
os.system("echo Building iOS '" + app_name + "' with version=" + version + " version_code=" + version_code)
os.system("echo \************************************************")

os.system("cordova platform rm ios")
os.system("ionic cordova run ios --release -- --prod")
os.chdir("./platforms/ios")
os.system("sudo gem install cocoapods")
if build_type == "test":
    os.system("cp ../../build_resources/Podfile-test ./Podfile")
else:
    os.system("cp ../../build_resources/Podfile-regular ./Podfile")
os.system("pod repo update")
os.system("pod install")
