import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoute } from './appRoutes';
import SignInScreen from '../screens/auth/main';
import Forget from '../screens/auth/forget';


const Stack = createStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown:false}}>
    <Stack.Screen name={AppRoute.SIGNIN} component={SignInScreen}/>
    <Stack.Screen name={AppRoute.FORGET} component={Forget}/>
  </Stack.Navigator>
);