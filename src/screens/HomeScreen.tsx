// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { WORD_LISTS, WORD_LIST_OPTIONS } from '../constants/wordLists';
import { getMissedWords, getLastSelectedList, storeLastSelectedList } from '../utils/storage';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedList, setSelectedList] = useState<string>('week1');
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [lastSelected, missed] = await Promise.all([
        getLastSelectedList(),
        getMissedWords(),
      ]);
      
      if (lastSelected) {
        setSelectedList(lastSelected);
      }
      setMissedWords(missed);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = async () => {
    let words: string[] = [];
    let listName: string = '';

    if (selectedList === 'missed') {
      if (missedWords.length === 0) {
        Alert.alert('No Missed Words', 'You haven\'t missed any words yet! Try practicing other lists first.');
        return;
      }
      words = missedWords;
      listName = 'Missed Words';
    } else {
      words = WORD_LISTS[selectedList as keyof typeof WORD_LISTS];
      listName = WORD_LIST_OPTIONS.find(option => option.value === selectedList)?.label || '';
    }

    if (words.length === 0) {
      Alert.alert('No Words', 'No words available for this selection.');
      return;
    }

    await storeLastSelectedList(selectedList);
    
    navigation.navigate('Spelling', { words, listName });
  };

  const pickerOptions = [...WORD_LIST_OPTIONS];
  if (missedWords.length > 0) {
    pickerOptions.push({ label: `Practice Missed Words (${missedWords.length})`, value: 'missed' });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧙‍♂️ SpellMaster PRO</Text>
        <Text style={styles.subtitle}>Choose your spelling adventure!</Text>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Select Word List:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedList}
              onValueChange={(itemValue) => setSelectedList(itemValue)}
              style={styles.picker}
            >
              {pickerOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPractice}
        >
          <Text style={styles.startButtonText}>🎯 Start Practice</Text>
        </TouchableOpacity>

        {missedWords.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              📚 You have {missedWords.length} words to review
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 32,
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: 60,
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  statsText: {
    fontSize: 16,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;