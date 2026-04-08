const appJson = require("./app.json");

const fallbackAdMobAppIds = {
  ios: "ca-app-pub-3940256099942544~1458002511",
  android: "ca-app-pub-3940256099942544~3347511713",
};

function readEnv(name, fallback) {
  const value = process.env[name]?.trim();
  return value || fallback;
}

module.exports = () => ({
  ...appJson.expo,
  plugins: [
    ...(appJson.expo.plugins ?? []).filter(
      (plugin) =>
        !(
          plugin === "react-native-google-mobile-ads" ||
          (Array.isArray(plugin) &&
            plugin[0] === "react-native-google-mobile-ads")
        ),
    ),
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: readEnv(
          "EXPO_PUBLIC_ADMOB_APP_ID_ANDROID",
          fallbackAdMobAppIds.android,
        ),
        iosAppId: readEnv(
          "EXPO_PUBLIC_ADMOB_APP_ID_IOS",
          fallbackAdMobAppIds.ios,
        ),
        userTrackingUsageDescription:
          "This identifier will be used to deliver more relevant ads to you.",
      },
    ],
  ],
});
