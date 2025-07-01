// src/screens/AddWordsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import HamburgerMenu from '../components/HamburgerMenu';

type AddWordsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddWords'>;

const AddWordsScreen: React.FC = () => {
  const navigation = useNavigation<AddWordsScreenNavigationProp>();

  // Set up header with hamburger menu
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HamburgerMenu currentScreen="AddWords" />,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroIcon}>📷</Text>
          <Text style={styles.heroTitle}>Add New Words</Text>
          <Text style={styles.heroSubtitle}>
            Take a photo of word lists or select from your gallery
          </Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} disabled>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>📱</Text>
              <Text style={styles.actionButtonTitle}>Take Photo</Text>
              <Text style={styles.actionButtonSubtitle}>Use camera to scan words</Text>
            </View>
            <Text style={styles.placeholderLabel}>[PLACEHOLDER]</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} disabled>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🖼️</Text>
              <Text style={styles.actionButtonTitle}>Select from Gallery</Text>
              <Text style={styles.actionButtonSubtitle}>Choose existing image</Text>
            </View>
            <Text style={styles.placeholderLabel}>[PLACEHOLDER]</Text>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Coming Soon Features:</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>OCR Text Recognition</Text>
              <Text style={styles.featureDescription}>
                Automatically detect printed and handwritten words
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✏️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Word Review & Editing</Text>
              <Text style={styles.featureDescription}>
                Review and edit detected words before adding
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚠️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Smart Validation</Text>
              <Text style={styles.featureDescription}>
                Detect proper nouns and duplicates automatically
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💾</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Custom Word Lists</Text>
              <Text style={styles.featureDescription}>
                Create and name your own word lists
              </Text>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    marginBottom: 40,
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    opacity: 0.6,
  },
  actionButtonContent: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  placeholderLabel: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  featuresContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddWordsScreen;