import * as Speech from 'expo-speech';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

export const speakWord = async (word: string): Promise<void> => {
  return new Promise((resolve) => {
    Speech.speak(`Your word is: ${word}`, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
};

export const startListening = (): Promise<void> => {
  return Voice.start('en-US');
};

export const stopListening = (): Promise<void> => {
  return Voice.stop();
};

export const destroyVoice = (): Promise<void> => {
  return Voice.destroy();
};

export const normalizeSpelling = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const isSpellingCorrect = (heard: string, expected: string): boolean => {
  const normalizedHeard = normalizeSpelling(heard);
  const normalizedExpected = expected.toLowerCase();
  
  // Check if it's the whole word
  if (normalizedHeard === normalizedExpected) {
    return true;
  }
  
  // Check if it's spelled out (e.g., "a p p l e")
  const spelledOut = normalizedExpected.split('').join(' ');
  if (normalizedHeard === spelledOut) {
    return true;
  }
  
  // Check if it's spelled out without spaces
  const spelledOutNoSpaces = normalizedExpected.split('').join('');
  if (normalizedHeard.replace(/\s/g, '') === spelledOutNoSpaces) {
    return true;
  }
  
  return false;
};