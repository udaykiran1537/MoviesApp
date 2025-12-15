import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import BottomTabNavigator from "../navigation/BottomTabNavigator";
import MovieDetail from '../screens/MovieDetail';
import SeriesDetail from '../screens/SeriesDetail';
import { useSelector } from 'react-redux';
import Chatbot from '../screens/Chatbot';

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="Bottom" component={BottomTabNavigator} />
      <Stack.Screen name="MovieDetail" component={MovieDetail} />
      <Stack.Screen name="SeriesDetail" component={SeriesDetail} />
      <Stack.Screen name="Chatbot" component={Chatbot} />
    </Stack.Navigator>
  );
};

export default StackNavigator;