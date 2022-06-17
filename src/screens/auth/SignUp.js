import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { CheckBox } from '@react-native-community/checkbox';
import { CheckBox } from 'react-native-elements';
import { TouchableOpacity } from 'react-native';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row, Left, Body, Label, View } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { validateEmail, validatePhoneNumber } from '../../utils';
import { signUp } from '../../actions/auth';
import { MIN_PASSWORD_LEN } from '../../config';

class SignUp extends Component {
  state = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPwd: '',
    allowTerms: false,
    isValidName: true,
    isValidEmail: true,
    isValidMobile: true,
    isValidPwd: true,
    isValidConfirmPwd: true,
    isValidTerms: true
  };

  onChangeName = (name) => {
    this.setState({
      name,
      isValidName: true
    });
  }

  onChangeEmail = (email) => {
    this.setState({
      email,
      isValidEmail: true
    });
  }

  onChangeMobile = (mobile) => {
    this.setState({
      mobile,
      isValidMobile: true
    });
  }

  onChangePwd = (password) => {
    this.setState({
      password,
      isValidPwd: true
    });
  }

  onChangeConfirmPwd = (confirmPwd) => {
    const { password } = this.state;
    confirmPwd == password ? this.setState({ confirmPwd, isValidConfirmPwd: true }) : this.setState({ isValidConfirmPwd: false })
  }

  onAcceptTerms = () => {
    this.setState({
      allowTerms: !this.state.allowTerms,
      isValidTerms: !this.state.allowTerms
    })
  }

  onSignUp = () => {
    const { name, email, mobile, password, confirmPwd, allowTerms } = this.state;
    const isValidName = name.length ? true : false;
    const isValidEmail = validateEmail(email);
    const isValidMobile = validatePhoneNumber(mobile) && mobile.length >= 11;
    const isValidPwd = password.length >= MIN_PASSWORD_LEN;
    const isValidConfirmPwd = password == confirmPwd;
    const isValidTerms = allowTerms;
    this.setState({ isValidName, isValidEmail, isValidMobile, isValidPwd, isValidConfirmPwd, isValidTerms });

    if (mobile.length < 11) {
      alert('Please input min 11 phone numbers');
      return;
    }

    if (password !== confirmPwd) {
      alert('Password does not match!');
      return;
    }

    if (!isValidEmail) {
      alert('Email is not correct! Please check again!');
      return;
    }

    if (!isValidName || !isValidEmail || !isValidMobile || !isValidPwd || !isValidConfirmPwd || !isValidTerms) return;

    this.props.signUp({ name, email, mobile, password });
  }

  onTerms = () => { }

  render() {
    const { isValidName, isValidEmail, isValidMobile, isValidPwd, isValidConfirmPwd, isValidTerms, password, confirmPwd, allowTerms } = this.state;

    return (
      <Container style={{backgroundColor: '#1A2537'}}>
        <Content padder>
          {/* <Center>
            <Text style={styles.pageTitle}>Sign Up</Text>
          </Center> */}
          <View>
            <Label style={{color: '#fff'}}>Name</Label>
            <Item error={!isValidName}>
              <Input bordered placeholder='Name' onChangeText={this.onChangeName} style={{color: '#fff'}} />
            </Item>
            <Label style={{color: '#fff'}}>Email</Label>
            <Item error={!isValidEmail}>
              <Input bordered placeholder='Email' onChangeText={this.onChangeEmail} style={{color: '#fff'}} />
            </Item>
            <Label style={{color: '#fff'}}>Mobile</Label>
            <Item error={!isValidMobile}>
              <Input bordered placeholder='Mobile' keyboardType = 'numeric' onChangeText={this.onChangeMobile} style={{color: '#fff'}} />
            </Item>
            <Label style={{color: '#fff'}}>Password</Label>
            <Item error={!isValidPwd}>
              <Input placeholder='Password' onChangeText={this.onChangePwd} secureTextEntry style={{color: '#fff'}} />
            </Item>
            <Label style={{color: '#fff'}}>Confirm Password</Label>
            <Item error={!isValidConfirmPwd}>
              <Input placeholder='Password' onChangeText={this.onChangeConfirmPwd} secureTextEntry style={{color: '#fff'}} />
            </Item>
            <CheckBox
              title='Terms & Conditions'
              iconType='ionicon'
              checkedIcon='checkbox-outline'
              uncheckedIcon='square-outline'
              checkedColor='#fff'
              checked={allowTerms}
              onPress={this.onAcceptTerms}
              containerStyle={{ backgroundColor: 'transparent', borderColor: isValidTerms ? 'transparent' : 'red' }}
              textStyle={{color: '#fff', fontFamily: 'Montserrat_bold'}}
            />
          </View>
          <Center>
            <Button style={{ paddingHorizontal: 10, backgroundColor: '#A2C2F9', borderRadius: 10 }}
              disabled={!isValidTerms}
              onPress={this.onSignUp}>
              <Text style={{fontSize: 18}}>Register</Text>
            </Button>
          </Center>
        </Content>
      </Container>
    );
  }
}

function mapStateToProps({ auth, state }) {
  return {
    auth,
    state
  };
}

const bindActions = {
  signUp,
};

export default connect(mapStateToProps, bindActions)(SignUp);
