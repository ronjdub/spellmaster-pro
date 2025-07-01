// src/components/HamburgerMenu.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HamburgerMenuProps {
  currentScreen?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ currentScreen }) => {
  const navigation = useNavigation<NavigationProp>();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const menuItems = [
    { 
      title: 'Add Words', 
      icon: '📷', 
      screen: 'AddWords' as keyof RootStackParamList,
      subtitle: 'Take photo of word lists'
    },
    { 
      title: 'Manage Lists', 
      icon: '📝', 
      screen: 'ManageLists' as keyof RootStackParamList,
      subtitle: 'Edit and delete word lists'
    },
    { 
      title: 'Home', 
      icon: '🏠', 
      screen: 'Home' as keyof RootStackParamList,
      subtitle: 'Back to practice selection'
    },
  ];

  const handleMenuItemPress = (screen: keyof RootStackParamList) => {
    setIsMenuVisible(false);
    
    // Small delay to let menu close animation complete
    setTimeout(() => {
      if (screen === 'Home') {
        navigation.navigate(screen);
      } else if (screen === 'AddWords') {
        navigation.navigate(screen);
      } else if (screen === 'ManageLists') {
        navigation.navigate(screen);
      }
    }, 150);
  };

  return (
    <>
      {/* Hamburger Button */}
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setIsMenuVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.menuContainer}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsMenuVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    currentScreen === item.screen && styles.currentMenuItem
                  ]}
                  onPress={() => handleMenuItemPress(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <View style={styles.menuItemText}>
                      <Text style={[
                        styles.menuItemTitle,
                        currentScreen === item.screen && styles.currentMenuItemTitle
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={styles.menuItemSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {currentScreen === item.screen && (
                    <View style={styles.currentIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.menuFooter}>
              <Text style={styles.appVersion}>SpellMaster PRO v1.0</Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    width: 30,
    height: 24,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  hamburgerLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  currentMenuItem: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  currentMenuItemTitle: {
    color: '#6366f1',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  menuFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

export default HamburgerMenu;