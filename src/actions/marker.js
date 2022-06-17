import { SET_MARKERLIST, SET_DONELIST, SET_SELECTEDMARKER, SET_CENTERCOORDS, SET_NEXTDOWNLOAD, SET_MAPNAVIGATION, SET_STOPCOLOR } from "./types";

export function setMarkerlist(markers) {
  return (dispatch) => {
    dispatch({ type: SET_MARKERLIST, payload: markers });
  }
}

export function setDonelist(doneList) {
  return (dispatch) => {
    dispatch({ type: SET_DONELIST, payload: doneList });
  }
}

export function setSelectedMarker(selectedMarker) {
  return (dispatch) => {
    dispatch({ type: SET_SELECTEDMARKER, payload: selectedMarker });
  }
}

export function setCenterCoords(centerCoords) {
  return (dispatch) => {
    dispatch({ type: SET_CENTERCOORDS, payload: centerCoords });
  }
}

export function setNextDownload(nextDownload) {
  return (dispatch) => {
    dispatch({ type: SET_NEXTDOWNLOAD, payload: nextDownload });
  }
}

export function setMapNavigation(mapNavigation) {
  return (dispatch) => {
    dispatch({ type: SET_MAPNAVIGATION, payload: mapNavigation });
  }
}

export function setStopColor(stopColor) {
  return (dispatch) => {
    dispatch({ type: SET_STOPCOLOR, payload: stopColor });
  }
}