# React Native Sidemenu Scaffold

## Instructions

- Run `yarn install`
- Run `react-native link`
- Run this command in the android/app/ directory to generate the debug keystore file `keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000`
- Paste secrets.xml file inside android/app/src/main/res/values - this contains secrete variable such as Google Map API key etc.,

## Commands

- `react-native run-android` Run application in Android mobile
- `react-native run-ios` Run application in IOS mobile
- `yarn start` Starts the react-native  bundle (react-native start)