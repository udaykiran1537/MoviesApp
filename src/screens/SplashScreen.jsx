import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { checkStoredAuth } from '../redux/slices/authSlice';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(100)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dotsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(checkStoredAuth());
    };
    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    const dotsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animationSequence.start();
    dotsLoop.start();

    initializeAuth();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Bottom');
      } else {
        navigation.replace('login');
      }
    }, 3000);

    return () => {
      dotsLoop.stop();
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <View style={styles.backgroundPattern} />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoIcon}>
            <View style={styles.filmReel}>
              <View style={styles.filmHole} />
              <View style={[styles.filmHole, styles.filmHole2]} />
              <View style={[styles.filmHole, styles.filmHole3]} />
              <View style={[styles.filmHole, styles.filmHole4]} />
            </View>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [{ translateY: titleSlide }],
            },
          ]}
        >
          <Text style={styles.appTitle}>CINEFLIX</Text>
          <View style={styles.titleUnderline} />
        </Animated.View>

        <Animated.View
          style={[
            styles.subtitleContainer,
            { opacity: subtitleOpacity },
          ]}
        >
          <Text style={styles.subtitle}>Your Ultimate Movie Experience</Text>
          <Text style={styles.tagline}>Stream • Discover • Enjoy</Text>
        </Animated.View>
      </View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading</Text>
        <Animated.View style={styles.dotsContainer}>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dotsAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 1, 0.3, 0.3],
                }),
              },
            ]}
          >
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dotsAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 1, 0.3],
                }),
              },
            ]}
          >
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dotsAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 0.3, 1],
                }),
              },
            ]}
          >
            •
          </Animated.Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by CineFlix Studios</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0d1117',
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e50914',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  filmReel: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  filmHole: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0d1117',
    top: 10,
    left: 44,
  },
  filmHole2: {
    top: 44,
    left: 76,
  },
  filmHole3: {
    top: 76,
    left: 44,
  },
  filmHole4: {
    top: 44,
    left: 12,
  },
  playIcon: {
    fontSize: 35,
    color: '#fff',
    marginLeft: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 6,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 120,
    height: 4,
    backgroundColor: '#e50914',
    marginTop: 10,
    borderRadius: 2,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8b949e',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '300',
  },
  tagline: {
    fontSize: 14,
    color: '#6e7681',
    textAlign: 'center',
    letterSpacing: 2,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8b949e',
    fontSize: 16,
    marginBottom: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    fontSize: 20,
    color: '#e50914',
    marginHorizontal: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  footerText: {
    color: '#6e7681',
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default SplashScreen;
