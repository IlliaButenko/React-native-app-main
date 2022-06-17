import { SET_MARKERLIST, SET_SELECTEDMARKER, SET_CENTERCOORDS, SET_NEXTDOWNLOAD, SET_MAPNAVIGATION, SET_STOPCOLOR, SET_DONELIST } from "../actions/types";
import { createReducer } from "../utils";

const initialState = {
  markerList: [],
  doneList: [],
  selectedMarker: {},
  centerCoords: [0, 0],
  nextDownload: '',
  mapNavigation: 'google-map',
  stopColor: 'light-blue'
};

const markerReducer = createReducer(initialState, {
  [SET_MARKERLIST]: (state, { payload: markerList }) => ({ ...state, markerList: markerList }),
  [SET_DONELIST]: (state, { payload: doneList }) => ({ ...state, doneList: doneList }),
  [SET_SELECTEDMARKER]: (state, { payload: selectedMarker }) => ({ ...state, selectedMarker: selectedMarker }),
  [SET_CENTERCOORDS]: (state, { payload: centerCoords }) => ({ ...state, centerCoords: centerCoords }),
  [SET_NEXTDOWNLOAD]: (state, { payload: nextDownload }) => ({ ...state, nextDownload: nextDownload }),
  [SET_MAPNAVIGATION]: (state, { payload: mapNavigation }) => ({ ...state, mapNavigation: mapNavigation }),
  [SET_STOPCOLOR]: (state, { payload: stopColor }) => ({ ...state, stopColor: stopColor }),
});

export default markerReducer;