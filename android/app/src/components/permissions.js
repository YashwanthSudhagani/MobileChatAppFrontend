import { PermissionsAndroid, Platform } from "react-native";

export const requestAudioPermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Audio Recording Permission",
          message: "App needs access to your microphone to record audio.",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Audio permission error:", err);
      return false;
    }
  }
  return true; // iOS handles permissions automatically
};
