// src/screens/CameraScreen.tsx - ENHANCED VERSION (EAS Compatible)
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
  Image,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { Camera, CameraType, FlashMode, AutoFocus } from 'expo-camera';
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
  const [zoom, setZoom] = useState(0);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Simple animated value for focus ring
  const focusRingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCameraPermissions();
  }, []);

  useEffect(() => {
    // Auto-hide focus ring after 2 seconds
    if (focusPoint) {
      const timer = setTimeout(() => {
        setFocusPoint(null);
        Animated.timing(focusRingOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusPoint]);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleCameraTouch = (event: any) => {
    // Note: This is just visual feedback - expo-camera doesn't support tap-to-focus
    const { locationX, locationY } = event.nativeEvent;
    
    // Set focus point for visual feedback only
    setFocusPoint({ x: locationX, y: locationY });
    
    // Animate focus ring
    Animated.sequence([
      Animated.timing(focusRingOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(focusRingOpacity, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Just visual feedback - not actual focus control
    setTimeout(() => {
      setIsFocused(true);
      setTimeout(() => setIsFocused(false), 1000);
    }, 500);
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        skipProcessing: false,
      });

      setCapturedImage(photo.uri);
      setShowPreview(true);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      setShowPreview(false);
      navigation.navigate('OCRProcessing', { imageUri: capturedImage });
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setShowPreview(false);
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

  const zoomIn = () => {
    const newZoom = Math.min(zoom + 0.02, 1); // Much smaller increment
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 0.02, 0); // Much smaller increment
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(0);
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
        autoFocus={AutoFocus.on}
        zoom={zoom}
      >
        <TouchableOpacity 
          style={styles.touchableOverlay}
          activeOpacity={1}
          onPress={handleCameraTouch}
        >
          <View style={styles.overlay}>
            {/* Top instruction bar with help button */}
            <View style={styles.topBar}>
              <View style={styles.topBarContent}>
                <View style={[
                  styles.instructionContainer,
                  isFocused && styles.instructionFocused
                ]}>
                  <Ionicons 
                    name={isFocused ? "checkmark-circle" : "camera-outline"} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.instructionText}>
                    {isFocused ? "Camera is auto-focusing" : "Position text in frame • Use zoom controls"}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.helpButton}
                  onPress={() => setShowHelp(true)}
                >
                  <Ionicons name="help-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Enhanced frame guide for text */}
            <View style={styles.textFrameGuide}>
              <View style={[styles.frameCorner, styles.topLeft]} />
              <View style={[styles.frameCorner, styles.topRight]} />
              <View style={[styles.frameCorner, styles.bottomLeft]} />
              <View style={[styles.frameCorner, styles.bottomRight]} />
              
              {/* Text alignment guides */}
              <View style={styles.textGuideLines}>
                <View style={styles.horizontalGuide} />
                <View style={styles.horizontalGuide} />
                <View style={styles.horizontalGuide} />
              </View>
            </View>

            {/* Focus ring */}
            {focusPoint && (
              <Animated.View
                style={[
                  styles.focusRing,
                  {
                    left: focusPoint.x - 40,
                    top: focusPoint.y - 40,
                    opacity: focusRingOpacity,
                  },
                ]}
              />
            )}

            {/* Zoom indicator */}
            {zoom > 0.05 && (
              <View style={styles.zoomIndicator}>
                <Text style={styles.zoomText}>
                  {(1 + zoom * 2).toFixed(1)}x
                </Text>
              </View>
            )}

            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              {/* Left side controls */}
              <View style={styles.leftControls}>
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
                  style={[styles.controlButton, zoom <= 0.01 && styles.controlButtonDisabled]}
                  onPress={zoomOut}
                  disabled={zoom <= 0.01}
                >
                  <Ionicons 
                    name="remove" 
                    size={24} 
                    color={zoom <= 0.01 ? "#666" : "#fff"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Center capture button */}
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <View style={styles.captureInner}>
                    <Ionicons name="camera" size={32} color="#059669" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Right side controls */}
              <View style={styles.rightControls}>
                <TouchableOpacity 
                  style={[styles.controlButton, zoom >= 0.98 && styles.controlButtonDisabled]}
                  onPress={zoomIn}
                  disabled={zoom >= 0.98}
                >
                  <Ionicons 
                    name="add" 
                    size={24} 
                    color={zoom >= 0.98 ? "#666" : "#fff"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={toggleCameraType}
                >
                  <Ionicons name="camera-reverse" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Camera>

      {/* Quick reset zoom button */}
      {zoom > 0.05 && (
        <TouchableOpacity style={styles.resetZoomButton} onPress={resetZoom}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.resetZoomText}>Reset Zoom</Text>
        </TouchableOpacity>
      )}

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>How does this look?</Text>
            <Text style={styles.previewSubtitle}>Make sure text is clear and readable</Text>
          </View>
          
          {capturedImage && (
            <View style={styles.previewImageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            </View>
          )}
          
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakeImage}
            >
              <Ionicons name="camera" size={24} color="#ef4444" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmImage}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Looks Good!</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelp(false)}
      >
        <SafeAreaView style={styles.helpContainer}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpTitle}>📚 Text Capture Tips</Text>
            <TouchableOpacity 
              style={styles.helpCloseButton}
              onPress={() => setShowHelp(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.helpContent}>
            <View style={styles.helpSection}>
              <View style={styles.helpTipItem}>
                <Ionicons name="camera-outline" size={20} color="#059669" />
                <View style={styles.helpTipText}>
                  <Text style={styles.helpTipTitle}>Position Text Clearly</Text>
                  <Text style={styles.helpTipDescription}>
                    Keep text straight and fill the green frame for best results
                  </Text>
                </View>
              </View>
              
              <View style={styles.helpTipItem}>
                <Ionicons name="add-circle" size={20} color="#059669" />
                <View style={styles.helpTipText}>
                  <Text style={styles.helpTipTitle}>Use Zoom Controls</Text>
                  <Text style={styles.helpTipDescription}>
                    Tap + or - buttons to zoom in on small text gradually
                  </Text>
                </View>
              </View>
              
              <View style={styles.helpTipItem}>
                <Ionicons name="sunny" size={20} color="#059669" />
                <View style={styles.helpTipText}>
                  <Text style={styles.helpTipTitle}>Good Lighting</Text>
                  <Text style={styles.helpTipDescription}>
                    Use bright, even lighting. Avoid shadows on the text
                  </Text>
                </View>
              </View>
              
              <View style={styles.helpTipItem}>
                <Ionicons name="flash" size={20} color="#059669" />
                <View style={styles.helpTipText}>
                  <Text style={styles.helpTipTitle}>Use Flash if Needed</Text>
                  <Text style={styles.helpTipDescription}>
                    Tap the flash button for better lighting in dark areas
                  </Text>
                </View>
              </View>
              
              <View style={styles.helpTipItem}>
                <Ionicons name="eye" size={20} color="#059669" />
                <View style={styles.helpTipText}>
                  <Text style={styles.helpTipTitle}>Preview Before Processing</Text>
                  <Text style={styles.helpTipDescription}>
                    Check your photo looks clear before extracting words
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.helpNote}>
              <Ionicons name="information-circle" size={16} color="#6b7280" />
              <Text style={styles.helpNoteText}>
                The camera auto-focuses continuously. Tap anywhere for visual feedback.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  touchableOverlay: {
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
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  instructionFocused: {
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    borderColor: '#10b981',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  textFrameGuide: {
    position: 'absolute',
    top: '25%',
    left: '8%',
    right: '8%',
    bottom: '35%',
    justifyContent: 'center',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10b981',
    borderWidth: 4,
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
  textGuideLines: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 40,
  },
  horizontalGuide: {
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 1,
  },
  focusRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#10b981',
    backgroundColor: 'transparent',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  zoomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  leftControls: {
    flexDirection: 'column',
    gap: 15,
  },
  rightControls: {
    flexDirection: 'column',
    gap: 15,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  captureButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#10b981',
  },
  captureButtonDisabled: {
    borderColor: '#6b7280',
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetZoomButton: {
    position: 'absolute',
    top: 120,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetZoomText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Help Modal Styles
  helpContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  helpCloseButton: {
    padding: 4,
  },
  helpContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  helpSection: {
    paddingVertical: 20,
  },
  helpTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  helpTipText: {
    flex: 1,
    marginLeft: 12,
  },
  helpTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  helpTipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  helpNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  helpNoteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  // Preview Modal Styles
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  previewSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 8,
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  retakeButtonText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Permission Styles
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