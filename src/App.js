import React from 'react';
import { Provider } from 'react-redux';
import { StyleProvider } from 'native-base';
import { PersistGate } from 'redux-persist/integration/react';

import {store, persistor} from './store';
import AppContainer from './containers/AppContainer';
import getTheme from '../native-base-theme/components';
import material from '../native-base-theme/variables/material';
import LoadingScreen from './components/LoadingScreen';

import SQLite from 'react-native-sqlite-storage';

global.db = SQLite.openDatabase(
  {
    name: 'SQLite',
    location: 'default',
    createFromLocation: '~driver_postcodes.db',
  },
  () => {
    console.log('sql lite database connected');
  },
  error => {
    console.log("ERROR: " + error);
  }
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<LoadingScreen />}
        persistor={persistor}
      >
        <StyleProvider style={getTheme(material)}>
          <AppContainer />
        </StyleProvider>
      </PersistGate>
    </Provider>
  );
}
