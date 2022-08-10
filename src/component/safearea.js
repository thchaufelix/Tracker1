import React from 'react';
import { useSafeArea } from 'react-native-safe-area-context';
import { Layout } from '@ui-kitten/components';

export const SaveAreaInset = {
  TOP :'top',
  BOTTOM :'bottom',
}

export const SafeAreaLayout = (props) => {
  const safeAreaInsets = useSafeArea();

  const { insets, style, ...layoutProps } = props;

  const toStyleProp = (inset) => {
    switch (inset) {
      case SaveAreaInset.BOTTOM:
        return { paddingBottom: safeAreaInsets.bottom };
      case SaveAreaInset.TOP:
        return { paddingTop: safeAreaInsets.top };
    }
  };

  const createInsets = () => {
    // @ts-ignore
    return React.Children.map(insets, toStyleProp);
  };

  return (
    <Layout
      {...layoutProps}
      style={[style, createInsets(),{}]}
    />
  );
};