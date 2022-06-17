import {persistCombineReducers} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from './auth';
import state from './state';
import marker from './marker';
import areacodes from './areacodes';
import schedule from './schedule';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  timeout: null,
  whitelist: ['auth', 'marker', 'areacodes'],
};

export default persistCombineReducers(persistConfig, {
  auth,
  state,
  marker,
  areacodes,
  schedule
});
