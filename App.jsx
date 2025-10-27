import React, { useEffect } from 'react';

import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';

import StackNavigator from "./src/navigation/StackNavigator"
import { NavigationContainer } from '@react-navigation/native';
import {store} from './src/redux/Store'
import { Provider, useDispatch } from 'react-redux';
import { loadWishlistFromStorage } from './src/redux/slices/wishlistSlice';


const AppInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadWishlistFromStorage());
  }, [dispatch]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <StackNavigator/>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppInitializer />
    </Provider>
  );
}

export default App;
