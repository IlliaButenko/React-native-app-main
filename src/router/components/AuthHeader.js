import React, { Component } from "react";
import { Body, Button, Header, Icon, Left, Right, Text } from "native-base";
import { Material } from "../../styles";

class AuthHeader extends Component {
  constructor(props) {
    super(props);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onLogout = () => { }

  render() {
    const { navigation } = this.props;
    if (navigation.isFirstRouteInParent() || (navigation.state.routeName === 'SignIn'))
      return (null);

    return (
      <Header transparent style={{ flexDirection: 'row', backgroundColor: '#333' }} iosBarStyle={Material.iosStatusbar}>
        <Button transparent onPress={this.onBack}>
          <Icon name='chevron-back' style={{ color: '#fff' }} />
        </Button>
        <Body style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 30, color: '#fff' }}>{navigation.state.routeName}</Text>
        </Body>
        <Button transparent>
          <Icon name='chevron-back' style={{ color: 'transparent' }} />
        </Button>
      </Header>
    );
  }
}

export default AuthHeader;