import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import { AskPhoneNumber, AskUsername, AskVerifyCode } from '../screens/askprofile';
import AskProHeader from './components/AskProHeader';
import { Material } from '../styles';


const AskProfile = createStackNavigator({
  AskUsername: {
    screen: AskUsername
  },
  AskPhoneNumber: {
    screen: AskPhoneNumber
  },
  AskVerifyCode: {
    screen: AskVerifyCode
  }
}, {
  initialRouteName: 'AskUsername',
  defaultNavigationOptions: {
    header: (props) => (<AskProHeader {...props} />),
    cardStyle: { backgroundColor: Material.containerBgColor }
  }
});

export default createAppContainer(AskProfile);
