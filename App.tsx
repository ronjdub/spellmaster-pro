// Enhanced App.tsx with Drawer Navigation and Phase 2 Features
// 🎯 THIS REPLACES YOUR CURRENT App.tsx COMPLETELY
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import SpellingScreen from './src/screens/SpellingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import CameraScreen from './src/screens/CameraScreen';
import OCRProcessingScreen from './src/screens/OCRProcessingScreen';
import WordManagementScreen from './src/screens/WordManagementScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';

export type RootStackParamList = {
  Home: undefined;
  Spelling: { words: string[]; listName: string };
  Results: { 
    totalWords: number; 
    correctWords: number; 
    missedWords: string[];
    listName: string;
  };
  Camera: undefined;
  OCRProcessing: { imageUri: string };
  WordManagement: undefined;
};

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Stack Navigator for practice flow
const PracticeStack = () => (
  <Stack.Navigator
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
  </Stack.Navigator>
);

// Stack Navigator for OCR flow
const OCRStack = () => (
  <Stack.Navigator
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
    <Stack.Screen 
      name="Camera" 
      component={CameraScreen}
      options={{ title: 'Take Photo' }}
    />
    <Stack.Screen 
      name="OCRProcessing" 
      component={OCRProcessingScreen}
      options={{ title: 'Process Text' }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Drawer.Navigator
        initialRouteName="Practice"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          drawerActiveTintColor: '#6366f1',
          drawerInactiveTintColor: '#6b7280',
          drawerStyle: {
            backgroundColor: '#f8fafc',
            width: 280,
          },
        }}
      >
        <Drawer.Screen 
          name="Practice" 
          component={PracticeStack}
          options={{
            title: 'Spelling Practice',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="school-outline" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Drawer.Screen 
          name="OCRUpload" 
          component={OCRStack}
          options={{
            title: 'Upload Words',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="camera-outline" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Drawer.Screen 
          name="WordManagement" 
          component={WordManagementScreen}
          options={{
            title: 'Manage Words',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
            headerStyle: {
              backgroundColor: '#7c3aed',
            },
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}