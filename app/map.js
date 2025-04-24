import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { DebugButton } from '../components/common/DebugButton';
import { useAppState } from '../components/common/AppStateContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { isRTL } from '../i18n';
import useAudioManager from '../components/common/AudioManager';
import MuteButton from '../components/common/MuteButton';
import InstructionsButton from '../components/common/InstructionsButton';
import { MMKV } from 'react-native-mmkv';

// Storage for app settings
const appStorage = new MMKV({ id: 'app-settings' });
// Storage for navigation tracking
const navStorage = new MMKV({ id: 'navigation-state' });

const { width, height } = Dimensions.get('window');

const GameButton = ({ 
  title, 
  emoji, 
  isLocked, 
  isCompleted, 
  onPress,
  style,
  position
}) => {
  const rtl = isRTL();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      style={[
        styles.gameButton,
        isLocked ? styles.lockedButton : (isCompleted ? styles.completedButton : {}),
        position,
        style
      ]}
    >
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: position.delay || 0 }}
        style={styles.buttonContent}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.buttonEmoji}>{emoji}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.buttonTitle, rtl && styles.rtlText]}>{title}</Text>
          <Text style={styles.buttonStatus}>
            {isCompleted ? '✅' : '▶️'}
          </Text>
        </View>
        
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </MotiView>
    </TouchableOpacity>
  );
};

// Welcome message component
const WelcomeMessage = ({ visible, onStart }) => {
  const rtl = isRTL();
  const { t } = useTranslation();
  
  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.welcomeOverlay}
        >
          <View style={styles.welcomeContentWrapper}>
            {/* Logo */}
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 400 }}
              style={styles.logoContainer}
            >
              <Image 
                source={require('../assets/images/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </MotiView>
            
            <MotiView 
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ type: 'timing', duration: 600, delay: 200 }}
              style={styles.welcomeContainer}
            >
              {/* Main welcome image */}
              <Image 
                source={require('../assets/images/grandwelcome.png')} 
                style={styles.welcomeImage}
                resizeMode="contain"
              />
              
              {/* Welcome text below image */}
              <View style={styles.welcomeTextContainer}>
                <Text style={[styles.welcomeTitle, rtl && styles.rtlText]}>{t('map.welcomeTitle')}</Text>
                <Text style={[styles.welcomeSubtitle, rtl && styles.rtlText]}>
                  {t('map.welcomeSubtitle')}
                </Text>
              </View>
              
              {/* Start button */}
              <MotiView
                from={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 800 }}
              >
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={onStart}
                  activeOpacity={0.7}
                >
                  {rtl ? (
                    <>
                      <Text style={styles.startButtonIcon}>◀️</Text>
                      <Text style={styles.startButtonText}>  {t('common.start')}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.startButtonText}>{t('common.start')} </Text>
                      <Text style={styles.startButtonIcon}>▶️</Text>
                    </>
                  )}
                </TouchableOpacity>
              </MotiView>
            </MotiView>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

export default function ZooMap() {
  const router = useRouter();
  const segments = useSegments(); // Get current route segments
  const { gameState } = useAppState();
  const { t } = useTranslation();
  const rtl = isRTL();
  const { isReady, playBackgroundMusic, playInstructions } = useAudioManager();
  
  // Check if user came from splash screen
  const [cameFromSplash, setCameFromSplash] = useState(false);
  
  // Check if welcome message has been shown before
  const hasShownWelcome = appStorage.getBoolean('hasShownWelcome') || false;
  
  // State to control welcome message visibility
  // Show welcome if user never saw it OR if they came directly from splash
  const [showWelcome, setShowWelcome] = useState(false); // Initialize as false, will set in useEffect
  // State to control map content visibility
  const [showMapContent, setShowMapContent] = useState(false); // Initialize as false, will set in useEffect
  // State to track instructions played for this session
  const [instructionsPlayed, setInstructionsPlayed] = useState(false);
  // Track if we're returning from a game
  const [returningFromGame, setReturningFromGame] = useState(false);

  // Check navigation source on mount
  useEffect(() => {
    // Get the last screen from storage
    const lastScreen = navStorage.getString('lastScreen') || '';
    const currentTime = Date.now();
    const lastNavigationTime = navStorage.getNumber('lastNavigationTime') || 0;
    
    // Check if we came from splash (index) within the last 2 seconds
    const cameDirectlyFromSplash = 
      lastScreen === 'index' && 
      (currentTime - lastNavigationTime < 2000);
      
    // Check if we're returning from a game
    const comingFromGame = lastScreen.startsWith('games/');
    
    console.log('Navigation source check:', { 
      lastScreen, 
      cameDirectlyFromSplash,
      comingFromGame,
      timeSinceNavigation: currentTime - lastNavigationTime
    });
    
    setCameFromSplash(cameDirectlyFromSplash);
    setReturningFromGame(comingFromGame);
    
    // If coming from splash, reset the instructions played state
    if (cameDirectlyFromSplash) {
      setInstructionsPlayed(false);
    }
    
    // Set welcome visibility based on whether user came from splash
    setShowWelcome(cameDirectlyFromSplash || !hasShownWelcome);
    
    // Set map content visibility - only show if not showing welcome
    setShowMapContent(!cameDirectlyFromSplash && hasShownWelcome);
    
    // Store current screen for next navigation
    navStorage.set('lastScreen', 'map');
    navStorage.set('lastNavigationTime', currentTime);
  }, []);

  // Handle start button press
  const handleStart = () => {
    setShowWelcome(false);
    
    // Save that welcome has been shown
    appStorage.set('hasShownWelcome', true);
    
    // After welcome message animates out, show map content and start music
    setTimeout(() => {
      setShowMapContent(true);
      // Start background music when welcome message is dismissed
      if (isReady) {
        playBackgroundMusic();
        // Always play instructions after welcome message is dismissed
        setTimeout(() => {
          playInstructions('map1heb', true); // Force playback
          setInstructionsPlayed(true);
        }, 500);
      }
    }, 500);
  };

  // Initialize audio and play background music if welcome was previously shown
  useEffect(() => {
    if (isReady && !showWelcome) {
      console.log('Map: Welcome not showing, playing background music directly');
      playBackgroundMusic();
      
      // Only play instructions if:
      // 1. First time in this session AND
      // 2. Came from splash (not from a game) AND
      // 3. Not returning from a game
      if (!instructionsPlayed && cameFromSplash && !returningFromGame) {
        console.log('Auto-playing instructions because coming from splash');
        setTimeout(() => {
          playInstructions('map1heb', true); // Force playback
          setInstructionsPlayed(true);
        }, 1000);
      }
    } else {
      console.log('Map: Audio is ready, but waiting for welcome message to be dismissed');
    }
  }, [isReady, showWelcome, cameFromSplash, returningFromGame]);

  // Determine which stops are locked/completed
  const gameStops = [
    {
      id: 'animalLabeling',
      title: t('games.animalLabeling.title'),
      emoji: '🪧',
      isCompleted: gameState.gameData.animalLabeling.completed,
      isLocked: false, // First game is always unlocked
      position: styles.position1, // Zoo entrance position
      delay: 300,
    },
    {
      id: 'puzzleBuilder',
      title: t('games.puzzleBuilder.title'),
      emoji: '🧩',
      isCompleted: gameState.gameData.puzzleBuilder.completed,
      isLocked: !gameState.gameData.animalLabeling.completed,
      position: styles.position2, // Rock formation position
      delay: 500,
    },
    {
      id: 'knowledgeCare',
      title: t('games.knowledgeCare.title'),
      emoji: '🦒',
      isCompleted: gameState.gameData.knowledgeCare.completed,
      isLocked: !gameState.gameData.puzzleBuilder.completed,
      position: styles.position3, // Elephant enclosure position
      delay: 700,
    },
  ];

  const handleGameSelect = (gameId) => {
    console.log(`Selected game: ${gameId}`);
    router.push(`/games/${gameId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../assets/images/zoo-map-background.png')} 
        style={styles.mapBackground}
        resizeMode="cover"
      >
        {/* Map header and content - only visible after welcome is dismissed */}
        {showMapContent && (
          <>
            <View style={styles.headerContainer}>
              <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 100 }}
                style={styles.mapTitleContainer}
              >
                <Text style={[styles.mapTitle, rtl && styles.rtlText]}>{t('map.title')}</Text>
                <Text style={[styles.mapSubtitle, rtl && styles.rtlText]}>{t('map.subtitle')}</Text>
              </MotiView>
            </View>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 2500 }}
              style={styles.overlay}
            >
              {gameStops.map((stop) => (
                <GameButton
                  key={stop.id}
                  title={stop.title}
                  emoji={stop.emoji}
                  isLocked={stop.isLocked}
                  isCompleted={stop.isCompleted}
                  position={stop.position}
                  onPress={() => handleGameSelect(stop.id)}
                  style={{ zIndex: 10 }}
                />
              ))}
            </MotiView>
          </>
        )}
        
        {/* Welcome message overlay */}
        <WelcomeMessage 
          visible={showWelcome} 
          onStart={handleStart} 
        />
      </ImageBackground>

      {/* Mute Button - always visible */}
      <MuteButton />
      
      {/* Instructions Button - visible only after welcome dismissed */}
      {showMapContent && <InstructionsButton instructionId="map1heb" />}

      {/* Language Switcher - only visible after welcome is dismissed */}
      {showMapContent && <LanguageSwitcher />}

      {/* Debug button - always visible */}
      <DebugButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  mapBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    position: 'relative',
  },
  gameButton: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF9F00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 5,
    borderColor: '#FFF',
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  emojiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#FF7043',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  buttonEmoji: {
    fontSize: 28,
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  lockedButton: {
    backgroundColor: '#9E9E9E',
    opacity: 0.8,
    borderColor: '#E0E0E0',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#FFEB3B',
  },
  // Position for game 1 (Zoo entrance sign)
  position1: {
    left: '8%', 
    top: '55%',
    delay: 300,
  },
  // Position for game 2 (Rock formation)
  position2: {
    left: '42%',
    top: '25%',
    delay: 500,
  },
  // Position for game 3 (Elephant enclosure)
  position3: {
    right: '15%',
    top: '40%',
    delay: 700,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
  },
  mapTitleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF9F00',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#795548',
  },
  lockOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  lockIcon: {
    fontSize: 40,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  rtlText: {
    textAlign: 'right',
  },
  
  // Welcome message styles
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 100,
  },
  welcomeContentWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  welcomeContainer: {
    width: 320, 
    backgroundColor: '#F0EAE0', // Light beige background
    borderRadius: 20,
    padding: 15,
    paddingTop: 25, // Reduced top padding to move content up
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  logoContainer: {
    position: 'absolute',
    top: -130, // Moved further up to position ZOOKEEPER text just below popup border
    zIndex: 102,
    width: 190, // 20% bigger logo
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 180, // 20% bigger
    height: 180,
  },
  welcomeImage: {
    width: '100%', // Full width of the popup
    height: 270, // Made a bit bigger
    marginTop: 5, // Reduced top margin to move up
    marginBottom: 10,
  },
  welcomeTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 19, // Slightly bigger
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14, // Slightly bigger
    textAlign: 'center',
    color: '#000',
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#F9CB40', // Golden start button
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    marginBottom: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  startButtonIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
}); 