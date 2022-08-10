import React, { useContext } from 'react';
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import { AppRoute } from './appRoutes';
// import Forget from '../screen/Auth/forget';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from 'i18n-js';
import LinkScreen from '../screens/connect/home';
import ImageScreen from '../component/imagePicker/imagePicker';
import { AccountContext } from '../Context/authContext';
import LinkcCreateScreen from '../screens/connect/createForm';

const Stack = createStackNavigator();
const NavigationDrawerStructure = (props) => {
  //Structure for the navigatin Drawer
  const toggleDrawer = () => {
    //Props to open/close the drawer
    props.navigationProps.toggleDrawer();
  };

  return (
      <MaterialIcons onPress={toggleDrawer} name="menu" size={24} color="white" style={{marginLeft:15}}/>
  );
};
export const LinkNavigator = ({navigation}) => 
  {
      return(
        <Stack.Navigator  screenOptions={{headerShown:false,headerStyle:{backgroundColor:'#2E333A'},headerTitleStyle: {
          color:'white',fontFamily:'M-SB'
        },headerTitle:i18n.t('Linkage'),headerLeft:() => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),}} >
          <Stack.Screen name={AppRoute.LINK} component={LinkScreen} />
          <Stack.Screen name={AppRoute.LINKCREATE} component={LinkcCreateScreen} initialParams={{ photo: [] }}/>
          <Stack.Screen name={AppRoute.IMAGE} component={ImageScreen} />
          {/* <Stack.Screen name={AppRoute.FORGET} component={Forget}/> */}
        </Stack.Navigator>
      );
  }
