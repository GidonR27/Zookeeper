import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  useEffect(() => {
    console.log('Initial app screen loaded, redirecting to map...');
  }, []);

  // Redirect to the map screen automatically
  return <Redirect href="/map" />;
} 