// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import SpellingScreen from './src/screens/SpellingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AddWordsScreen from './src/screens/AddWordsScreen';
import ManageListsScreen from './src/screens/ManageListsScreen';

export type RootStackParamList = {
  Home: undefined;
  Spelling: { words: string[]; listName: string };
  Results: { 
    totalWords: number; 
    correctWords: number; 
    missedWords: string[];
    listName: string;
  };
  AddWords: undefined;
  ManageLists: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'SpellMaster PRO' }}
        />
        <Stack.Screen 
          name="Spelling" 
          component={SpellingScreen}
          options={{ title: 'Practice Spelling' }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'Session Results' }}
        />
        <Stack.Screen 
          name="AddWords" 
          component={AddWordsScreen}
          options={{ title: 'Add Words' }}
        />
        <Stack.Screen 
          name="ManageLists" 
          component={ManageListsScreen}
          options={{ title: 'Manage Lists' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}