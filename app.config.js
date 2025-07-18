// app.config.js
export default {
    expo: {
      name: "SpellMaster PRO",
      icon: "./icon.png",
      slug: "spellmaster-pro",
      version: "1.0.0",
      orientation: "portrait",
      userInterfaceStyle: "light",
      splash: {
        image: "./icon.png",
        resizeMode: "contain",
        backgroundColor: "#10b981"
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.ronjwilliams.spellmasterpro",
        buildNumber: "1",
        infoPlist: {
          NSMicrophoneUsageDescription: "This app uses the microphone for spelling practice and speech recognition.",
          NSSpeechRecognitionUsageDescription: "This app uses speech recognition to help children practice spelling words.",
          NSCameraUsageDescription: "SpellMaster PRO needs camera access to capture images of text for word extraction.",
          NSPhotoLibraryUsageDescription: "SpellMaster PRO needs photo library access to save captured images.",
          ITSAppUsesNonExemptEncryption: false
        }
      },
      android: {
        package: "com.ronjwilliams.spellmasterpro",
        versionCode: 1,
        permissions: [
          "android.permission.RECORD_AUDIO",
          "android.permission.CAMERA",
          "android.permission.READ_EXTERNAL_STORAGE",
          "android.permission.WRITE_EXTERNAL_STORAGE"
        ]
      },
      extra: {
        eas: {
          "projectId": "774565e5-7a0c-4f4d-bf6d-0a555f714697"
        }
      },
      plugins: [
        // Explicitly exclude the broken voice plugin
        // We handle permissions manually above
      ]
    }
  };