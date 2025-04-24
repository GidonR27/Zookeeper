import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function Layout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Log that the app is running for debugging
      console.log('Zoo Keeper app is running on the web!');
    }
  }, []);

  return <Stack />;
}
