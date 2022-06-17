import React, { Component } from 'react';
import { Button, Container, Content, Text, Icon } from 'native-base';

import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';

class Home extends Component {

  render() {
    return (
      <Container>
        <Content padder>
          <Center style={{marginVertical: screenSize.height * 0.3}}>
            <Text style={styles.logoTitle}>Home</Text>
          </Center>
        </Content>
      </Container>
    );
  }
}

export default Home;
