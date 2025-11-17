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
} from "../redux/slices/authSlice"
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

GoogleSignin.configure({
  webClientId: '113544695495-p7f1d9h1ri9utpg5s0bec5i48n8hnvg0.apps.googleusercontent.com',
});

const LoginScreen = () => {

  const navigation = useNavigation()
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;


  const dispatch = useDispatch();
  const { 
    isSignUp, 
    formData,
    user,
    isLoading,
    error,
    isAuthenticated
  } = useSelector((state) => state.auth)

  const handleInputChange = (field, value) => {
    dispatch(updateFormData({ field, value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      dispatch(authFailure('Please fill in all required fields'));
      return false;
    }
    if (isSignUp) {
      if (!formData.username) {
        dispatch(authFailure('Please enter a username'));
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        dispatch(authFailure('Passwords do not match'));
        return false;
      }

      if (formData.password.length < 6) {
        dispatch(authFailure('Password must be at least 6 characters'));
        return false;
      }
    }
    return true;
  };

  const handleAuthAction = () => {

    if (isSignUp) {
      signUpTestFn();
    } else {
      loginTestFn();
    }
  };

  async function onGoogleButtonPress() {
    try {
      dispatch(authStart());
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      let idToken = signInResult.data?.idToken;  // 👈 ADD 'let'
      if (!idToken) {
        idToken = signInResult.idToken;
      }
      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = GoogleAuthProvider.credential(signInResult.data.idToken);
      const result = await signInWithCredential(getAuth(), googleCredential);
      
      dispatch(storeAuthData({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }));
      
      dispatch(clearFormData());
      

      
    } catch (error) {
      console.log('Google Sign-in error:', error);
      dispatch(authFailure(error.message || 'Google sign-in failed'));
    }
  }

 
  const signUpTestFn = async () => {
    if (!validateForm()) return;
    
    try {
      dispatch(authStart());
      
      const result = await createUserWithEmailAndPassword(getAuth(), formData.email, formData.password);
      
      dispatch(storeAuthData({
        uid: result.user.uid,
        email: result.user.email,
        displayName: formData.username,
      }));

       
      dispatch(clearFormData());
      Alert.alert('Success', 'Account created successfully!');
      
      
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak!';
      }

      dispatch(authFailure(errorMessage));
      Alert.alert('Sign Up Error', errorMessage);
    }
  }

  
  const loginTestFn = async () => {
    if (!validateForm()) return;
    
    try {
      dispatch(authStart());
      
      const result = await signInWithEmailAndPassword(getAuth(), formData.email, formData.password);
      dispatch(storeAuthData({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }));

       
      dispatch(clearFormData());
      

      

      
      
    } catch (error) {
      let errorMessage = 'An error occurred';
      console.log(error)
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address!';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Wrong password provided!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'User account has been disabled!';
      }

      dispatch(authFailure(errorMessage));
      Alert.alert('Sign In Error', errorMessage);
    }
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error]);

  
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Bottom');
    }
  }, [isAuthenticated, navigation]);

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <View style={styles.filmReel}>
              <View style={styles.filmHole} />
              <View style={[styles.filmHole, styles.filmHole2]} />
              <View style={[styles.filmHole, styles.filmHole3]} />
              <View style={[styles.filmHole, styles.filmHole4]} />
            </View>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <Text style={styles.logoText}>CINEFLIX</Text>
        </View>

        <Text style={styles.welcomeText}>
          {isSignUp ? 'Join CineFlix!' : 'Welcome Back!'}
        </Text>
        <Text style={styles.subtitleText}>
          {isSignUp ? 'Create your account to start watching' : 'Sign in to continue your movie journey'}
        </Text>
      </Animated.View>

     
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        
        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your username"
              placeholderTextColor="#6e7681"
              autoCapitalize="none"
              value={formData.username}  // 👈 ADD VALUE
              onChangeText={(value) => handleInputChange('username', value)}
            />
          </View>
        )}

       
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor="#6e7681"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}  
            onChangeText={(value) => handleInputChange('email', value)}
          />
        </View>

        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor="#6e7681"
            secureTextEntry={true}
            value={formData.password}  
            onChangeText={(value) => handleInputChange('password', value)}
          />
        </View>

        
        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm your password"
              placeholderTextColor="#6e7681"
              secureTextEntry={true}
              value={formData.confirmPassword}  // 👈 ADD VALUE
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
            />
          </View>
        )}

        
        {!isSignUp && (
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

       
        <TouchableOpacity 
          style={[
            styles.loginButton,
            isLoading && { backgroundColor: '#8b949e' }
          ]} 
          onPress={handleAuthAction}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        {!isSignUp && (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={onGoogleButtonPress}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

         
          </>
        )}

        
        <>
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
        </>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 CineFlix Studios</Text>
      </View>
    </ScrollView>
    </>
  );
};



export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e50914',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 15,
  },
  filmReel: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  filmHole: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0d1117',
    top: 6,
    left: 26,
  },
  filmHole2: {
    top: 26,
    left: 44,
  },
  filmHole3: {
    top: 44,
    left: 26,
  },
  filmHole4: {
    top: 26,
    left: 8,
  },
  playIcon: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 3,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#8b949e',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#e50914',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#e50914',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#30363d',
  },
  dividerText: {
    color: '#6e7681',
    fontSize: 14,
    marginHorizontal: 20,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#21262d',
    borderColor: '#30363d',
  },
  facebookButton: {
    backgroundColor: '#21262d',
    borderColor: '#30363d',
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
    color: '#fff',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#8b949e',
    fontSize: 16,
  },
  signupLink: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
    marginTop: 20,
  },
  footerText: {
    color: '#6e7681',
    fontSize: 12,
    letterSpacing: 1,
  },
});


