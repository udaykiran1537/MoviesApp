import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  toggleMode, 
  updateFormData, 
  authFailure, 
  clearError,
  authStart,
  authSuccess,
  clearFormData,
  storeAuthData
} from "../redux/slices/authSlice";

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

GoogleSignin.configure({
  webClientId: '113544695495-p7f1d9h1ri9utpg5s0bec5i48n8hnvg0.apps.googleusercontent.com',
});

const LoginScreen = () => {

  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { isDarkMode } = useSelector((state) => state.theme);

  const dispatch = useDispatch();
  const { 
    isSignUp, 
    formData,
    user,
    isLoading,
    error,
    isAuthenticated
  } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = React.useState(false);

  const handleInputChange = (field, value) => {
    dispatch(updateFormData({ field, value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      dispatch(authFailure("Please fill in all required fields"));
      return false;
    }

    if (isSignUp) {
      if (!formData.username) {
        dispatch(authFailure("Please enter a username"));
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        dispatch(authFailure("Passwords do not match"));
        return false;
      }
      if (formData.password.length < 6) {
        dispatch(authFailure("Password must be at least 6 characters"));
        return false;
      }
    }
    return true;
  };

  async function onGoogleButtonPress() {
    try {
      dispatch(authStart());
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const result = await auth().signInWithCredential(googleCredential);

      dispatch(storeAuthData({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      }));

      dispatch(clearFormData());
    } catch (error) {
      dispatch(authFailure(error.message));
    }
  }

  const signUpTestFn = async () => {
    if (!validateForm()) return;
    try {
      dispatch(authStart());
      const result = await auth().createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );

      dispatch(storeAuthData({
        uid: result.user.uid,
        email: result.user.email,
        displayName: formData.username,
      }));

      dispatch(clearFormData());
      Alert.alert("Success", "Account created successfully!");
    } catch (error) {
      dispatch(authFailure(error.message));
    }
  };

  const loginTestFn = async () => {
    if (!validateForm()) return;
    try {
      dispatch(authStart());
      const result = await auth().signInWithEmailAndPassword(
        formData.email,
        formData.password
      );

      dispatch(storeAuthData({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }));

      dispatch(clearFormData());
    } catch (error) {
      dispatch(authFailure(error.message));
    }
  };

  const handleAuthAction = () => {
    isSignUp ? signUpTestFn() : loginTestFn();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(true);
    setTimeout(() => setShowPassword(false), 5000);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: () => dispatch(clearError()) }]);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("Bottom");
    }
  }, [isAuthenticated]);

  return (
    <ScrollView
      style={isDarkMode ? styles.container : styles.lightcontainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#0d1117" : "#fbfcfe"}
      />

      {/* HEADER */}
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={isDarkMode ? styles.logoText : styles.lightlogoText}>CINEFLIX</Text>

        <Text style={isDarkMode ? styles.welcomeText : styles.lightwelcomeText}>
          {isSignUp ? 'Join CineFlix!' : 'Welcome Back!'}
        </Text>

        <Text style={isDarkMode ? styles.subtitleText : styles.lightsubtitleText}>
          {isSignUp
            ? 'Create your account to start watching'
            : 'Sign in to continue your movie journey'}
        </Text>
      </Animated.View>

      {/* FORM */}
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={isDarkMode ? styles.inputLabel : styles.lightinputLabel}>Username</Text>
            <TextInput
              style={isDarkMode ? styles.textInput : styles.lighttextInput}
              value={formData.username}
              onChangeText={(v) => handleInputChange('username', v)}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={isDarkMode ? styles.inputLabel : styles.lightinputLabel}>Email</Text>
          <TextInput
            style={isDarkMode ? styles.textInput : styles.lighttextInput}
            value={formData.email}
            onChangeText={(v) => handleInputChange('email', v)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={isDarkMode ? styles.inputLabel : styles.lightinputLabel}>Password</Text>
          <TextInput
            style={isDarkMode ? styles.textInput : styles.lighttextInput}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(v) => handleInputChange('password', v)}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.colour}>show password</Text>
          </TouchableOpacity>
        </View>

        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={isDarkMode ? styles.inputLabel : styles.lightinputLabel}>Confirm Password</Text>
            <TextInput
              style={isDarkMode ? styles.textInput : styles.lighttextInput}
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(v) => handleInputChange('confirmPassword', v)}
            />
          </View>
        )}

        <TouchableOpacity style={styles.loginButton} onPress={handleAuthAction}>
          <Text style={styles.loginButtonText}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {!isSignUp && (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={onGoogleButtonPress}
            >
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => dispatch(toggleMode())}>
            <Text style={styles.signupLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 CineFlix Studios</Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  lightcontainer: { flex: 1, backgroundColor: '#fbfcfe' },

  headerContainer: { paddingTop: 60, alignItems: 'center', marginBottom: 40 },

  logoText: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  lightlogoText: { fontSize: 28, fontWeight: 'bold', color: '#050505' },

  welcomeText: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  lightwelcomeText: { fontSize: 32, fontWeight: 'bold', color: '#050505' },

  subtitleText: { fontSize: 16, color: '#8b949e', textAlign: 'center' },
  lightsubtitleText: { fontSize: 16, color: '#555', textAlign: 'center' },

  formContainer: { paddingHorizontal: 20 },

  inputContainer: { marginBottom: 20 },

  inputLabel: { color: '#ffffff', marginBottom: 8 },
  lightinputLabel: { color: '#050505', marginBottom: 8 },

  textInput: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
  },
  lighttextInput: {
    backgroundColor: '#e1e4e8',
    borderRadius: 12,
    padding: 16,
    color: '#050505',
  },

  colour: { color: '#e50914', marginTop: 8 },

  loginButton: {
    backgroundColor: '#e50914',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#30363d' },
  dividerText: { marginHorizontal: 10, color: '#8b949e' },

  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  googleButton: { backgroundColor: '#21262d', borderColor: '#30363d' },
  socialIcon: { color: '#fff', fontSize: 18, marginRight: 10 },
  socialButtonText: { color: '#fff', fontSize: 16 },

  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupText: { color: '#8b949e' },
  signupLink: { color: '#e50914', fontWeight: 'bold' },

  footer: { alignItems: 'center', marginVertical: 30 },
  footerText: { color: '#8b949e', fontSize: 12 },
});
