// src/components/HamburgerMenu.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

interface HamburgerMenuProps {
  currentScreen?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ currentScreen }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons 
        name="menu" 
        size={24} 
        color="#fff" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
    padding: 4,
  },
});

export default HamburgerMenu;