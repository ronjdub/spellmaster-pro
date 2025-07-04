// src/screens/CameraScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { OCRStackParamList } from '../../App';

type CameraScreenNavigationProp = NativeStackNavigationProp<OCRStackParamList, 'Camera'>;

const { width, height } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const cameraRef = useRef<Camera>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      // Navigate to OCR processing screen with the captured image
      navigation.navigate('OCRProcessing', { imageUri: photo.uri });
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCameraType = () => {
    setType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.permissionText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={80} color="#6b7280" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            SpellMaster PRO needs camera access to capture images of text for word extraction.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={getCameraPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flashMode}
      >
        <View style={styles.overlay}>
          {/* Top instruction bar */}
          <View style={styles.topBar}>
            <View style={styles.instructionContainer}>
              <Ionicons name="information-circle" size={20} color="#fff" />
              <Text style={styles.instructionText}>
                Position text clearly in the frame
              </Text>
            </View>
          </View>

          {/* Camera frame guide */}
          <View style={styles.frameGuide}>
            <View style={[styles.frameCorner, styles.topLeft]} />
            <View style={[styles.frameCorner, styles.topRight]} />
            <View style={[styles.frameCorner, styles.bottomLeft]} />
            <View style={[styles.frameCorner, styles.bottomRight]} />
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flashMode === FlashMode.on ? "flash" : "flash-off"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>

      {/* Tips overlay */}
      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.tipText}>Ensure good lighting</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.tipText}>Keep text straight and clear</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.tipText}>Fill the frame with text</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  frameGuide: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    bottom: '30%',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#059669',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  tipsContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;