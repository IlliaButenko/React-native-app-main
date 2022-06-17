import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator, DrawerItems } from 'react-navigation-drawer';
import { Profile, Library, Locator, Downloads, DriverPerformance } from '../screens/main';
import MainHeader from './components/MainHeader';
import { Icon, View } from 'native-base';
import Svg, { G, Path, Circle, Ellipse } from "react-native-svg"
import { SafeAreaView } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import SideMenu from './components/SideMenu';

const MainDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: Locator,
  },
  Settings: {
    screen: Downloads,
  },
  Profile: {
    screen: Profile,
  },
  DriverPerformance: {
    screen: DriverPerformance
  }
}, {
  initialRouteName: 'DriverPerformance',
  contentOptions: {
    activeTintColor: '#F00',
  },
  contentComponent: SideMenu,
  drawerWidth: 250
});


const RootNavigator = createStackNavigator({
  Home: {
    screen: MainDrawerNavigator,
    navigationBarStyle: { navBarHidden: true },
    navigationOptions: {
      headerShown: true,
    }
  },
},
  {
    defaultNavigationOptions: {
      header: (props) => (<MainHeader {...props} />)
    }
  });
export default createAppContainer(RootNavigator);
