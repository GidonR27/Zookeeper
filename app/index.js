import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    // Log when the component mounts to help with debugging
    console.log('Zoo Keeper app home screen mounted');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Zoo Keeper!</Text>
      <Text style={styles.subtitle}>Educational games for kids</Text>
      <Text style={styles.text}>The application is ready.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 24,
    color: '#388E3C',
  },
  text: {
    fontSize: 18,
    color: '#4CAF50',
  },
}); 