import React, { use } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Home from "../screens/HomeScreen"
import SeriesScreen from '../screens/SeriesScreen';
import SearchScreen from '../screens/SearchScreen';
import WishList from '../screens/WishList';
import Settings from '../screens/Settings';
import { useSelector } from 'react-redux';


const BottomTab = createBottomTabNavigator()

const BottomTabNavigator = () => {
  const { isDarkMode } = useSelector((state) => state.theme);
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Series') {
            iconName = focused ? 'tv' : 'tv-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'wishlist') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e50914',
        tabBarInactiveTintColor: isDarkMode ? '#fafbfdff' : '#0d1117ff',
        tabBarStyle:isDarkMode ? {
          backgroundColor: '#050505ff',
          borderTopWidth: 1,
          borderTopColor: '#fe0707ff',
          height: 60,
          paddingBottom: 20,
          paddingTop: 2,
        }: {
          backgroundColor: '#fffefeff',
          borderTopWidth: 1,
          borderTopColor: '#fe0707ff',
          height: 60,
          paddingBottom: 20,
          paddingTop: 2,

        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <BottomTab.Screen
        name="home"
        component={Home}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <BottomTab.Screen
        name="Series"
        component={SeriesScreen}
        options={{
          tabBarLabel: 'Series'
        }}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search'
        }}
      />
      <BottomTab.Screen
        name="wishlist"
        component={WishList}
        options={{
          tabBarLabel: 'My List'
        }}
      />
      <BottomTab.Screen
        name="settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings'
        }}
      />
    </BottomTab.Navigator>
  );
}

export default BottomTabNavigator;