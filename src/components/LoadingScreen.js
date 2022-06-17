import React from 'react';
import { Spinner, View } from "native-base";
import styles from '../styles';

const LoadingScreen = () => (
  <View style={styles.overlay}>
    <Spinner style={{ flex: 1 }} />
  </View>
);

export default LoadingScreen;