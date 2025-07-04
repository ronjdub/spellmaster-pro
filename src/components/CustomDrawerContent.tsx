// src/components/CustomDrawerContent.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation, state } = props;

  const menuItems = [
    {
      name: 'Practice',
      label: 'Spelling Practice',
      icon: 'school-outline',
      description: 'Practice with word lists and speech recognition',
      color: '#6366f1',
    },
    {
      name: 'OCRUpload',
      label: 'Upload Words',
      icon: 'camera-outline',
      description: 'Take photos to extract words using OCR',
      color: '#059669',
    },
    {
      name: 'WordManagement',
      label: 'Manage Words',
      icon: 'list-outline',
      description: 'View and organize your word collections',
      color: '#7c3aed',
    },
  ];

  const activeRoute = state.routeNames[state.index];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧙‍♂️ SpellMaster PRO</Text>
        <Text style={styles.headerSubtitle}>Choose your learning path</Text>
      </View>
      
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.menuItem,
              activeRoute === item.name && styles.activeMenuItem,
              { borderLeftColor: item.color }
            ]}
            onPress={() => navigation.navigate(item.name)}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={activeRoute === item.name ? '#fff' : item.color}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.menuLabel,
                  activeRoute === item.name && styles.activeMenuLabel
                ]}>
                  {item.label}
                </Text>
                <Text style={[
                  styles.menuDescription,
                  activeRoute === item.name && styles.activeMenuDescription
                ]}>
                  {item.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.featureHighlight}>
          <Ionicons name="star-outline" size={20} color="#f59e0b" />
          <Text style={styles.featureText}>
            New: AI-powered word recognition!
          </Text>
        </View>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 2.0 - Phase 2</Text>
          <Text style={styles.copyrightText}>© 2025 SpellMaster PRO</Text>
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
  header: {
    padding: 24,
    backgroundColor: '#6366f1',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeMenuItem: {
    backgroundColor: '#6366f1',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activeMenuLabel: {
    color: '#fff',
  },
  menuDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  activeMenuDescription: {
    color: '#e0e7ff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  featureHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  copyrightText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

export default CustomDrawerContent;