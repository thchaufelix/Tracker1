import React,{ Fragment, useEffect, useContext, useState } from 'react';
import { Modal, View, StyleSheet,Text, SafeAreaView,TouchableOpacity,FlatList } from 'react-native';
import { Drawer, Avatar, DrawerItem } from '@ui-kitten/components';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from 'i18n-js'
import { Icon } from '@ui-kitten/components';
import { SimpleLineIcons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store'
import { AccountContext } from '../Context/authContext';
import * as constants from '../global/constants'
import axios from 'axios';
// import { AccountContext } from '../Context/authContext';
// import {AccountContext} from '../context/authContext'
const LogOutIcon = (style) => (
  <Icon {...style} style={{color:'white',height:18}} name='logout'  pack='material' />
);

const TIcon = (style) => (
  <Icon {...style} style={{color:'white',height:18}} name='translate'  pack='material' />
);

const PIcon = (style) => (
  <Icon {...style} style={{color:'white',height:18}} name='settings'  pack='material' />
);

function DrawerHeader (props){
  // const userData = {
  //   full_name:'John Doe',
  //   email:'admin@admin.com'
  // }

  const NavigationDrawerStructure = (props) => {
    
    //Structure for the navigatin Drawer
    const toggleDrawer = () => {
      //Props to open/close the drawer
      props.navigationProps.closeDrawer()
      // console.log(props)
    };
  
    return (
        <MaterialIcons onPress={toggleDrawer} name="menu" size={24} color="white" style={{marginLeft:15}}/>
    );
  };
  return(
    <SafeAreaView style={{flex:0.2,backgroundColor:'#2E333A',justifyContent:'flex-end'}}>
          <View style={{flexDirection:'row'}}>
              <View style={{flex:0.8,flexDirection:'row',marginLeft:'5%'}}>
                <Text style={[styles.appHeader]}>Cerebro</Text>
                <Text style={[styles.appName]}> Tracker</Text>
              </View>
              <View style={{flex:0.2,justifyContent:'center'}}>
                  <NavigationDrawerStructure navigationProps={props.navigation}/>
              </View>
          </View>
            
      </SafeAreaView> 
  )
}
    

export function HomeDrawer (props){
  const { onCarList,bgColor, setBgColor,deviceData,token  } = useContext(AccountContext)
  const authToken = 'Token '+ token
  const [ modalVisible, setModalVisible ] = useState(false)
  const [ projectList, setProjectList ] = useState([])
  // console.log(props.state.routes)
  useEffect(()=>{
    const newBgColor = new Array(6).fill('#2E333A')
    newBgColor[props.selected] = '#73B2B8'
    setBgColor(newBgColor)
  },[])
  const routes = props.state.routes
  // console.log(routes[1].length)
  const onItemSelect = (index) => {
    if (!(index.section)) {
        console.log(index.row , onCarList)
        if(index.row === 5 ){
          signOut()
        
        }else if(index.row===4  ){
          changeLang()
        } 
        // else if(index.row===5){
        //   axios.get(constants.projApi,{
        //         headers: {
        //             Authorization: authToken,
        //             "Fcm-Imei":deviceData.imei
        //             },
        //         }).then(async function (response){
        //           setProjectList(response.data)
        //           setModalVisible(true)
        //           props.navigation.closeDrawer()
        //         })
        // }
        else if (index.row ===0 && (onCarList.length == 0|| deviceData.plant_id =='')){
              
        }
        else{
          const newBgColor = new Array(3).fill('#2E333A')
          newBgColor[index.row] = '#73B2B8'
          setBgColor(newBgColor)
          const selectedTabRoute = props.state.routeNames[index.row];
          // console.log(selectedTabRoute)
          props.navigation.navigate(selectedTabRoute);
          props.navigation.closeDrawer()
        }
    }
        
    else{
      const resultIndex = index.section+index.row
      const newBgColor = new Array(3).fill('#2E333A')
      newBgColor[resultIndex] = '#73B2B8'
      setBgColor(newBgColor)
      const selectedTabRoute = props.state.routeNames[resultIndex]
      // console.log(selectedTabRoute)
      props.navigation.navigate(selectedTabRoute);
      props.navigation.closeDrawer()} 
    
  };
  
  const createDrawerItemForRoute = (routes, index) => {
      const { options } = props.descriptors[routes.key];
      return (
        <DrawerItem
          style={{backgroundColor:bgColor[index],height:50}}
          key={index}
          disabled={ index===0&onCarList.length===0?true:false}
          title={()=><Text style={{fontSize:14,fontFamily:'M-M',color:  index===0&onCarList.length===0?'grey':'#FFF',position:'absolute',left:'25%'}}>{i18n.t(routes.name)}</Text>}
          accessoryLeft={options.drawerIcon}
        />
      );
  };

    const signOut = () => { 
      props.navigation.navigate('SignIn');
    props.navigation.closeDrawer()
  }


  const changeLang = async () => {
    const input = Localization.locale==='en'?'zh':'en'
    Localization.locale = input
    i18n.locale = Localization.locale;
    await SecureStore.setItemAsync('lang', input);
    props.navigation.replace('Home')
    props.navigation.closeDrawer()
  }

  const renderItem = ({ item, index}) => {
    const pressHandler = (index) => { 
        console.log(item)
      
    }    
    return(
        <TouchableOpacity style={{height:constants.windowHeight/4,marginVertical:'3%'}} key={item.id}  onPress={() => pressHandler(index)} >
          <View style={{height:'100%',borderWidth:1,borderRadius:10,justifyContent:'center',paddingHorizontal:'5%',borderColor:'grey',padding:2}}>
            <Text style={[styles.modalText,{fontSize:12,textAlign: 'left'}]}>{item.project_code}</Text>
            <Text style={[styles.modalText,{fontSize:12,textAlign: 'left'}]}>{item.description}</Text>
          </View>
            {/* <Text>{item}</Text> */}
           
            
        </TouchableOpacity>
    )

}


  const ProjBox = () => <Modal transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
            setModalVisible(!modalVisible);
        }}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{i18n.t('SelectPrj')}</Text>
                    <FlatList  style={{marginBottom:'3%'}} data={projectList}  renderItem={renderItem} keyExtractor={item => item.id} />
                    <TouchableOpacity onPress={()=>setModalVisible(!modalVisible)} style={[styles.submitBtn,{backgroundColor:'#73B2B8',width:'100%',alignSelf:'center',paddingHorizontal:"20%"}]}>
                        <Text style={[styles.data,{textAlign:'center',alignSelf:'center'}]}>{i18n.t('Cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </Modal>



  return (
    <Fragment>
      <SafeAreaView style={{flex: 1, backgroundColor: "#2E333A"}}>
        <Drawer
          // header={props=><DrawerHeader {...props} signOut={signOut} accountSetting={accountSetting}/>}
          header={headerProp=><DrawerHeader {...headerProp} navigation={props.navigation} />}
          appearance={'noDivider'}
          style={{backgroundColor:'#2E333A'}}
          onSelect={onItemSelect}>
            {routes.map(createDrawerItemForRoute)}
            <DrawerItem
              style={{backgroundColor:bgColor[4],height:50}}
              key={'translate'}
              title={()=> <Text style={{fontSize:14,fontFamily:'M-M',color:'#FFF',position:'absolute',left:'25%'}}>{Localization.locale==='en'?'繁中':'English'}</Text>}
              accessoryLeft={TIcon}
            />
             {/* <DrawerItem
              style={{backgroundColor:bgColor[5],height:50}}
              key={'changeprj'}
              title={()=><Text style={{fontSize:14,fontFamily:'M-M',color:'#FFF',position:'absolute',left:'25%'}}>{i18n.t('ChangePrj')}</Text>}
              accessoryLeft={PIcon}
            /> */}
            <DrawerItem
              style={{backgroundColor:bgColor[6],height:50}}
              key={'logout'}
              title={()=><Text style={{fontSize:14,fontFamily:'M-M',color:'#FFF',position:'absolute',left:'25%'}}>{i18n.t('Logout')}</Text>}
              accessoryLeft={LogOutIcon}
            />
        </Drawer>
        {/* <ProjBox /> */}
      </SafeAreaView>
    </Fragment>
    
    
  );
};

const styles = StyleSheet.create({
  header: {
    height: '30%',
  },
  appHeader: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'FO',
  },
  appName: {
      color: '#7ABBA3',
      fontSize: 22  ,
      overflow: 'scroll',
      // width: 270,
      fontFamily: 'FO',
  },
  data:{
    fontFamily:'M-R',
    fontSize:14,
    color:'#FFF',
    width:'100%'
},
  centeredView: {
    flex: 1,
    // width:'110%',
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "rgba(56, 56, 56, 1)",
    borderRadius: 18,
    padding: 35,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6
  },
  button: {
    marginTop: 10,
    borderRadius: 18,
    padding: 10,
    // elevation: 2
  },

  textStyle: {
    color: "rgba(150, 150, 150, 1)",
    fontFamily:'M-M',
    fontSize: 20,
    textAlign: "center"
  },
  modalText: {
    color: "white",
    fontFamily:'M-M',
    fontSize: 15,
    marginBottom: 15,
    textAlign: "center"
  },
  modalText2: {
    color: "white",
    fontSize: 18,
    fontFamily:'M-M',
    marginBottom: 8,
    textAlign: "center"
  },
  submitBtn:{

    paddingVertical: '5%',
    borderRadius:5,
    borderWidth:0,
  },

  
});