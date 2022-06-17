import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { CheckBox } from '@react-native-community/checkbox';
import { CheckBox } from 'react-native-elements';
import { TouchableOpacity } from 'react-native';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row, Left, Body, Label, View, Toast } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { validateEmail, validatePhoneNumber } from '../../utils';
import { updateUser, updatePwd, signOut } from '../../actions/auth';
import { MIN_PASSWORD_LEN } from '../../config';

class Profile extends Component {
  state = {
    name: this.props.auth.userData.name,
    email: this.props.auth.userData.email,
    mobile: this.props.auth.userData.phone,
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
      isValidTerms: true
    })
  }

  updateDetails = async () => {
    const { name, email, mobile } = this.state;
    const userId = this.props.auth.userData.user.id;
    const isValidName = name.length ? true : false;
    const isValidEmail = validateEmail(email);
    const isValidMobile = validatePhoneNumber(mobile);
    this.setState({ isValidName, isValidEmail, isValidMobile });

    if (!isValidName || !isValidEmail || !isValidMobile) return;

    await this.props.updateUser({ userId, name, email, mobile });
  }

  updatePwd = () => {
    const userId = this.props.auth.userData.id;
    const { password, confirmPwd } = this.state;
    const isValidPwd = password.length >= MIN_PASSWORD_LEN;
    const isValidConfirmPwd = password == confirmPwd;
    this.setState({ isValidPwd, isValidConfirmPwd });

    if (!isValidPwd || !isValidConfirmPwd) return;

    this.props.updatePwd({ userId, password });
  }

  onSignout = () => {
    this.props.signOut();
  }

  onTerms = () => { }

  render() {
    const { isValidName, isValidEmail, isValidMobile, isValidPwd, isValidConfirmPwd, name, email, mobile } = this.state;

    return (
      <Container style={{ backgroundColor: '#1A2537' }}>
        <Content padder>
          {/* <Center>
            <Text style={styles.pageTitle}>Sign Up</Text>
          </Center> */}
          {/* <View>
            <Label style={{ color: '#fff' }}>Name</Label>
            <Item error={!isValidName}>
              <Input bordered placeholder='Name' onChangeText={this.onChangeName} style={{ color: "#fff" }} value={name} />
            </Item>
            <Label style={{ color: '#fff' }}>Email</Label>
            <Item error={!isValidEmail}>
              <Input bordered placeholder='Email' onChangeText={this.onChangeEmail} style={{ color: "#fff" }} value={email} />
            </Item>
            <Label style={{ color: '#fff' }}>Mobile</Label>
            <Item error={!isValidMobile}>
              <Input bordered placeholder='Mobile' onChangeText={this.onChangeMobile} style={{ color: "#fff" }} value={mobile} />
            </Item>
            <Center>
              <Button style={{ paddingHorizontal: 10, backgroundColor: '#A2C2F9', borderRadius: 10 }} onPress={this.updateDetails}>
                <Text style={{ fontSize: 18 }}>Update Details</Text>
              </Button>
            </Center>
          </View> */}
          <View style={{ marginTop: 20 }}>
            <Label style={{ color: '#fff' }}>Password</Label>
            <Item error={!isValidPwd}>
              <Input placeholder='Password' onChangeText={this.onChangePwd} secureTextEntry style={{ color: "#fff" }} />
            </Item>
            <Label style={{ color: '#fff' }}>Confirm Password</Label>
            <Item error={!isValidConfirmPwd}>
              <Input placeholder='Confirm Password' onChangeText={this.onChangeConfirmPwd} secureTextEntry style={{ color: "#fff" }} />
            </Item>
          </View>
          <Center>
            <Button style={{ paddingHorizontal: 10, backgroundColor: '#A2C2F9', borderRadius: 10 }} onPress={this.updatePwd}>
              <Text style={{ fontSize: 16 }}>Change Password</Text>
            </Button>
          </Center>
          <Center style={{ marginTop: 20 }}>
            <Button style={{ paddingHorizontal: 10, backgroundColor: '#A2C2F9', borderRadius: 10 }} onPress={this.onSignout}>
              <Icon name="log-out-outline" />
              <Text style={{ fontSize: 16 }}>Sign Out</Text>
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
  updateUser,
  updatePwd,
  signOut
};

export default connect(mapStateToProps, bindActions)(Profile);
