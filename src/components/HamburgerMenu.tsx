// src/screens/SpellingScreen.tsx - Add this useLayoutEffect to the existing component
// Add this to your existing SpellingScreen.tsx file, right after the state declarations:

React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HamburgerMenu currentScreen="Spelling" />,
    });
  }, [navigation]);
  
  // Also add this import at the top of the file:
  // import HamburgerMenu from '../components/HamburgerMenu';