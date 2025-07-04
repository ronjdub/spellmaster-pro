// src/screens/OCRProcessingScreen.tsx - UPDATED with real OCR
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { OCRStackParamList } from '../../App';
import { storeCustomWordList } from '../utils/storage';

type OCRProcessingScreenNavigationProp = NativeStackNavigationProp<OCRStackParamList, 'OCRProcessing'>;
type OCRProcessingScreenRouteProp = RouteProp<OCRStackParamList, 'OCRProcessing'>;

const { width } = Dimensions.get('window');

const OCRProcessingScreen: React.FC = () => {
  const navigation = useNavigation<OCRProcessingScreenNavigationProp>();
  const route = useRoute<OCRProcessingScreenRouteProp>();
  const { imageUri } = route.params;

  const [isProcessing, setIsProcessing] = useState(true);
  const [extractedText, setExtractedText] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [listName, setListName] = useState('');
  const [processingStep, setProcessingStep] = useState('Analyzing image...');
  const [ocrError, setOcrError] = useState<string | null>(null);

  useEffect(() => {
    processImageWithOCR();
  }, []);

  const processImageWithOCR = async () => {
    try {
      setIsProcessing(true);
      setOcrError(null);
      
      // Step 1: Analyze image
      setProcessingStep('Analyzing image structure...');
      await delay(800);
      
      // Step 2: Run OCR
      setProcessingStep('Reading text with AI...');
      await delay(500);
      
      const result = await TextRecognition.recognize(imageUri);
      
      if (!result || !result.text || result.text.trim().length === 0) {
        throw new Error('No text found in image. Try taking a clearer photo with better lighting.');
      }
      
      setExtractedText(result.text);
      
      // Step 3: Process results
      setProcessingStep('Extracting words...');
      await delay(500);
      
      const extractedWords = extractWordsFromText(result.text);
      
      if (extractedWords.length === 0) {
        throw new Error('No valid words found. Please try a different image.');
      }
      
      setWords(extractedWords);
      
      // Auto-select all words initially
      setSelectedWords(new Set(extractedWords));
      
      setProcessingStep('Complete!');
      await delay(500);
      
      setIsProcessing(false);
    } catch (error) {
      console.error('OCR processing error:', error);
      setOcrError(error instanceof Error ? error.message : 'Failed to process image');
      setIsProcessing(false);
      
      // Show retry dialog
      Alert.alert(
        'OCR Processing Failed',
        error instanceof Error ? error.message : 'Failed to process the image. Please try again with a clearer photo.',
        [
          { text: 'Retry', onPress: processImageWithOCR },
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const extractWordsFromText = (text: string): string[] => {
    return text
      .toLowerCase()
      // Replace common OCR misreads
      .replace(/[0-9]/g, '') // Remove numbers
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .map(word => word.trim())
      .filter(word => word.length >= 3) // Filter out very short words
      .filter(word => /^[a-z]+$/.test(word)) // Only alphabetic words
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
      .sort(); // Sort alphabetically
  };

  const toggleWordSelection = (word: string) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  const selectAllWords = () => {
    setSelectedWords(new Set(words));
  };

  const deselectAllWords = () => {
    setSelectedWords(new Set());
  };

  const saveWordList = async () => {
    if (selectedWords.size === 0) {
      Alert.alert('No Words Selected', 'Please select at least one word to save.');
      return;
    }

    if (!listName.trim()) {
      Alert.alert('List Name Required', 'Please enter a name for your word list.');
      return;
    }

    try {
      const wordArray = Array.from(selectedWords);
      await storeCustomWordList(listName.trim(), wordArray);
      
      Alert.alert(
        'Success!',
        `Saved ${wordArray.length} words to "${listName.trim()}"`,
        [
          {
            text: 'Practice Now',
            onPress: () => {
              navigation.navigate('Practice' as any, {
                screen: 'Spelling',
                params: { words: wordArray, listName: listName.trim() }
              });
            }
          },
          {
            text: 'Take Another Photo',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving word list:', error);
      Alert.alert('Error', 'Failed to save word list. Please try again.');
    }
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.processingTitle}>Processing Image</Text>
            <Text style={styles.processingStep}>{processingStep}</Text>
            
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                { width: processingStep.includes('Complete') ? '100%' : '70%' }
              ]} />
            </View>
            
            <Text style={styles.processingHint}>
              Using Google ML Kit to extract text from your image...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (ocrError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="camera-outline" size={80} color="#ef4444" />
          <Text style={styles.errorTitle}>Processing Failed</Text>
          <Text style={styles.errorMessage}>{ocrError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={processImageWithOCR}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Take New Photo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.resultImage} />
          <View style={styles.imageOverlay}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.imageStatus}>
              Found {words.length} words
            </Text>
          </View>
        </View>

        {/* Extracted Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted Text</Text>
          <View style={styles.textContainer}>
            <ScrollView style={styles.extractedTextScroll} nestedScrollEnabled>
              <Text style={styles.extractedTextDisplay}>{extractedText}</Text>
            </ScrollView>
          </View>
        </View>

        {/* Word Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Select Words ({selectedWords.size} of {words.length})
            </Text>
            <View style={styles.selectionButtons}>
              <TouchableOpacity style={styles.selectButton} onPress={selectAllWords}>
                <Text style={styles.selectButtonText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectButton} onPress={deselectAllWords}>
                <Text style={styles.selectButtonText}>None</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.wordsContainer}>
            {words.map((word) => (
              <TouchableOpacity
                key={word}
                style={[
                  styles.wordChip,
                  selectedWords.has(word) && styles.selectedWordChip
                ]}
                onPress={() => toggleWordSelection(word)}
              >
                <Text style={[
                  styles.wordText,
                  selectedWords.has(word) && styles.selectedWordText
                ]}>
                  {word}
                </Text>
                {selectedWords.has(word) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {words.length === 0 && (
            <View style={styles.noWordsContainer}>
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text style={styles.noWordsText}>No words extracted</Text>
              <Text style={styles.noWordsHint}>Try a clearer image with more text</Text>
            </View>
          )}
        </View>

        {/* Save Word List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Save Word List</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter list name (e.g., 'Science Vocabulary')"
            value={listName}
            onChangeText={setListName}
            maxLength={50}
          />
          
          <TouchableOpacity 
            style={[styles.saveButton, selectedWords.size === 0 && styles.saveButtonDisabled]}
            onPress={saveWordList}
            disabled={selectedWords.size === 0}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              Save {selectedWords.size} Words
            </Text>
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
  processingContainer: {
    flex: 1,
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 32,
  },
  processingContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  processingStep: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 32,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  processingHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 20,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    margin: 16,
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageStatus: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  extractedTextScroll: {
    maxHeight: 120,
    padding: 16,
  },
  extractedTextDisplay: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 6,
  },
  selectedWordChip: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  wordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedWordText: {
    color: '#fff',
  },
  noWordsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noWordsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 8,
  },
  noWordsHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  nameInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OCRProcessingScreen;