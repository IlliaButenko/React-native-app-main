/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, StyleSheet, Image } from 'react-native';
import { View, Text } from 'native-base';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';

class SideMenu extends Component {
  navigateToScreen = (route) => {
    const { navigation } = this.props;
    navigation.navigate(route);
  }

  render() {
    const { navigation } = this.props;
    const userType = this.props.auth.userType;
    let { state: { index: curIndex } } = navigation;
    return (
      <View style={sideMenuStyles.container}>
        <ScrollView>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }} onPress={()=>this.navigateToScreen('Home')}>
            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.999 511.999" width={24} height={24}>
              <Path
                d="M500.744 103.808l-160.82-39.385c-.066-.016-.133-.022-.199-.037-.281-.065-.565-.109-.85-.158-.267-.045-.533-.096-.8-.126-.278-.031-.557-.042-.838-.058-.276-.016-.55-.036-.825-.036-.276 0-.55.021-.826.036-.28.016-.559.027-.837.058-.27.031-.538.082-.806.127-.282.048-.563.092-.842.156-.067.016-.136.021-.203.037L175.59 102.947 18.282 64.424A14.77 14.77 0 000 78.769v315.077a14.767 14.767 0 0011.256 14.345l160.82 39.385c.054.013.108.017.162.03a15.082 15.082 0 001.785.301c.519.055 1.04.094 1.564.094h.004a14.571 14.571 0 001.981-.146c.46-.062.916-.144 1.368-.249.054-.013.108-.016.162-.03l157.307-38.524 157.308 38.524a14.762 14.762 0 0012.629-2.726 14.769 14.769 0 005.652-11.619V118.153a14.763 14.763 0 00-11.254-14.345zM29.538 97.591l131.282 32.15v168.943L89.3 225.951a14.77 14.77 0 00-10.53-4.413H29.538V97.591zm131.283 316.816l-131.283-32.15v-131.18h43.041l88.242 89.738v73.592zm29.538-284.666L321.64 97.59v84.563H256a14.77 14.77 0 00-12.758 7.328l-52.884 90.656V129.741zm131.282 252.516l-131.281 32.15v-75.646h-.001l74.125-127.07h57.158v170.566zm160.821 32.15l-131.282-32.15v-144.01l70.627 86.189a14.768 14.768 0 0011.424 5.409h49.231v84.562zm0-114.1h-42.239l-89.044-108.662V97.591l131.283 32.15v170.566z"
                fill={curIndex == 0 ? "#A2C3FA" : "#A3A8AF"}
              />
            </Svg>
            <Text style={{ paddingLeft: 10, color: (curIndex == 0 ? "#A2C3FA" : "#A3A8AF") }}>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }} onPress={()=>this.navigateToScreen('Settings')}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 3"
              width={24}
              height={24}
              viewBox="0 0 32 32"
            >
              <Path
                d="M28.068 12h-.128a.934.934 0 01-.864-.6.924.924 0 01.2-1.01l.091-.091a2.938 2.938 0 000-4.147l-1.511-1.51a2.935 2.935 0 00-4.146 0l-.091.091A.956.956 0 0120 4.061v-.129A2.935 2.935 0 0017.068 1h-2.136A2.935 2.935 0 0012 3.932v.129a.956.956 0 01-1.614.668l-.086-.091a2.935 2.935 0 00-4.146 0l-1.516 1.51a2.938 2.938 0 000 4.147l.091.091a.935.935 0 01.185 1.035.924.924 0 01-.854.579h-.128A2.935 2.935 0 001 14.932v2.136A2.935 2.935 0 003.932 20h.128a.934.934 0 01.864.6.924.924 0 01-.2 1.01l-.091.091a2.938 2.938 0 000 4.147l1.51 1.509a2.934 2.934 0 004.147 0l.091-.091a.936.936 0 011.035-.185.922.922 0 01.579.853v.129A2.935 2.935 0 0014.932 31h2.136A2.935 2.935 0 0020 28.068v-.129a.956.956 0 011.614-.668l.091.091a2.935 2.935 0 004.146 0l1.511-1.509a2.938 2.938 0 000-4.147l-.091-.091a.935.935 0 01-.185-1.035.924.924 0 01.854-.58h.128A2.935 2.935 0 0031 17.068v-2.136A2.935 2.935 0 0028.068 12zM29 17.068a.933.933 0 01-.932.932h-.128a2.956 2.956 0 00-2.083 5.028l.09.091a.934.934 0 010 1.319l-1.511 1.509a.932.932 0 01-1.318 0l-.09-.091A2.957 2.957 0 0018 27.939v.129a.933.933 0 01-.932.932h-2.136a.933.933 0 01-.932-.932v-.129a2.951 2.951 0 00-5.028-2.082l-.091.091a.934.934 0 01-1.318 0l-1.51-1.509a.934.934 0 010-1.319l.091-.091A2.956 2.956 0 004.06 18h-.128A.933.933 0 013 17.068v-2.136A.933.933 0 013.932 14h.128a2.956 2.956 0 002.083-5.028l-.09-.091a.933.933 0 010-1.318l1.51-1.511a.932.932 0 011.318 0l.09.091A2.957 2.957 0 0014 4.061v-.129A.933.933 0 0114.932 3h2.136a.933.933 0 01.932.932v.129a2.956 2.956 0 005.028 2.082l.091-.091a.932.932 0 011.318 0l1.51 1.511a.933.933 0 010 1.318l-.091.091A2.956 2.956 0 0027.94 14h.128a.933.933 0 01.932.932z"
                fill={curIndex == 1 ? "#A2C3FA" : "#A3A8AF"}
              />
              <Path
                d="M16 9a7 7 0 107 7 7.008 7.008 0 00-7-7zm0 12a5 5 0 115-5 5.006 5.006 0 01-5 5z"
                fill={curIndex == 1 ? "#A2C3FA" : "#A3A8AF"}
              />
            </Svg>
            <Text style={{ paddingLeft: 10, color: (curIndex == 1 ? "#A2C3FA" : "#A3A8AF") }}>
              Settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }} onPress={()=>this.navigateToScreen('Profile')}>
            <Svg
              viewBox="0 0 511.996 511.996"
              width={24}
              height={24}
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path d="M496.996 110.992h-115.99V95.994c0-8.284-6.716-15-15-15h-67.578c-6.19-17.461-22.873-30-42.43-30s-36.239 12.539-42.43 30H145.99c-8.284 0-15 6.716-15 15v14.998H15c-8.285 0-15 6.716-15 15v320.01c0 8.284 6.715 15 15 15h481.996c8.284 0 15-6.716 15-15v-320.01c0-8.284-6.716-15-15-15zm-336.006.002h65.008c8.283 0 15-6.716 15-15 0-8.271 6.729-15 15-15s15 6.729 15 15c0 8.284 6.716 15 15 15h65.008v14.979l-.001.02.001.02v14.982H160.99zm321.006 320.008H30v-290.01h100.99v15.001c0 8.284 6.716 15 15 15h220.016c8.284 0 15-6.716 15-15v-15.001h100.99z"
                fill={curIndex == 2 ? "#A2C3FA" : "#A3A8AF"}
              />
              <Path d="M190.413 292.547c7.839-9.175 12.587-21.064 12.587-34.049 0-28.949-23.552-52.5-52.5-52.5S98 229.549 98 258.498c0 12.984 4.748 24.874 12.587 34.049-21.06 13.294-35.087 36.758-35.087 63.451 0 8.284 6.715 15 15 15h120c8.284 0 15-6.716 15-15 0-26.693-14.027-50.157-35.087-63.451zM128 258.498c0-12.407 10.094-22.5 22.5-22.5s22.5 10.093 22.5 22.5-10.094 22.5-22.5 22.5-22.5-10.094-22.5-22.5zm-19.93 82.5c6.19-17.461 22.873-30 42.43-30s36.239 12.539 42.43 30zM286.003 288.498c0 8.284 6.716 15 15 15h120.986c8.284 0 15-6.716 15-15s-6.716-15-15-15H301.003c-8.284 0-15 6.716-15 15zM421.989 333.501H301.003c-8.284 0-15 6.716-15 15s6.716 15 15 15h120.986c8.284 0 15-6.716 15-15s-6.716-15-15-15zM331.006 213.495c-8.284 0-15 6.716-15 15s6.716 15 15 15h60.98c8.284 0 15-6.716 15-15s-6.716-15-15-15z"
                fill={curIndex == 2 ? "#A2C3FA" : "#A3A8AF"}
              />
            </Svg>
            <Text style={{ paddingLeft: 10, color: (curIndex == 2 ? "#A2C3FA" : "#A3A8AF") }}>
              Profile
            </Text>
          </TouchableOpacity>
          {userType == "driver" ?
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }} onPress={() => this.navigateToScreen('DriverPerformance')}>
              <Svg
                height={24}
                viewBox="0 0 512 512"
                width={24}
                xmlns="http://www.w3.org/2000/svg"
              >
                <Path d="M497 482H30V15c0-8.291-6.709-15-15-15S0 6.709 0 15v482c0 8.291 6.709 15 15 15h482c8.291 0 15-6.709 15-15s-6.709-15-15-15z"
                  fill={curIndex == 3 ? "#A2C3FA" : "#A3A8AF"}
                />
                <Path d="M75 452h61c8.291 0 15-6.709 15-15v-91c0-8.291-6.709-15-15-15H75c-8.291 0-15 6.709-15 15v91c0 8.291 6.709 15 15 15zM196 271c-8.291 0-15 6.709-15 15v151c0 8.291 6.709 15 15 15h60c8.291 0 15-6.709 15-15V286c0-8.291-6.709-15-15-15zM316 211c-8.291 0-15 6.709-15 15v211c0 8.291 6.709 15 15 15h60c8.291 0 15-6.709 15-15V226c0-8.291-6.709-15-15-15zM497 151h-61c-8.291 0-15 6.709-15 15v271c0 8.291 6.709 15 15 15h61c8.291 0 15-6.709 15-15V166c0-8.291-6.709-15-15-15zM61.787 263.104c3.959 7.359 13.109 9.994 20.317 6.108L431.391 81.674l-8.809 17.617c-3.706 7.412-.703 16.421 6.709 20.127 7.48 3.713 16.436.652 20.127-6.709l30-60c2.329-4.644 2.08-10.166-.659-14.59S471.2 31 466 31h-75c-8.291 0-15 6.709-15 15s6.709 15 15 15h15.5L67.896 242.787c-7.295 3.941-10.035 13.037-6.109 20.317z"
                  fill={curIndex == 3 ? "#A2C3FA" : "#A3A8AF"}
                />
              </Svg>
              <Text style={{ paddingLeft: 10, color: (curIndex == 3 ? "#A2C3FA" : "#A3A8AF") }}>
                Driver Performance
            </Text>
            </TouchableOpacity>
            : null}
        </ScrollView>
      </View>
    );
  }
}

const sideMenuStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: 250,
    backgroundColor: '#1A2537'
  },
  navItemStyle: {
    padding: 10
  },
  navSectionStyle: {
    backgroundColor: 'lightgrey'
  },
  sectionHeadingStyle: {
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  footerContainer: {
    padding: 20,
    backgroundColor: 'lightgrey'
  }
});
function mapStateToProps({ auth }) {
  return {
    auth
  };
}

const bindActions = {
};

export default connect(mapStateToProps, bindActions)(SideMenu);
