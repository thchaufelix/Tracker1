import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import MainScreen from '../screen/mainpage';
import { AppRoute } from './appRoutes';
import { AuthNavigator } from './authNav'
import { HomeNavigator } from './homeNav'
// import Account from '../screens/account';
// import ConnectScreen from '../screens/RTC/connect';
// import { LinkHomeNavigator } from './linkHomeNav';
// import { HomeNavigator } from './botTabsNavigator';
// import Request from '../screen/HomePage/request'
// import Request1 from '../screen/HomePage/request1'
// import SignatureScreen from '../screen/HomePage/signature'
// import NewFormScreen from '../screen/Form/newForm'
// import NewFormSubConScreen from '../screen/Form/newFormSubCon'
// import NewFormAddMaterialScreen from '../screen/Form/newFormAddMaterial'
// import Account from '../screen/drawer/account'
// import ClassifyForm from '../screen/Form/form';
// import NewForm from '../screen/Form/StockForm'
// import MaterialForm from '../screen/Form/MaterialForm'
// import StockDetail from '../screen/Stock/detail'
// import CameraScreen from '../component/imagePicker/camera'

const Stack = createStackNavigator();

export const AppNavigator = (props) => (
  <Stack.Navigator {...props} screenOptions={{headerShown:false}}>
    <Stack.Screen name={AppRoute.AUTH} component={AuthNavigator}/>
    <Stack.Screen name={AppRoute.HOME} component={HomeNavigator}/>
    {/* <Stack.Screen name={AppRoute.LINKHOME} component={LinkHomeNavigator}/> */}
    {/* <Stack.Screen name={AppRoute.ACCOUNT} component={Account}/> */}
    {/* <Stack.Screen name={AppRoute.CONNECT} component={ConnectScreen} /> */}

    {/* <Stack.Screen name={AppRoute.HOME} component={HomeNavigator}/>
    <Stack.Screen name={AppRoute.REQUEST} component={Request}/>
    <Stack.Screen name={AppRoute.REQUEST1} component={Request1}/>
    <Stack.Screen name={AppRoute.SIGNATURE} component={SignatureScreen}/>
    <Stack.Screen name={AppRoute.NEWFORM} component={NewFormScreen}/>
    <Stack.Screen name={AppRoute.NEWFORMSUBCON} component={NewFormSubConScreen}/>
    <Stack.Screen name={AppRoute.NEWFORMADDMATERIAL} component={NewFormAddMaterialScreen}/>
    <Stack.Screen name={AppRoute.ACCOUNT} component={Account}/>
    <Stack.Screen name={AppRoute.CLASSIFYFORM} component={ClassifyForm}/>
    <Stack.Screen name={AppRoute.STOCKADDNEW} component={NewForm}/>
    <Stack.Screen name={AppRoute.MATERIALADDNEW} component={MaterialForm}/>
    <Stack.Screen name={AppRoute.STOCKDETAIL} component={StockDetail}/>
    <Stack.Screen name={AppRoute.CAMERA} component={CameraScreen}/> */}

  </Stack.Navigator>
);