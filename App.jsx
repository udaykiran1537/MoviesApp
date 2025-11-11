import React, { useEffect } from 'react';

import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';

import StackNavigator from "./src/navigation/StackNavigator"
import { NavigationContainer } from '@react-navigation/native';
import {store} from './src/redux/Store'
import { Provider, useDispatch } from 'react-redux';
import { loadWishlistFromStorage } from './src/redux/slices/wishlistSlice';
import { StatusBar } from 'react-native';


const AppInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadWishlistFromStorage());
  }, [dispatch]);

  return (
    <SafeAreaProvider>
      <StatusBar hidden={true}/>
        <NavigationContainer>
          <StackNavigator/>
        </NavigationContainer>
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
