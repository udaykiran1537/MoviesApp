import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadWishlistFromStorage, saveWishlistToStorage } from './wishlistSlice';

const initialState = {
  isSignUp: false,
  formData: { username: '', email: '', password: '', confirmPassword: '' },
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated:false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    toggleMode: (state) => { state.isSignUp = !state.isSignUp; },
    updateFormData: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    clearFormData: (state) => {
      state.formData = { username: '', email: '', password: '', confirmPassword: '' };
    },
    authStart: (state) => { state.isLoading = true; },
    authSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    authFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  toggleMode,
  updateFormData,
  clearFormData,
  authStart,
  authSuccess,
  authFailure,
  logout,
} = authSlice.actions;

export const storeAuthData = (user) => async (dispatch) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('isAuthenticated', 'true');
    dispatch(authSuccess(user));
  } catch (error) {
  }
};

export const checkStoredAuth = () => async (dispatch) => {
  try {
      
    const storedUser = await AsyncStorage.getItem('user');
    const storedAuth = await AsyncStorage.getItem('isAuthenticated');

    if (storedUser && storedAuth === 'true') {
      const user = JSON.parse(storedUser);
      dispatch(authSuccess(user));
    } else {
      
    }
  } catch (error) {
    
  }
};

export const clearStoredAuth = () => async (dispatch, getState) => {
   dispatch(logout());
  try {
    const { auth } = getState();
    if (auth.user?.uid) {
      await dispatch(saveWishlistToStorage(auth.user.uid));
    }
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('isAuthenticated');
   
  } catch (error) {
  }
};

export default authSlice.reducer;
