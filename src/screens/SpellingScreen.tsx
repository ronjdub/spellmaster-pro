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

const SpellingScreen: React.FC = () => {
  const navigation = useNavigation<SpellingScreenNavigationProp>();
  const route = useRoute<SpellingScreenRouteProp>();
  const { words, listName } = route.params;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
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
    setSpokenText('');
    try {
      await speakWord(currentWord);
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      console.log('Heard:', result);
      setSpokenText(result);
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech error:', e.error);
    setIsListening(false);
    Alert.alert('Speech Error', 'We couldn\'t hear that clearly. Try again.');
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const handleStartSpelling = async () => {
    setSpokenText('');
    setShowResult(false);
    setIsListening(true);
    
    try {
      await startListening();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Could not start speech recognition. Please try again.');
    }
  };

  const handleDoneSpelling = async () => {
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
    if (!spokenText.trim()) {
      Alert.alert('No Speech Detected', 'We couldn\'t hear anything. Please try again.');
      return;
    }

    // Use the simple spelling checker
    const correct = isSpellingCorrect(spokenText, currentWord);
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

        <View style={styles.wordContainer}>
          <Text style={styles.wordTitle}>🎯 Spelling Challenge</Text>
          <Text style={styles.instructionText}>
            Listen carefully and spell the word!
          </Text>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Simple Steps:</Text>
          <Text style={styles.instructionsText}>
            1. Listen to the word pronunciation
          </Text>
          <Text style={styles.instructionsText}>
            2. Tap "Start Spelling"
          </Text>
          <Text style={styles.instructionsText}>
            3. Spell the word out loud
          </Text>
          <Text style={styles.instructionsText}>
            4. Tap "Done Spelling"
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.repeatButton]}
            onPress={handleRepeatWord}
          >
            <Text style={styles.buttonText}>🔄 Repeat Word</Text>
          </TouchableOpacity>

          {!isListening ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartSpelling}
            >
              <Text style={styles.buttonText}>🎤 Start Spelling</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleDoneSpelling}
            >
              <Text style={styles.buttonText}>🛑 Done Spelling</Text>
            </TouchableOpacity>
          )}
        </View>

        {isListening && (
          <View style={styles.listeningContainer}>
            <Text style={styles.listeningText}>🎯 Listening...</Text>
            <View style={styles.spokenTextContainer}>
              <Text style={styles.spokenTextLabel}>What you're saying:</Text>
              <Text style={styles.spokenText}>
                {spokenText || '(waiting for speech...)'}
              </Text>
            </View>
          </View>
        )}

        {!isListening && spokenText && !showResult && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Your spelling:</Text>
            <Text style={styles.previewText}>{spokenText}</Text>
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
              You said: "{spokenText}"
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
  stopButton: {
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
    marginBottom: 16,
  },
  spokenTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  spokenTextLabel: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 8,
  },
  spokenText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    minHeight: 30,
  },
  previewContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  previewText: {
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