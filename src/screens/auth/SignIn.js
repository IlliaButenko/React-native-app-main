import React, { Component } from 'react';
import { Image, Dimensions, PermissionsAndroid } from 'react-native';
import { connect } from 'react-redux';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row, View, Label } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { validateEmail, validatePhoneNumber } from '../../utils';
import { signIn } from '../../actions/auth';
import { MIN_PASSWORD_LEN } from '../../config';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

class SignIn extends Component {
  state = {
    email: '',
    isValidEmail: true,
    mobile: '',
    isValidMobile: true,
    password: '',
    isValidPwd: true
  };

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
      alert(err);
    }
  }

  onChangeMobile = (mobile) => {
    this.setState({
      mobile,
      isValidMobile: true
    });
  }

  onChangeEmail = (email) => {
    this.setState({
      email,
      isValidEmail: true
    });
  }

  onChangePwd = (password) => {
    this.setState({
      password,
      isValidPwd: true
    });
  }

  onSignIn = () => {
    const { email, password } = this.state;
    const isValidEmail = validateEmail(email);
    // const isValidMobile = validatePhoneNumber(mobile) && mobile.length >= 11;
    const isValidPwd = password.length >= MIN_PASSWORD_LEN;
    this.setState({ isValidEmail, isValidPwd });

    // if (mobile.length < 11) {
    //   alert('Please input min 11 phone numbers');
    //   return;
    // }

    if (!isValidEmail || !isValidPwd) return;

    this.props.signIn({ email, password });
  }

  onSignup = () => {
    const { navigation } = this.props;
    navigation.navigate('SignUp');
  }

  onTerms = () => { }

  render() {
    const { isValidEmail, isValidPwd } = this.state;

    return (
      <Container style={{ backgroundColor: '#1A2537', }}>
        <Content padder>
          <Center>
            <Image style={{ width: 100, height: 100, marginTop: 50, marginBottom: 10 }} source={require('../../../assets/images/ukcourier_logo1.png')} />
            <Text style={{color: '#B076EB'}}>TOOL<Text style={{color: '#fff'}}>2</Text>DEL</Text>
            <Text style={{color: '#fff'}}>Here is where your route begins</Text>
          </Center>
          <View style={{ marginVertical: 20 }}>
            {/* <Label style={{ color: '#fff' }}>Mobile</Label>
            <Item error={!isValidMobile}>
              <Input placeholder='Mobile' style={{ color: '#fff' }} keyboardType = 'numeric' onChangeText={this.onChangeMobile} />
            </Item> */}
            <Label style={{ color: '#fff' }}>Email</Label>
            <Item error={!isValidEmail}>
              <Input placeholder='Email' style={{ color: '#fff' }} onChangeText={this.onChangeEmail} />
            </Item>
            <Label style={{ color: '#fff' }}>Password</Label>
            <Item error={!isValidPwd}>
              <Input placeholder='Password' style={{ color: '#fff' }} onChangeText={this.onChangePwd} secureTextEntry />
            </Item>
          </View>
          <Center>
            <Button style={{ paddingHorizontal: 10, backgroundColor: '#A2C3FA', borderRadius: 10 }} onPress={this.onSignIn}>
              <Text style={{ fontSize: 18 }}>Login</Text>
            </Button>
          </Center>
          {/* <View style={{ alignSelf: 'center', marginTop: 30, }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Don't have an account?</Text>
          </View>
          <View style={{ alignSelf: 'center', }}>
            <Button transparent onPress={this.onSignup}>
              <Text uppercase={false} style={{ fontSize: 20, fontWeight: 'bold', color: '#B076EB' }}>Sign Up</Text>
            </Button>
          </View> */}
        </Content>
      </Container>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    auth,
  };
}

const bindActions = {
  signIn,
};

export default connect(mapStateToProps, bindActions)(SignIn);
