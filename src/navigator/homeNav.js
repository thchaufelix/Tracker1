import React, {useContext} from 'react';
import {Text} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {AppRoute} from './appRoutes';
import i18n from 'i18n-js'
// import { newHomeIcon,HomeIcon,LayerIcon,CubeIcon,AddIcon,BookIcon,DoneIcon } from '../assets/icons';
import {HomeDrawer} from '../component/homedrawer'
import {Icon} from '@ui-kitten/components';
import {RTNavigator} from './rtNav'
import {WLNavigator} from './wlNav';
import {LinkNavigator} from './linkNav';
import {DetailNavigator} from './detailNav';
import {AccountContext} from '../Context/authContext';
import {MapNavigator} from "./mapNav";


const RTIcon = (style) => (
  <Icon {...style} style={{color: 'white', height: 18}} name='track-changes' pack='material'/>
);

const DetailIcon = (style) => (
  <Icon {...style} style={{color: 'white', height: 18}} name='info' pack='material'/>
);

const AssignIcon = (style) => (
  <Icon {...style} style={{color: 'white', height: 18}} name='id-badge' pack='fontawesome5'/>
);

const LinkIcon = (style) => (
  <Icon {...style} style={{color: 'white', height: 18}} name='link' pack='fontawesome5'/>
);

const MapIcon = (style) => (
  <Icon {...style} style={{color: 'white', height: 18}} name='map-marked-alt' pack='fontawesome5'/>
);


const Drawer = createDrawerNavigator();

export const HomeNavigator = () => {
  const {deviceData} = useContext(AccountContext)
  return (
    <Drawer.Navigator screenOptions={{headerShown: false}}
                      drawerContent={props => <HomeDrawer {...props} selected={deviceData.plant_id !== '' ? 3 : 2}/>}
                      initialRouteName={deviceData.plant_id !== '' ? AppRoute.WLNAV : AppRoute.LINKAGE}>

      <Drawer.Screen
        name={AppRoute.RT}
        component={RTNavigator}
        options={{
          title: <Text style={{color: '#FFF', fontFamily: 'M-SB', fontSize: 18}}>{i18n.t('RT')}</Text>,
          drawerIcon: RTIcon
        }}
      />
      <Drawer.Screen
        name={AppRoute.DETAILS}
        component={DetailNavigator}
        options={{
          title: <Text style={{color: '#FFF', fontFamily: 'M-SB', fontSize: 18}}>{i18n.t('Details')}</Text>,
          drawerIcon: DetailIcon
        }}
      />
      <Drawer.Screen
        name={AppRoute.LINKAGE}
        component={LinkNavigator}
        options={{
          title: <Text style={{color: '#FFF', fontFamily: 'M-SB', fontSize: 18}}>{i18n.t('Linkage')}</Text>,
          drawerIcon: LinkIcon
        }}
      />
      <Drawer.Screen
        name={AppRoute.WLNAV}
        component={WLNavigator}
        options={{
          title: <Text style={{color: '#FFF', fontFamily: 'M-SB', fontSize: 18}}>{i18n.t('WL')}</Text>,
          drawerIcon: AssignIcon
        }}
      />
      <Drawer.Screen
        name={AppRoute.MAPVIEW}
        component={MapNavigator}
        options={{
          title: <Text style={{color: '#FFF', fontFamily: 'M-SB', fontSize: 18}}>{i18n.t('WL')}</Text>,
          drawerIcon: MapIcon
        }}
      />

    </Drawer.Navigator>
  );
}