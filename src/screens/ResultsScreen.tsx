// src/screens/ResultsScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { storeMissedWords } from '../utils/storage';

type ResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { totalWords, correctWords, missedWords, listName } = route.params;

  const accuracy = Math.round((correctWords / totalWords) * 100);

  useEffect(() => {
    // Store missed words for future practice
    if (missedWords.length > 0) {
      storeMissedWords(missedWords);
    }
  }, [missedWords]);

  const getPerformanceMessage = () => {
    if (accuracy === 100) {
      return "🎉 Perfect! You're a spelling superstar!";
    } else if (accuracy >= 80) {
      return "🌟 Great job! You're doing awesome!";
    } else if (accuracy >= 60) {
      return "👍 Good work! Keep practicing!";
    } else {
      return "💪 Keep trying! Practice makes perfect!";
    }
  };

  const getAccuracyColor = () => {
    if (accuracy >= 80) return '#16a34a';
    if (accuracy >= 60) return '#f59e0b';
    return '#dc2626';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>📊 Session Results</Text>
          <Text style={styles.listName}>{listName}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalWords}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{correctWords}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          
          <View style={[styles.statCard, styles.accuracyCard]}>
            <Text style={[styles.statNumber, { color: getAccuracyColor() }]}>
              {accuracy}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.performanceMessage}>
            {getPerformanceMessage()}
          </Text>
        </View>

        {missedWords.length > 0 && (
          <View style={styles.missedWordsContainer}>
            <Text style={styles.missedWordsTitle}>
              📚 Words to Review ({missedWords.length})
            </Text>
            <View style={styles.missedWordsList}>
              {missedWords.map((word, index) => (
                <View key={index} style={styles.missedWordItem}>
                  <Text style={styles.missedWord}>{word}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.missedWordsNote}>
              💡 These words have been saved for future practice!
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>🏠 Return to Home</Text>
          </TouchableOpacity>

          {missedWords.length > 0 && (
            <TouchableOpacity
              style={styles.practiceButton}
              onPress={() => navigation.navigate('Spelling', { 
                words: missedWords, 
                listName: 'Missed Words Review' 
              })}
            >
              <Text style={styles.practiceButtonText}>🎯 Practice Missed Words</Text>
            </TouchableOpacity>
          )}
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  listName: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accuracyCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  messageContainer: {
    backgroundColor: '#eff6ff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  performanceMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
  },
  missedWordsContainer: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  missedWordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 16,
    textAlign: 'center',
  },
  missedWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  missedWordItem: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  missedWord: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: '600',
  },
  missedWordsNote: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 16,
  },
  homeButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  practiceButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  practiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResultsScreen;