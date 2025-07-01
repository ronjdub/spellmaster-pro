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
      
      // Extract and display only letter sounds in real-time
      const lettersOnly = extractLettersOnly(result);
      setSpellingTranscription(lettersOnly);
    }
  };

  // Helper function to extract only individual letters from speech
  const extractLettersOnly = (text: string): string => {
    // Convert speech to lowercase for processing
    const lowerText = text.toLowerCase();
    
    // Map of how letters might be spoken to actual letters
    const letterMap: { [key: string]: string } = {
      'a': 'A', 'ay': 'A', 'eh': 'A',
      'b': 'B', 'be': 'B', 'bee': 'B',
      'c': 'C', 'see': 'C', 'sea': 'C',
      'd': 'D', 'de': 'D', 'dee': 'D',
      'e': 'E', 'ee': 'E',
      'f': 'F', 'ef': 'F', 'eff': 'F',
      'g': 'G', 'gee': 'G', 'jee': 'G',
      'h': 'H', 'aitch': 'H', 'ache': 'H',
      'i': 'I', 'eye': 'I', 'ai': 'I',
      'j': 'J', 'jay': 'J', 'jaye': 'J',
      'k': 'K', 'kay': 'K', 'okay': 'K',
      'l': 'L', 'el': 'L', 'ell': 'L',
      'm': 'M', 'em': 'M',
      'n': 'N', 'en': 'N',
      'o': 'O', 'oh': 'O', 'owe': 'O',
      'p': 'P', 'pee': 'P', 'pe': 'P',
      'q': 'Q', 'que': 'Q', 'queue': 'Q',
      'r': 'R', 'are': 'R', 'ar': 'R',
      's': 'S', 'es': 'S', 'ess': 'S',
      't': 'T', 'te': 'T', 'tee': 'T',
      'u': 'U', 'you': 'U', 'yu': 'U',
      'v': 'V', 've': 'V', 'vee': 'V',
      'w': 'W', 'double u': 'W', 'doubleyou': 'W',
      'x': 'X', 'ex': 'X',
      'y': 'Y', 'why': 'Y', 'wye': 'Y',
      'z': 'Z', 'zee': 'Z', 'zed': 'Z'
    };
    
    // Split text into words and filter for letter sounds
    const words = lowerText.split(/\s+/);
    const letters: string[] = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation
      if (letterMap[cleanWord]) {
        letters.push(letterMap[cleanWord]);
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
      return 'Say: Word → Letters (A B C) → Word';
    }
    return 'Ready to spell? We\'ll only track the letters!';
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
      Alert.alert('No Letters Detected', 'We couldn\'t hear any letter sounds. Please try again.');
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
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setTimeout(() => {
        speakCurrentWord();
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

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Spelling Bee Format:</Text>
          <Text style={styles.instructionsText}>
            1. Listen to the word pronunciation
          </Text>
          <Text style={styles.instructionsText}>
            2. Tap "Repeat & Spell Word"
          </Text>
          <Text style={styles.instructionsText}>
            3. Say: Word → Letters only → Word
          </Text>
          <Text style={styles.instructionsText}>
            📝 Only individual letters will be tracked!
          </Text>
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
            {spellingTranscription ? (
              <View style={styles.lettersDisplay}>
                <Text style={styles.lettersTitle}>Letters heard:</Text>
                <Text style={styles.lettersText}>{spellingTranscription}</Text>
              </View>
            ) : null}
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
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
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
    marginBottom: 32,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '600',
  },
  currentWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  instructionsContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: '#1e40af',
    marginBottom: 8,
    fontWeight: '500',
  },
  controlsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 16,
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
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
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
    fontSize: 48,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  heardText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  correctSpellingText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 16,
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
});

export default SpellingScreen;