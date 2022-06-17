import React, { Component } from "react";
import { Alert } from "react-native";
import { Body, Button, Header, Icon, Left, Right, Text } from "native-base";

import { Material } from "../../styles";
import { signOut } from '../../actions/auth';
import { connect } from "react-redux";
import { APP_NAME } from "../../config";

class AskProHeader extends Component {
  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onLogout = () => {
    Alert.alert(
      APP_NAME,
      'Do you wanna sign out?',
      [
        {
          text: 'Yes',
          onPress: () => this.props.signOut()
        },
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel'
        },
      ],
      { cancelable: true }
    );
  }

  render() {
    const { navigation } = this.props;
    const { routeName } = navigation.state;
    const isShowLeft = routeName == 'AskVerifyCode';

    return (
      <Header transparent iosBarStyle={Material.iosStatusbar}>
        {isShowLeft ? <Left>
          <Button transparent onPress={this.onBack}>
            <Icon name='chevron-back' style={{ color: Material.brandPrimary }} />
          </Button>
        </Left> : null}
        <Right>
          <Button transparent onPress={this.onLogout} hasText>
            <Text style={{ color: Material.brandPrimary }} uppercase={false}>Logout</Text>
          </Button>
        </Right>
      </Header>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    auth
  };
}

const bindActions = {
  signOut
};

export default connect(mapStateToProps, bindActions)(AskProHeader);