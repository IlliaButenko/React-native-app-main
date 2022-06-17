import React, { Component } from "react";
import { Body, Button, Header, Icon, Left, Right, Text, Drawer, View } from "native-base";
import { StatusBar } from "react-native";
import { connect } from "react-redux";

import { signOut } from '../../actions/auth';
import { Material } from "../../styles";

class MainHeader extends Component {
  constructor(props) {
    super(props);
  }

  openDrawer = () => {
    this.props.navigation.openDrawer(); 
  }

  onLogout = () => {
    this.props.signOut();
  }

  render() {
    const { navigation } = this.props;
    const routeIndex = navigation.state.index;
    
    return (
      <Header transparent iosBarStyle={Material.iosStatusbar} style={{flexDirection: 'row', backgroundColor: '#1F2124'}}>
        <Button transparent onPress={this.openDrawer}>
          <Icon name='menu' style={{ color: Material.whiteColor, fontSize: 30 }} />
        </Button>
        <Body style={{alignItems: 'center'}}>
          <Text style={{color: Material.whiteColor}}>{navigation.state.routes[routeIndex].routeName}</Text>
        </Body>
        <Button transparent>
          {/* <Icon name='log-out-outline' style={{ color: Material.whiteColor, fontSize: 30 }} /> */}
        </Button>
      </Header>
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
  signOut
};
export default connect(mapStateToProps, bindActions)(MainHeader);
