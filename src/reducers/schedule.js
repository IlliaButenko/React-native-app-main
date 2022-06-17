import { SET_DRIVERPERFORMANCE } from "../actions/types";
import { createReducer } from "../utils";

const initialState = {
  performanceData: null
};

const scheduleReducer = createReducer(initialState, {
  [SET_DRIVERPERFORMANCE]: (state, { payload: performanceData }) => ({ ...state, performanceData })
});

export default scheduleReducer;