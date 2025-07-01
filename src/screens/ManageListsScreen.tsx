// src/screens/ManageListsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { WORD_LISTS, WORD_LIST_OPTIONS } from '../constants/wordLists';
import { getMissedWords } from '../utils/storage';
import HamburgerMenu from '../components/HamburgerMenu';

type ManageListsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageLists'>;

const ManageListsScreen: React.FC = () => {
  const navigation = useNavigation<ManageListsScreenNavigationProp>();
  const [missedWords, setMissedWords] = useState<string[]>([]);

  // Set up header with hamburger menu
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HamburgerMenu currentScreen="ManageLists" />,
    });
  }, [navigation]);

  useEffect(() => {
    loadMissedWords();
  }, []);

  const loadMissedWords = async () => {
    try {
      const missed = await getMissedWords();
      setMissedWords(missed);
    } catch (error) {
      console.error('Error loading missed words:', error);
    }
  };

  const handlePlaceholderAction = (action: string) => {
    Alert.alert(
      'Feature Coming Soon',
      `${action} functionality will be available in the next update!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroIcon}>📝</Text>
          <Text style={styles.heroTitle}>Manage Word Lists</Text>
          <Text style={styles.heroSubtitle}>
            Edit, delete, and organize your word lists
          </Text>
        </View>

        {/* Static Lists Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Built-in Lists</Text>
          <Text style={styles.sectionSubtitle}>Default spelling lists</Text>
          
          {WORD_LIST_OPTIONS.map((list, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemIcon}>📚</Text>
                <View style={styles.listItemText}>
                  <Text style={styles.listItemTitle}>{list.label}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {WORD_LISTS[list.value as keyof typeof WORD_LISTS]?.length || 0} words
                  </Text>
                </View>
              </View>
              
              <View style={styles.listItemActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handlePlaceholderAction('Edit')}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                  <Text style={styles.placeholderMini}>[PLACEHOLDER]</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handlePlaceholderAction('Delete')}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  <Text style={styles.placeholderMini}>[PLACEHOLDER]</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Custom Lists Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Custom Lists</Text>
              <Text style={styles.sectionSubtitle}>Your created word lists</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddWords')}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {/* Placeholder for custom lists */}
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📂</Text>
            <Text style={styles.emptyStateTitle}>No Custom Lists Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first custom word list by taking a photo of words
            </Text>
            <Text style={styles.placeholderLabel}>[PLACEHOLDER - Future custom lists will show here]</Text>
          </View>
        </View>

        {/* Missed Words Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Practice Lists</Text>
          <Text style={styles.sectionSubtitle}>Generated from your practice sessions</Text>
          
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemIcon}>❌</Text>
              <View style={styles.listItemText}>
                <Text style={styles.listItemTitle}>Missed Words</Text>
                <Text style={styles.listItemSubtitle}>
                  {missedWords.length} words
                </Text>
              </View>
            </View>
            
            <View style={styles.listItemActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handlePlaceholderAction('Edit Missed Words')}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
                <Text style={styles.placeholderMini}>[PLACEHOLDER]</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handlePlaceholderAction('Clear Missed Words')}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Clear</Text>
                <Text style={styles.placeholderMini}>[PLACEHOLDER]</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Coming Soon Features:</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✏️</Text>
            <Text style={styles.featureText}>Edit word lists inline</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗑️</Text>
            <Text style={styles.featureText}>Delete entire lists</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureText}>Duplicate and rename lists</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔄</Text>
            <Text style={styles.featureText}>Merge multiple lists</Text>
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
    marginBottom: 32,
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
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    position: 'relative',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  placeholderMini: {
    position: 'absolute',
    top: -8,
    right: -2,
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  placeholderLabel: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
    textAlign: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
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

export default ManageListsScreen;