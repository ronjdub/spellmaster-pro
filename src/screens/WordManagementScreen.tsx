// src/screens/WordManagementScreen.tsx - UPDATED with hamburger menu
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getCustomWordLists, 
  deleteCustomWordList, 
  storeCustomWordList,
  getMissedWords,
  clearMissedWords 
} from '../utils/storage';
import { WORD_LISTS, WORD_LIST_OPTIONS } from '../constants/wordLists';
import HamburgerMenu from '../components/HamburgerMenu';

interface CustomWordList {
  name: string;
  words: string[];
  createdAt: number;
}

const WordManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [customLists, setCustomLists] = useState<CustomWordList[]>([]);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<CustomWordList | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingListName, setEditingListName] = useState('');
  const [editingWords, setEditingWords] = useState('');

  // Add hamburger menu to header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HamburgerMenu currentScreen="WordManagement" />,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadWordLists();
    }, [])
  );

  const loadWordLists = async () => {
    setIsLoading(true);
    try {
      const [lists, missed] = await Promise.all([
        getCustomWordLists(),
        getMissedWords()
      ]);
      setCustomLists(lists);
      setMissedWords(missed);
    } catch (error) {
      console.error('Error loading word lists:', error);
      Alert.alert('Error', 'Failed to load word lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = (listName: string) => {
    Alert.alert(
      'Delete Word List',
      `Are you sure you want to delete "${listName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomWordList(listName);
              setCustomLists(lists => lists.filter(list => list.name !== listName));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete word list');
            }
          }
        }
      ]
    );
  };

  const handleEditList = (list: CustomWordList) => {
    setSelectedList(list);
    setEditingListName(list.name);
    setEditingWords(list.words.join(', '));
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const words = editingWords
      .split(',')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);

    if (words.length === 0) {
      Alert.alert('Error', 'Please enter at least one word');
      return;
    }

    try {
      // If name changed, delete old list
      if (selectedList && editingListName !== selectedList.name) {
        await deleteCustomWordList(selectedList.name);
      }

      await storeCustomWordList(editingListName, words);
      setIsEditModalVisible(false);
      loadWordLists();
    } catch (error) {
      Alert.alert('Error', 'Failed to save word list');
    }
  };

  const handleClearMissedWords = () => {
    Alert.alert(
      'Clear Missed Words',
      'Are you sure you want to clear all missed words? This will remove them from practice recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearMissedWords();
              setMissedWords([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear missed words');
            }
          }
        }
      ]
    );
  };

  const handlePracticeList = (words: string[], listName: string) => {
    // Navigate to Practice stack's Spelling screen
    navigation.navigate('Practice' as any, {
      screen: 'Spelling',
      params: { words, listName }
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderDefaultList = (listKey: string, listData: any) => (
    <View key={listKey} style={styles.listCard}>
      <View style={styles.listHeader}>
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{listData.label}</Text>
          <Text style={styles.listSubtitle}>
            {listData.words.length} words • Built-in list
          </Text>
        </View>
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => handlePracticeList(listData.words, listData.label)}
        >
          <Ionicons name="play" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomList = (list: CustomWordList) => (
    <View key={list.name} style={styles.listCard}>
      <View style={styles.listHeader}>
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{list.name}</Text>
          <Text style={styles.listSubtitle}>
            {list.words.length} words • Created {formatDate(list.createdAt)}
          </Text>
        </View>
        <View style={styles.listActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditList(list)}
          >
            <Ionicons name="create-outline" size={20} color="#7c3aed" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteList(list.name)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => handlePracticeList(list.words, list.name)}
          >
            <Ionicons name="play" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.wordPreview}>
        <Text style={styles.wordPreviewText}>
          {list.words.slice(0, 5).join(', ')}
          {list.words.length > 5 && ` +${list.words.length - 5} more`}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading word lists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{customLists.length}</Text>
            <Text style={styles.statLabel}>Custom Lists</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{WORD_LIST_OPTIONS.length}</Text>
            <Text style={styles.statLabel}>Built-in Lists</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{missedWords.length}</Text>
            <Text style={styles.statLabel}>Missed Words</Text>
          </View>
        </View>

        {/* Missed Words Section */}
        {missedWords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Missed Words</Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearMissedWords}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.missedWordsCard}>
              <View style={styles.listHeader}>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>Practice Missed Words</Text>
                  <Text style={styles.listSubtitle}>
                    {missedWords.length} words need review
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.practiceButton}
                  onPress={() => handlePracticeList(missedWords, 'Missed Words')}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.wordPreview}>
                <Text style={styles.wordPreviewText}>
                  {missedWords.slice(0, 8).join(', ')}
                  {missedWords.length > 8 && ` +${missedWords.length - 8} more`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Custom Lists Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Custom Lists</Text>
          {customLists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Custom Lists Yet</Text>
              <Text style={styles.emptyText}>
                Use the camera to capture words from images and create your own word lists!
              </Text>
            </View>
          ) : (
            customLists.map(renderCustomList)
          )}
        </View>

        {/* Built-in Lists Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built-in Word Lists</Text>
          {WORD_LIST_OPTIONS.map(option => {
            const words = WORD_LISTS[option.value as keyof typeof WORD_LISTS] || [];
            return renderDefaultList(option.value, { ...option, words });
          })}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Word List</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>List Name</Text>
            <TextInput
              style={styles.textInput}
              value={editingListName}
              onChangeText={setEditingListName}
              placeholder="Enter list name"
            />
            
            <Text style={styles.fieldLabel}>Words (comma separated)</Text>
            <TextInput
              style={[styles.textInput, styles.wordsInput]}
              value={editingWords}
              onChangeText={setEditingWords}
              placeholder="word1, word2, word3..."
              multiline
              numberOfLines={6}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  missedWordsCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  wordPreviewText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  wordsInput: {
    height: 120,
    textAlignVertical: 'top',
  },
});

export default WordManagementScreen;