import React from 'react';
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoute } from './appRoutes';
// import Forget from '../screen/Auth/forget';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from 'i18n-js';
import ConnectScreen from '../screens/whitelist/connect';
import RTCScreen from '../screens/RTC/home';
import MapRoute from "../screens/MapRoute";

const Stack = createStackNavigator();

export const MapNavigator = ({navigation}) => (
 <Stack.Navigator screenOptions={{headerShown:false}}>
    <Stack.Screen name={"_"+AppRoute.MAPVIEW} component={MapRoute} />
  </Stack.Navigator>
);