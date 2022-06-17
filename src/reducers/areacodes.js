import { SET_DOWNLOADSTATES } from "../actions/types";
import { createReducer } from "../utils";

const initialState = {
  downloadStates: [],
};

const areacodesReducer = createReducer(initialState, {
  [SET_DOWNLOADSTATES]: (state, { payload: downloadStates }) => ({ ...state, downloadStates: downloadStates }),
});

export default areacodesReducer;