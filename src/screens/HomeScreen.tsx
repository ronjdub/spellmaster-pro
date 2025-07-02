// src/screens/HomeScreen.tsx - UPDATED to include custom lists
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { WORD_LISTS, WORD_LIST_OPTIONS } from '../constants/wordLists';
import { 
  getMissedWords, 
  getLastSelectedList, 
  storeLastSelectedList,
  getCustomWordLists,
  CustomWordList 
} from '../utils/storage';
import HamburgerMenu from '../components/HamburgerMenu';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface PickerOption {
  label: string;
  value: string;
  words?: string[];
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedList, setSelectedList] = useState<string>('week1');
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [customLists, setCustomLists] = useState<CustomWordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HamburgerMenu currentScreen="Home" />,
    });
  }, [navigation]);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [lastSelected, missed, custom] = await Promise.all([
        getLastSelectedList(),
        getMissedWords(),
        getCustomWordLists(),
      ]);
      
      if (lastSelected) {
        setSelectedList(lastSelected);
      }
      setMissedWords(missed);
      setCustomLists(custom);
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
    } else if (selectedList.startsWith('custom_')) {
      // Handle custom lists
      const customListName = selectedList.replace('custom_', '');
      const customList = customLists.find(list => list.name === customListName);
      if (customList) {
        words = customList.words;
        listName = customList.name;
      } else {
        Alert.alert('Error', 'Custom list not found.');
        return;
      }
    } else {
      // Handle built-in lists
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

  // Build picker options dynamically
  const buildPickerOptions = (): PickerOption[] => {
    const options: PickerOption[] = [...WORD_LIST_OPTIONS];
    
    // Add custom lists
    customLists.forEach(customList => {
      options.push({
        label: `📝 ${customList.name}`,
        value: `custom_${customList.name}`,
        words: customList.words
      });
    });
    
    // Add missed words if any
    if (missedWords.length > 0) {
      options.push({ 
        label: `🔄 Practice Missed Words (${missedWords.length})`, 
        value: 'missed',
        words: missedWords
      });
    }
    
    return options;
  };

  const pickerOptions = buildPickerOptions();
  const selectedOption = pickerOptions.find(option => option.value === selectedList);

  const handleOptionSelect = (value: string) => {
    setSelectedList(value);
    setShowPicker(false);
  };

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
          
          {/* Custom Picker Button */}
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedOption?.label || 'Select a list...'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Picker Modal */}
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Word List</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.optionsList}>
                {pickerOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      selectedList === option.value && styles.selectedOption
                    ]}
                    onPress={() => handleOptionSelect(option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedList === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                    {selectedList === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPractice}
        >
          <Text style={styles.startButtonText}>🎯 Start Practice</Text>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {missedWords.length > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                📚 You have {missedWords.length} words to review
              </Text>
            </View>
          )}
          
          {customLists.length > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                📝 You have {customLists.length} custom word {customLists.length === 1 ? 'list' : 'lists'}
              </Text>
            </View>
          )}
        </View>
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
  pickerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  selectedOptionText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
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
  statsSection: {
    marginTop: 32,
    width: '100%',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 16,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;