import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Container, Content, Text, Icon, Footer, Item, Input, Col, Row, Subtitle } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { setUsername } from '../../actions/askprofile';

class AskUsername extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userName: this.props.auth.userData.userName,
      isValidUserName: true
    }
  }

  onChangeUserName = (userName) => {
    this.setState({
      userName,
      isValidUserName: true
    });
  }

  onNext = () => {
    const { userName } = this.state;
    if (!userName) {
      this.setState({ isValidUserName: false });
      return;
    }

    this.props.setUsername(userName, () => {
      const { navigation } = this.props;
      navigation.navigate('AskPhoneNumber');
    });
  }

  onTerms = () => {
  }

  render() {
    const { isValidUserName, userName } = this.state;

    return (
      <Container>
        <Content padder>
          <Center style={{ marginTop: screenSize.height * 0.1, marginBottom: 20 }}>
            <Text style={styles.pageTitle}>Create your username</Text>
            <Text style={styles.pageTitleSub}>Pick a cool username</Text>
          </Center>
          <Center>
            <Item rounded error={!isValidUserName}>
              <Input placeholder='Write a Username' onChangeText={this.onChangeUserName} defaultValue={userName} />
            </Item>
          </Center>
        </Content>
        <Footer>
          <Col>
            <Button rounded block style={{ marginHorizontal: 10 }} onPress={this.onNext}>
              <Text>Next</Text>
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
  setUsername,
};

export default connect(mapStateToProps, bindActions)(AskUsername);
