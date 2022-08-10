import React from 'react';
import {
  Layout,
  OverflowMenu,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';


const SearchIcon = (style)  => (
  <Icon {...style}  name='search' pack='material'/>
);

const FilterIcon = (style) => (
  <Icon {...style} name='filter-list'  pack='material' />
);

export const Toolbar = (props) => {
  const { rightAction, leftIcon, rightIcon, leftAction, ...topNavigationProps } = props;

  const renderLeftAction = () => (
    <TopNavigationAction icon={leftIcon} onPress={leftAction}/>
  );

  const renderRightAction = () => {
    if (!rightIcon){
      return(
        <Layout style={{backgroundColor:'#1E3957', flexDirection:'row'}}>
          <TopNavigationAction icon={FilterIcon} onPress={()=>console.log('filter')}/>
          <TopNavigationAction icon={SearchIcon} onPress={()=>console.log('search')}/>
        </Layout>
        
      )
    }else{
      return(
        <TopNavigationAction icon={rightIcon} onPress={rightAction}/>
      )
    }
    ;}

  if(props.functional){
    return (
      <TopNavigation
        {...topNavigationProps}
        alignment='center'
        accessoryLeft={renderLeftAction }
        accessoryRight={renderRightAction}
      />
    )
  }else{
    return(
      <TopNavigation
        {...topNavigationProps}
        alignment='center'
        accessoryLeft={renderLeftAction }
        
      />
    )
  }

};
