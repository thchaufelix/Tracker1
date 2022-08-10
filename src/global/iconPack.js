import { MaterialIcons,Ionicons,FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';

export const MaterialIconsPack = {
    name: 'material',
    icons: createIconsMap(),
  };
  
  function createIconsMap() {
    return new Proxy({}, {
      get(target, name) {
        return IconProvider(name);
      },
    });
  }
  
  const IconProvider = (name) => ({
    toReactElement: (props) => MaterialIcon({ name, ...props }),
  });
  
  function MaterialIcon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <MaterialIcons name={name} size={height} color={tintColor} style={iconStyle} />
    );
  }

export const IoniconsPack = {
    name: 'ionicon',
    icons: createIonIconsMap(),
  };
  
  function createIonIconsMap() {
    return new Proxy({}, {
      get(target, name) {
        return IonIconProvider(name);
      },
    });
  }
  
  const IonIconProvider = (name) => ({
    toReactElement: (props) => Ionicon({ name, ...props }),
  });
  
  function Ionicon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <Ionicons name={name} size={height} color={tintColor} style={iconStyle} />
    );
  }

export const FontAwesome5Pack = {
    name: 'fontawesome5',
    icons: createfontawesome5Map(),
  };
  
  function createfontawesome5Map() {
    return new Proxy({}, {
      get(target, name) {
        return fontawesome5Provider(name);
      },
    });
  }
  
  const fontawesome5Provider = (name) => ({
    toReactElement: (props) => FontAwesome5Icon({ name, ...props }),
  });
  
  function FontAwesome5Icon({ name, style }) {
    const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
    return (
      <FontAwesome5 name={name} size={height} color={tintColor} style={iconStyle} />
    );
  }