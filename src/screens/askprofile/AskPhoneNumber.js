import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row, Subtitle } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { verifyPhoneNumber } from '../../actions/askprofile';
import { refinePhoneNumber, validatePhoneNumber } from '../../utils';

class AskPhoneNumber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: this.props.auth.userData.phoneNumber,
      isValidPhoneNumber: true
    }
  }

  onChangePhoneNumber = (phoneNumber) => {
    this.setState({
      phoneNumber,
      isValidPhoneNumber: true
    });
  }

  onNext = () => {
    let { phoneNumber } = this.state;
    const isValidPhoneNumber = validatePhoneNumber(phoneNumber);
    this.setState({ isValidPhoneNumber });
    if (!isValidPhoneNumber) return;

    phoneNumber = refinePhoneNumber(phoneNumber);
    this.props.verifyPhoneNumber(phoneNumber, (data) => {
      const { sid } = data;
      const { navigation } = this.props;
      navigation.navigate('AskVerifyCode', { phoneNumber, sid });
    });
  }

  render() {
    const { isValidPhoneNumber, phoneNumber } = this.state;

    return (
      <Container>
        <Content padder>
          <Center style={{ marginTop: screenSize.height * 0.1, marginBottom: 20 }}>
            <Text style={styles.pageTitle}>Input your Phone Number</Text>
            <Text style={styles.pageTitleSub}>Your phone number</Text>
          </Center>
          <Center>
            <Item rounded error={!isValidPhoneNumber}>
              <Input placeholder='Write your phone number' onChangeText={this.onChangePhoneNumber} defaultValue={phoneNumber} />
            </Item>
          </Center>
        </Content>
        <Footer>
          <Col>
            <Button rounded block style={{ marginHorizontal: 10 }} onPress={this.onNext}>
              <Text>Send Code</Text>
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
};

export default connect(mapStateToProps, bindActions)(AskPhoneNumber);
