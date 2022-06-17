import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {persistStore} from 'redux-persist';

import reducers from '../reducers';

const _store = createStore(reducers, {}, applyMiddleware(thunk));

export const persistor = persistStore(_store);
export const store = _store;
