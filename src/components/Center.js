import { View } from 'native-base';
import React from 'react';

export default function Center(props) {
  return (
    <View {...props} style={{...props.style, alignItems: 'center', alignSelf: 'center'}}>
      {props.children}
    </View>
  );
}
