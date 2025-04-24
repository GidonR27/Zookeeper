import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function GameScreen() {
  const router = useRouter();
  const { game } = useLocalSearchParams();
  
  useEffect(() => {
    console.log(`Game screen loaded: ${game}`);
  }, [game]);
  
  const handleBackPress = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {game === 'animalLabeling' ? 'Animal Labeling' : game}
        </Text>
      </View>
      
      <View style={styles.gameContainer}>
        <Text style={styles.gameTitle}>
          {game === 'animalLabeling' ? 'Animal Labeling Game' : 'Game'}
        </Text>
        <Text style={styles.gameInstructions}>
          This is a placeholder for the {game} game.
        </Text>
        
        <View style={styles.demoContainer}>
          <Text style={styles.animalWord}>ELEPHANT</Text>
          <View style={styles.letterSlots}>
            {Array(8).fill().map((_, i) => (
              <View key={i} style={styles.letterSlot}>
                <Text style={styles.letterText}>{i < 8 ? 'ELEPHANT'[i] : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
    textAlign: 'center',
  },
  gameInstructions: {
    fontSize: 18,
    marginBottom: 40,
    color: '#388E3C',
    textAlign: 'center',
  },
  demoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  animalWord: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF9800',
  },
  letterSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  letterSlot: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  letterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
}); 