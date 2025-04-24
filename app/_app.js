import 'expo-router/entry';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Root component that initializes the app
export default function App({ children }) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Zoo Keeper app initializing on web platform');
    }
  }, []);

  return children;
} 