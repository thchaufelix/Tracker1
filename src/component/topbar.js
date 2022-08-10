import React, { useEffect, useState } from 'react';
import { View , SafeAreaView,Text, Platform} from 'react-native'
import { TabBar, Tab, Divider,  } from '@ui-kitten/components';
import { SafeAreaLayout, SaveAreaInset,  } from './safearea';
import { Toolbar } from './toolbar';
import { MenuIcon } from '../assets/icons';
import * as constants from '../global/constants'

export function TodoTabBar (props) {
  // console.log(props.state.routeNames)
  useEffect(()=>{
    const newTitleColor = new Array(props.state.routeNames.length).fill(props.mode===0?'#666666':'#FFFFFF')
    newTitleColor[0] = props.mode===0?'#1E3957':'#7ABBA3'
    setTitleColor(newTitleColor)
  },[])
  const [titleColor, setTitleColor ] = useState(new Array(props.state.routeNames.length).fill(props.mode===0?'#666666':'#FFFFFF'))
  const onTabSelect = (index) => {
    const newTitleColor = new Array(props.state.routeNames.length).fill(props.mode===0?'#666666':'#FFFFFF')
    newTitleColor[index] = props.mode===0?'#1E3957':'#7ABBA3'
    setTitleColor(newTitleColor)
    const selectedTabRoute = props.state.routeNames[index];
    props.navigation.navigate(selectedTabRoute);
  };

  const createNavigationTabForRoute = (route,index) => {
    // console.log(route)
    const { options } = props.descriptors[route.key];
    return (
      <Tab
        key={route.key}
        title={<Text style={{color:titleColor[index]}}>{options.title}</Text>}
        icon={options.tabBarIcon}
        activeTintColor='#FFFFFF'
        style={{paddingVertical:"1%"}}
      />
    );
  };
  const title = () => {
    if ( props.mode === 0){
      return(
        <View style={{flexDirection:'row',marginLeft:-constants.windowWidth/7}}>
          <Text style={{color:'#FFFFFF',fontFamily: 'fugazone-regular',fontSize:20}}>Cerebro </Text>
          <Text style={{color:'#7ABBA3',fontFamily: 'fugazone-regular',fontSize:20}}>Procurement</Text>
        </View> 
      )
    } else{
      return(
        <Text style={{color:'#FFFFFF',fontFamily: 'roboto',fontSize:21}}>{props.header}</Text>
      )
    }
    
  }

  

  return (
    <SafeAreaLayout insets={SaveAreaInset.TOP} style={{backgroundColor:'#1E3957'}}>
        <Toolbar title={title} style={{backgroundColor:'#1E3957'}} leftIcon={MenuIcon}
        leftAction={props.navigation.toggleDrawer} functional={true}/>
        <TabBar selectedIndex={props.state.index} onSelect={onTabSelect}  indicatorStyle={{backgroundColor:props.mode===0?'#1E3957':'#7ABBA3',color:'#1E3957'}}  style={{backgroundColor:props.mode===0?'#FFFFFF':'#1E3957',position:'relative',bottom:'-1%',height:constants.windowHeight/(Platform.OS==='ios'?16:15)}}>
          {props.state.routes.map(createNavigationTabForRoute)}
        </TabBar>
      <Divider/>
    </SafeAreaLayout>
      
  );
};