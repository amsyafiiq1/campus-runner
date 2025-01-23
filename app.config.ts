import { ExpoConfig, ConfigContext } from "@expo/config";
import * as dotenv from "dotenv";

// initialize dotenv
dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "campus-runner",
  slug: "campus-runner",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.amsyafiiq.campusrunner",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#73737d",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    package: "com.amsyafiiq.campusrunner",
  },
});
