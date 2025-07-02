// src/screens/SpellingScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { RootStackParamList } from '../../App';
import { speakWord, startListening, stopListening, destroyVoice, isSpellingCorrect } from '../utils/speechUtils';


type SpellingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Spelling'>;
type SpellingScreenRouteProp = RouteProp<RootStackParamList, 'Spelling'>;

type SpellingStage = 'ready' | 'listening' | 'complete';

const SpellingScreen: React.FC = () => {
  const navigation = useNavigation<SpellingScreenNavigationProp>();
  const route = useRoute<SpellingScreenRouteProp>();
  const { words, listName } = route.params;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [spellingTranscription, setSpellingTranscription] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentWord = words[currentWordIndex];

 

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    speakCurrentWord();

    return () => {
      destroyVoice();
    };
  }, []);

  useEffect(() => {
    if (showResult) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [showResult]);

  const speakCurrentWord = async () => {
    setShowResult(false);
    setTranscription('');
    setSpellingTranscription('');
    try {
      await speakWord(currentWord);
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      setTranscription(result);
      
      // Debug: log what we heard
      console.log('Speech heard:', result);
      
      // Extract and display only letter sounds in real-time
      const lettersOnly = extractLettersOnly(result);
      console.log('Letters extracted:', lettersOnly);
      
      setSpellingTranscription(lettersOnly);
    }
  };

  // Helper function to extract only individual letters from speech
  const extractLettersOnly = (text: string): string => {
    // Convert speech to lowercase for processing
    const lowerText = text.toLowerCase();
    
    // More comprehensive letter mapping including common mispronunciations
    const letterMap: { [key: string]: string } = {
      // A variations
      'a': 'A', 'ay': 'A', 'eh': 'A', 'hey': 'A',
      // B variations  
      'b': 'B', 'be': 'B', 'bee': 'B', 'bea': 'B',
      // C variations
      'c': 'C', 'see': 'C', 'sea': 'C', 'si': 'C', 'cee': 'C',
      // D variations
      'd': 'D', 'de': 'D', 'dee': 'D', 'di': 'D',
      // E variations
      'e': 'E', 'ee': 'E', 'ea': 'E',
      // F variations
      'f': 'F', 'ef': 'F', 'eff': 'F', 'fe': 'F',
      // G variations
      'g': 'G', 'gee': 'G', 'jee': 'G', 'ge': 'G', 'ji': 'G',
      // H variations
      'h': 'H', 'aitch': 'H', 'ache': 'H', 'age': 'H', 'etch': 'H',
      // I variations
      'i': 'I', 'eye': 'I', 'ai': 'I', 'aye': 'I',
      // J variations
      'j': 'J', 'jay': 'J', 'jaye': 'J', 'ja': 'J',
      // K variations
      'k': 'K', 'kay': 'K', 'ca': 'K', 'kaye': 'K',
      // L variations
      'l': 'L', 'el': 'L', 'ell': 'L', 'le': 'L',
      // M variations
      'm': 'M', 'em': 'M', 'me': 'M',
      // N variations
      'n': 'N', 'en': 'N', 'ne': 'N',
      // O variations
      'o': 'O', 'oh': 'O', 'owe': 'O', 'ow': 'O',
      // P variations
      'p': 'P', 'pee': 'P', 'pe': 'P', 'pi': 'P',
      // Q variations
      'q': 'Q', 'que': 'Q', 'queue': 'Q', 'cue': 'Q', 'cu': 'Q',
      // R variations
      'r': 'R', 'are': 'R', 'ar': 'R', 're': 'R',
      // S variations
      's': 'S', 'es': 'S', 'ess': 'S', 'se': 'S',
      // T variations
      't': 'T', 'te': 'T', 'tee': 'T', 'ti': 'T', 'tea': 'T',
      // U variations
      'u': 'U', 'you': 'U', 'yu': 'U', 'ue': 'U', 'ew': 'U',
      // V variations
      'v': 'V', 've': 'V', 'vee': 'V', 'vi': 'V',
      // W variations
      'w': 'W', 'double u': 'W', 'doubleyou': 'W', 'double you': 'W', 'wu': 'W',
      // X variations
      'x': 'X', 'ex': 'X', 'eks': 'X',
      // Y variations
      'y': 'Y', 'why': 'Y', 'wye': 'Y', 'wi': 'Y', 'way': 'Y',
      // Z variations
      'z': 'Z', 'zee': 'Z', 'zed': 'Z', 'ze': 'Z'
    };
    
    // Split text into words and filter for letter sounds
    const words = lowerText.split(/\s+/);
    const letters: string[] = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation
      
      // Direct letter mapping
      if (letterMap[cleanWord]) {
        letters.push(letterMap[cleanWord]);
        continue;
      }
      
      // Check for single letter words
      if (cleanWord.length === 1 && /[a-z]/.test(cleanWord)) {
        letters.push(cleanWord.toUpperCase());
        continue;
      }
      
      // Check partial matches (in case speech recognition cuts off)
      for (const [key, value] of Object.entries(letterMap)) {
        if (key.startsWith(cleanWord) || cleanWord.startsWith(key)) {
          letters.push(value);
          break;
        }
      }
    }
    
    return letters.join(' ');
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech error:', e.error);
    setIsListening(false);
    Alert.alert('Speech Error', 'We couldn\'t hear that clearly. Try again.');
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const getInstructionText = () => {
    if (isListening) {
      return 'Say: Word → Letters (AY, BEE, SEE) → Word';
    }
    return 'Ready to spell? We\'ll track letters in real-time!';
  };

  const getButtonText = () => {
    if (isListening) {
      return '🛑 Done Spelling';
    }
    return '🎤 Repeat & Spell Word';
  };

  const handleStartListening = async () => {
    setTranscription('');
    setIsListening(true);
    
    try {
      await startListening();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Could not start speech recognition. Please try again.');
    }
  };

  const handleStopListening = async () => {
    if (!isListening) return;

    try {
      await stopListening();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
    
    setIsListening(false);
    evaluateSpelling();
  };

  const evaluateSpelling = () => {
    if (!spellingTranscription.trim()) {
      Alert.alert(
        'No Letters Detected', 
        'Try speaking letters more clearly. Say each letter separately: "A" "B" "C"'
      );
      return;
    }

    // Evaluate only the letters (ignore any full words)
    const correct = isSpellingCorrect(spellingTranscription, currentWord);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCorrectWords([...correctWords, currentWord]);
    } else {
      setMissedWords([...missedWords, currentWord]);
    }
  };



  const handleNextWord = () => {
    const nextIndex = currentWordIndex + 1;
    
    if (nextIndex < words.length) {
      // Move to next word
      setCurrentWordIndex(nextIndex);
      // Speak the next word directly using the calculated index
      const nextWord = words[nextIndex];
      setTimeout(async () => {
        setShowResult(false);
        setSpokenText('');
        try {
          await speakWord(nextWord);
        } catch (error) {
          console.error('Error speaking word:', error);
        }
      }, 500);
    } else {
      // Session complete
      navigation.replace('Results', {
        totalWords: words.length,
        correctWords: correctWords.length + (isCorrect ? 1 : 0),
        missedWords: isCorrect ? missedWords : [...missedWords, currentWord],
        listName,
      });
    }
  };

  const handleRepeatWord = () => {
    speakCurrentWord();
  };

  const HelpModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showHelpModal}
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowHelpModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Simple Steps:</Text>
          
          <View style={styles.stepsList}>
            <Text style={styles.stepText}>1. Listen to the word pronunciation</Text>
            <Text style={styles.stepText}>2. Tap "Start Spelling"</Text>
            <Text style={styles.stepText}>3. Spell the word out loud</Text>
            <Text style={styles.stepText}>4. Tap "Done Spelling"</Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Word {currentWordIndex + 1} of {words.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentWordIndex + 1) / words.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* HIDDEN: Word display commented out for true spelling bee experience */}
        {/* 
        <View style={styles.wordContainer}>
          <Text style={styles.wordTitle}>🗣️ Your word is:</Text>
          <Text style={styles.currentWord}>{currentWord}</Text>
        </View>
        */}

        <View style={styles.wordContainer}>
          <Text style={styles.wordTitle}>🎯 Spelling Challenge</Text>
          <Text style={styles.instructionText}>{getInstructionText()}</Text>
        </View>

        {/* Help Button - ONLY NEW ADDITION */}
        <View style={styles.helpButtonContainer}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowHelpModal(true)}
          >
            <Text style={styles.helpButtonText}>❓</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.repeatButton]}
            onPress={handleRepeatWord}
          >
            <Text style={styles.buttonText}>🔄 Repeat Word</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              isListening ? styles.listeningButton : styles.startButton
            ]}
            onPress={isListening ? handleStopListening : handleStartListening}
          >
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>

        {isListening && (
          <View style={styles.listeningContainer}>
            <Text style={styles.listeningText}>🎯 Listening for letters...</Text>
            <View style={styles.lettersDisplay}>
              <Text style={styles.lettersTitle}>Letters heard so far:</Text>
              <Text style={styles.lettersText}>
                {spellingTranscription || '(waiting for letters...)'}
              </Text>
            </View>
            <Text style={styles.listeningHint}>
              Say letters clearly: "A" "B" "C"
            </Text>
          </View>
        )}

        {!isListening && spellingTranscription && !showResult && (
          <View style={styles.spellingPreview}>
            <Text style={styles.spellingPreviewTitle}>Letters you spelled:</Text>
            <Text style={styles.spellingPreviewText}>{spellingTranscription}</Text>
          </View>
        )}

        {showResult && (
          <Animated.View 
            style={[
              styles.resultContainer,
              isCorrect ? styles.correctResult : styles.incorrectResult,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text style={styles.resultIcon}>
              {isCorrect ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultText}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </Text>
            <Text style={styles.heardText}>
              You spelled: "{spellingTranscription}"
            </Text>
            {!isCorrect && (
              <Text style={styles.correctSpellingText}>
                The word was: {currentWord}
              </Text>
            )}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextWord}
            >
              <Text style={styles.nextButtonText}>
                {currentWordIndex < words.length - 1 ? 'Next Word ➔' : 'See Results ➔'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <HelpModal />
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '600',
  },
  // NEW: Help Button Styles
  helpButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  helpButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontSize: 24,
  },
  controlsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  repeatButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  listeningButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  listeningContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    marginBottom: 20,
  },
  listeningText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  lettersDisplay: {
    alignItems: 'center',
  },
  lettersTitle: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 4,
  },
  lettersText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 4,
  },
  listeningHint: {
    fontSize: 14,
    color: '#78716c',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#78716c',
    fontStyle: 'italic',
  },
  spellingPreview: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  spellingPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  spellingPreviewText: {
    fontSize: 18,
    color: '#0c4a6e',
    fontWeight: '600',
  },
  resultContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  correctResult: {
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  incorrectResult: {
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  resultIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heardText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 6,
    textAlign: 'center',
  },
  correctSpellingText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // NEW: Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  stepsList: {
    gap: 12,
  },
  stepText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '500',
    paddingLeft: 10,
  },
});

export default SpellingScreen;