import os

from auto_build import applyBuildParameters, app_name, version_code, version

applyBuildParameters()

os.system("echo \************************************************")
os.system("echo Building Android '" + app_name + "' with version=" + version + " version_code=" + version_code)
os.system("echo \************************************************")

os.system("ionic cordova build android --release -- --prod")
os.system("cp ./build_resources/keystore ./platforms/android/app/build/outputs/apk/release/keystore")
os.system("cp ./build_resources/zipalign ./platforms/android/app/build/outputs/apk/release/zipalign")
os.chdir("./platforms/android/app/build/outputs/apk/release/")
print(os.path.dirname(os.path.realpath(__file__)))
os.system("jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore keystore --storepass sU7x8Qd2 app-release-unsigned.apk release")
os.system("./zipalign -v 4 app-release-unsigned.apk '"+app_name+ " " + version+".apk'")


