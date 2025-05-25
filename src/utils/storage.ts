import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  MISSED_WORDS: 'missedWords',
  LAST_SELECTED_LIST: 'lastSelectedList',
  PAST_RESULTS: 'pastResults',
};

export const storeMissedWords = async (words: string[]): Promise<void> => {
  try {
    const existingWords = await getMissedWords();
    const uniqueWords = [...new Set([...existingWords, ...words])];
    await AsyncStorage.setItem(STORAGE_KEYS.MISSED_WORDS, JSON.stringify(uniqueWords));
  } catch (error) {
    console.error('Error storing missed words:', error);
  }
};

export const getMissedWords = async (): Promise<string[]> => {
  try {
    const words = await AsyncStorage.getItem(STORAGE_KEYS.MISSED_WORDS);
    return words ? JSON.parse(words) : [];
  } catch (error) {
    console.error('Error getting missed words:', error);
    return [];
  }
};

export const clearMissedWords = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MISSED_WORDS);
  } catch (error) {
    console.error('Error clearing missed words:', error);
  }
};

export const storeLastSelectedList = async (listKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SELECTED_LIST, listKey);
  } catch (error) {
    console.error('Error storing last selected list:', error);
  }
};

export const getLastSelectedList = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SELECTED_LIST);
  } catch (error) {
    console.error('Error getting last selected list:', error);
    return null;
  }
};