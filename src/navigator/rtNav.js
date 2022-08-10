import React from 'react';
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoute } from './appRoutes';
// import Forget from '../screen/Auth/forget';
import i18n from 'i18n-js';

import RTCScreen from '../screens/RTC/home';
// import ConnectScreen from '../screens/RTC/connect';

const Stack = createStackNavigator();

  

export const RTNavigator = ({navigation}) => (
  <Stack.Navigator screenOptions={{headerShown:false}}>
    <Stack.Screen name={AppRoute.RTC} component={RTCScreen} />
  </Stack.Navigator>
);