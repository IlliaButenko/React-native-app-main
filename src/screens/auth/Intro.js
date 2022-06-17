import React, { Component } from 'react';
import { Body, Button, Container, Content, Footer, Header, Left, Right, Root, Text, Title, Toast, Icon, H1, Subtitle, H3, Row } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';

class Intro extends Component {
  onSignUp = () => {
    const {navigation} = this.props;
    navigation.navigate('SignUp');
  }

  onApple = () => { }

  onFacebook = () => { }

  onLogin = () => {
    const {navigation} = this.props;
    navigation.navigate('SignIn');
  }

  render() {
    return (
      <Container>
        <Content padder>
          <Center style={{ marginTop: screenSize.height * 0.25, marginBottom: 20 }}>
            <Text style={styles.logoTitle}>JCI</Text>
            <Text style={{ color: Material.touchableTextColor }}>Just Checking In - Mental Health</Text>
          </Center>

          <Button rounded block primary style={{ margin: 10 }} iconLeft onPress={this.onSignUp}>
            <Text>Sign Up</Text>
          </Button>

          <Button rounded block dark style={{ margin: 10 }} iconLeft onPress={this.onApple}>
            <Icon name='logo-apple' />
            <Text>Continue with Apple</Text>
          </Button>

          <Button rounded block style={{ margin: 10, backgroundColor: Material.facebookColor }} onPress={this.onFacebook}>
            <Icon name="logo-facebook" />
            <Text>Continue with Facebook</Text>
          </Button>

          <Center>
            <Row>
              <Text style={{ paddingVertical: 12, color: Material.blackColor }}>Already have an account.</Text>
              <Button transparent onPress={this.onLogin}>
                <Text uppercase={false}>Log in</Text>
              </Button>
            </Row>
          </Center>

        </Content>
      </Container>
    );
  }
}

export default Intro;
