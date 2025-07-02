// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import SpellingScreen from './src/screens/SpellingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import CameraScreen from './src/screens/CameraScreen';
import OCRProcessingScreen from './src/screens/OCRProcessingScreen';
import WordManagementScreen from './src/screens/WordManagementScreen';

// Import components
import CustomDrawerContent from './src/components/CustomDrawerContent';

// Navigation Types
export type PracticeStackParamList = {
  Home: undefined;
  Spelling: { words: string[]; listName: string };
  Results: { 
    totalWords: number; 
    correctWords: number; 
    missedWords: string[];
    listName: string;
  };
};

export type OCRStackParamList = {
  Camera: undefined;
  OCRProcessing: { imageUri: string };
};

export type WordManagementStackParamList = {
  WordManagement: undefined;
};

export type RootDrawerParamList = {
  Practice: undefined;
  OCRUpload: undefined;
  WordManagement: undefined;
};

// Legacy type for backward compatibility
export type RootStackParamList = PracticeStackParamList;

const PracticeStack = createNativeStackNavigator<PracticeStackParamList>();
const OCRStack = createNativeStackNavigator<OCRStackParamList>();
const WordManagementStackNav = createNativeStackNavigator<WordManagementStackParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

// Practice Stack Navigator (contains the original spelling practice flow)
const PracticeStackScreen = () => {
  return (
    <PracticeStack.Navigator 
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
      <PracticeStack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'SpellMaster PRO' }}
      />
      <PracticeStack.Screen 
        name="Spelling" 
        component={SpellingScreen}
        options={{ title: 'Practice Spelling' }}
      />
      <PracticeStack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{ title: 'Session Results' }}
      />
    </PracticeStack.Navigator>
  );
};

// OCR Upload Stack Navigator (contains camera and OCR processing flow)
const OCRStackScreen = () => {
  return (
    <OCRStack.Navigator 
      initialRouteName="Camera"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#059669',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <OCRStack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ title: 'Capture Words' }}
      />
      <OCRStack.Screen 
        name="OCRProcessing" 
        component={OCRProcessingScreen}
        options={{ title: 'Extract Words' }}
      />
    </OCRStack.Navigator>
  );
};

// Word Management Stack Navigator
const WordManagementStackScreen = () => {
  return (
    <WordManagementStackNav.Navigator 
      initialRouteName="WordManagement"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#7c3aed',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <WordManagementStackNav.Screen 
        name="WordManagement" 
        component={WordManagementScreen}
        options={{ title: 'Manage Word Lists' }}
      />
    </WordManagementStackNav.Navigator>
  );
};

// Main App with Drawer Navigation
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Drawer.Navigator 
        initialRouteName="Practice"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false, // We handle headers in stack navigators
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          drawerStyle: {
            width: '85%',
          },
        }}
      >
        <Drawer.Screen 
          name="Practice" 
          component={PracticeStackScreen}
          options={{ 
            title: 'Spelling Practice',
          }}
        />
        <Drawer.Screen 
          name="OCRUpload" 
          component={OCRStackScreen}
          options={{ 
            title: 'Upload Words',
          }}
        />
        <Drawer.Screen 
          name="WordManagement" 
          component={WordManagementStackScreen}
          options={{ 
            title: 'Manage Words',
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}