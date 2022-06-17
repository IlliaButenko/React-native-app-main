import React, { Component } from 'react';
import { PermissionsAndroid } from 'react-native';
import { Button, Container, Content, Text, Icon } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';

class Welcome extends Component {
  onGetStarted = () => {
    const {navigation} = this.props;
    // navigation.replace('Locator');
    navigation.navigate('Intro');
  }

  componentDidMount = async () => {
    this.allowAccessGranted();
  }

  allowAccessGranted = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
        'title': 'Location Access Required',
        'message': 'This App needs to Access your location'
      });
      console.log('granted result', PermissionsAndroid.RESULTS.GRANTED);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('permission granted', granted)
      } else {
        alert(PermissionsAndroid.RESULTS.GRANTED);
      }
    } catch (err) {
      alert("err", err);
    }
  }
  
  render() {
    return (
      <Container>
        <Content padder>
          <Center style={{marginVertical: screenSize.height * 0.25}}>
            <Text style={styles.logoTitle}>UK-COURIER</Text>
            <Text style={{color: Material.touchableTextColor}}>UK-COURIER Driver Location</Text>
          </Center>
          <Button rounded block style={{marginHorizontal: 10}} onPress={this.onGetStarted}>
            <Text>Get Started</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

export default Welcome;
