import React, { Component } from 'react';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row, Subtitle, Toast } from 'native-base';
import { connect } from 'react-redux';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { confirmPhoneCode, verifyPhoneNumber } from '../../actions/askprofile';
import { PHONE_CODE_COUNT } from '../../config';

class AskVerifyCode extends Component {
  constructor(props) {
    super(props);

    const { phoneNumber, sid } = this.props.navigation.state.params;
    this.state = {
      phoneNumber,
      sid,
      code: '',
    };
  }

  onChangeVerificationCode = (code) => {
    this.setState({ code }, () => {
      if (code.length === PHONE_CODE_COUNT) this.onConfirm();
    });
  }

  onResendCode = () => {
    const { phoneNumber } = this.state;
    this.props.verifyPhoneNumber(phoneNumber, () => {
      Toast.show({ text: 'Verification code is sent.', type: 'success', duration: 2000, position: 'top' });
    });
  }

  onConfirm = () => {
    const { phoneNumber, code, sid } = this.state;
    if (code.length != PHONE_CODE_COUNT) return;

    this.props.confirmPhoneCode({ phoneNumber, code, sid }, (result) => {
      if (result) {
        Toast.show({ text: 'Phone number is verified successfully.', type: 'success', duration: 2000, position: 'top' });
      } else {
        Toast.show({ text: 'Sorry, the verification is failed.', type: 'warning', duration: 2000, position: 'top' });
      }
    });
  }

  render() {
    const { phoneNumber, code } = this.state;
    return (
      <Container>
        <Content padder>
          <Center style={{ marginTop: screenSize.height * 0.1, marginBottom: 20 }}>
            <Text style={styles.pageTitle}>Input Verification Code</Text>
            <Text style={styles.pageTitleSub}>{phoneNumber}</Text>
          </Center>
          <Center>
            <CodeField
              value={code}
              onChangeText={this.onChangeVerificationCode}
              cellCount={PHONE_CODE_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  style={[styles.codeCell, isFocused && styles.focusCell]}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
          </Center>
          <Center>
            <Row>
              <Text style={{ paddingVertical: 10, color: Material.blackColor }}>Haven't you received the code?</Text>
              <Button transparent onPress={this.onResendCode} style={{ padding: 0 }}>
                  <Text uppercase={false}>Resend</Text>
                </Button>
            </Row>
          </Center>
        </Content>
        <Footer>
          <Col>
            <Button rounded block style={{ marginHorizontal: 10 }} onPress={this.onConfirm}>
              <Text>Confirm</Text>
            </Button>
          </Col>
        </Footer>
      </Container>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    auth
  };
}

const bindActions = {
  verifyPhoneNumber,
  confirmPhoneCode
};

export default connect(mapStateToProps, bindActions)(AskVerifyCode);
