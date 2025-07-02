// src/utils/storage.ts - Enhanced with Custom Word Lists
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MISSED_WORDS: 'spellmaster_missed_words',
  LAST_SELECTED_LIST: 'spellmaster_last_selected_list',
  CUSTOM_WORD_LISTS: 'spellmaster_custom_word_lists',
  USER_STATS: 'spellmaster_user_stats',
  SETTINGS: 'spellmaster_settings',
};

export interface CustomWordList {
  name: string;
  words: string[];
  createdAt: number;
  lastUsed?: number;
  timesUsed?: number;
}

export interface UserStats {
  totalWordsStudied: number;
  totalSessions: number;
  averageAccuracy: number;
  streakDays: number;
  lastStudyDate: string;
}

export interface AppSettings {
  speechRate: number;
  autoRepeat: boolean;
  showWordHints: boolean;
  theme: 'light' | 'dark';
}

// Missed Words Functions
export const getMissedWords = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.MISSED_WORDS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting missed words:', error);
    return [];
  }
};

export const storeMissedWords = async (words: string[]): Promise<void> => {
  try {
    const existingWords = await getMissedWords();
    const uniqueWords = Array.from(new Set([...existingWords, ...words]));
    const jsonValue = JSON.stringify(uniqueWords);
    await AsyncStorage.setItem(KEYS.MISSED_WORDS, jsonValue);
  } catch (error) {
    console.error('Error storing missed words:', error);
  }
};

export const clearMissedWords = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.MISSED_WORDS);
  } catch (error) {
    console.error('Error clearing missed words:', error);
  }
};

// Last Selected List Functions
export const getLastSelectedList = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(KEYS.LAST_SELECTED_LIST);
  } catch (error) {
    console.error('Error getting last selected list:', error);
    return null;
  }
};

export const storeLastSelectedList = async (listId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_SELECTED_LIST, listId);
  } catch (error) {
    console.error('Error storing last selected list:', error);
  }
};

// Custom Word Lists Functions
export const getCustomWordLists = async (): Promise<CustomWordList[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.CUSTOM_WORD_LISTS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting custom word lists:', error);
    return [];
  }
};

export const storeCustomWordList = async (name: string, words: string[]): Promise<void> => {
  try {
    const existingLists = await getCustomWordLists();
    const existingIndex = existingLists.findIndex(list => list.name === name);
    
    const newList: CustomWordList = {
      name,
      words: words.map(word => word.toLowerCase().trim()),
      createdAt: existingIndex >= 0 ? existingLists[existingIndex].createdAt : Date.now(),
      lastUsed: Date.now(),
      timesUsed: existingIndex >= 0 ? (existingLists[existingIndex].timesUsed || 0) : 0,
    };

    if (existingIndex >= 0) {
      existingLists[existingIndex] = newList;
    } else {
      existingLists.push(newList);
    }

    // Sort by last used, then by creation date
    existingLists.sort((a, b) => {
      const aLastUsed = a.lastUsed || a.createdAt;
      const bLastUsed = b.lastUsed || b.createdAt;
      return bLastUsed - aLastUsed;
    });

    const jsonValue = JSON.stringify(existingLists);
    await AsyncStorage.setItem(KEYS.CUSTOM_WORD_LISTS, jsonValue);
  } catch (error) {
    console.error('Error storing custom word list:', error);
    throw error;
  }
};

export const deleteCustomWordList = async (name: string): Promise<void> => {
  try {
    const existingLists = await getCustomWordLists();
    const filteredLists = existingLists.filter(list => list.name !== name);
    const jsonValue = JSON.stringify(filteredLists);
    await AsyncStorage.setItem(KEYS.CUSTOM_WORD_LISTS, jsonValue);
  } catch (error) {
    console.error('Error deleting custom word list:', error);
    throw error;
  }
};

export const updateWordListUsage = async (name: string): Promise<void> => {
  try {
    const existingLists = await getCustomWordLists();
    const listIndex = existingLists.findIndex(list => list.name === name);
    
    if (listIndex >= 0) {
      existingLists[listIndex].lastUsed = Date.now();
      existingLists[listIndex].timesUsed = (existingLists[listIndex].timesUsed || 0) + 1;
      
      const jsonValue = JSON.stringify(existingLists);
      await AsyncStorage.setItem(KEYS.CUSTOM_WORD_LISTS, jsonValue);
    }
  } catch (error) {
    console.error('Error updating word list usage:', error);
  }
};

// User Stats Functions
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.USER_STATS);
    return jsonValue != null ? JSON.parse(jsonValue) : {
      totalWordsStudied: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      streakDays: 0,
      lastStudyDate: '',
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalWordsStudied: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      streakDays: 0,
      lastStudyDate: '',
    };
  }
};

export const updateUserStats = async (
  wordsStudied: number,
  accuracy: number
): Promise<void> => {
  try {
    const currentStats = await getUserStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate new averages
    const newTotalSessions = currentStats.totalSessions + 1;
    const newTotalWords = currentStats.totalWordsStudied + wordsStudied;
    const newAverageAccuracy = 
      (currentStats.averageAccuracy * currentStats.totalSessions + accuracy) / newTotalSessions;
    
    // Calculate streak
    let newStreak = currentStats.streakDays;
    if (currentStats.lastStudyDate) {
      const lastDate = new Date(currentStats.lastStudyDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const updatedStats: UserStats = {
      totalWordsStudied: newTotalWords,
      totalSessions: newTotalSessions,
      averageAccuracy: Math.round(newAverageAccuracy),
      streakDays: newStreak,
      lastStudyDate: today,
    };

    const jsonValue = JSON.stringify(updatedStats);
    await AsyncStorage.setItem(KEYS.USER_STATS, jsonValue);
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// Settings Functions
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.SETTINGS);
    return jsonValue != null ? JSON.parse(jsonValue) : {
      speechRate: 0.8,
      autoRepeat: true,
      showWordHints: true,
      theme: 'light',
    };
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {
      speechRate: 0.8,
      autoRepeat: true,
      showWordHints: true,
      theme: 'light',
    };
  }
};

export const updateAppSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    const jsonValue = JSON.stringify(updatedSettings);
    await AsyncStorage.setItem(KEYS.SETTINGS, jsonValue);
  } catch (error) {
    console.error('Error updating app settings:', error);
  }
};

// Data Management Functions
export const exportUserData = async (): Promise<string> => {
  try {
    const [customLists, missedWords, stats, settings] = await Promise.all([
      getCustomWordLists(),
      getMissedWords(),
      getUserStats(),
      getAppSettings(),
    ]);

    const exportData = {
      customWordLists: customLists,
      missedWords,
      userStats: stats,
      appSettings: settings,
      exportDate: new Date().toISOString(),
      version: '2.0',
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

export const importUserData = async (jsonData: string): Promise<void> => {
  try {
    const importData = JSON.parse(jsonData);
    
    // Validate data structure
    if (!importData.version || !importData.exportDate) {
      throw new Error('Invalid export data format');
    }

    // Import custom word lists
    if (importData.customWordLists && Array.isArray(importData.customWordLists)) {
      const jsonValue = JSON.stringify(importData.customWordLists);
      await AsyncStorage.setItem(KEYS.CUSTOM_WORD_LISTS, jsonValue);
    }

    // Import missed words
    if (importData.missedWords && Array.isArray(importData.missedWords)) {
      const jsonValue = JSON.stringify(importData.missedWords);
      await AsyncStorage.setItem(KEYS.MISSED_WORDS, jsonValue);
    }

    // Import user stats
    if (importData.userStats) {
      const jsonValue = JSON.stringify(importData.userStats);
      await AsyncStorage.setItem(KEYS.USER_STATS, jsonValue);
    }

    // Import app settings
    if (importData.appSettings) {
      const jsonValue = JSON.stringify(importData.appSettings);
      await AsyncStorage.setItem(KEYS.SETTINGS, jsonValue);
    }
  } catch (error) {
    console.error('Error importing user data:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.CUSTOM_WORD_LISTS),
      AsyncStorage.removeItem(KEYS.MISSED_WORDS),
      AsyncStorage.removeItem(KEYS.USER_STATS),
      AsyncStorage.removeItem(KEYS.LAST_SELECTED_LIST),
      // Don't clear settings as user may want to keep their preferences
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};