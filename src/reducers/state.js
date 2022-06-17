import { SHOW_PROGRESS, HIDE_PROGRESS } from "../actions/types";
import { createReducer } from "../utils";

const initialState = {
  isProgressing: false,
};

const stateReducer = createReducer(initialState, {
  [SHOW_PROGRESS]: state => ({...state, isProgressing: true}),
  [HIDE_PROGRESS]: state => ({...state, isProgressing: false}),
});

export default stateReducer;