import React from 'react';
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoute } from './appRoutes';
// import Forget from '../screen/Auth/forget';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from 'i18n-js';
import DetailScreen from '../screens/detail/details';

const Stack = createStackNavigator();

export const DetailNavigator = ({navigation}) => (
  <Stack.Navigator screenOptions={{headerShown:false}}>
    <Stack.Screen name={AppRoute.INFO} component={DetailScreen} />
    {/* <Stack.Screen name={AppRoute.FORGET} component={Forget}/> */}
  </Stack.Navigator>
);