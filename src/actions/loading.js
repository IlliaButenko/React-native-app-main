import { HIDE_PROGRESS, SHOW_PROGRESS } from "./types";


export function showProgress() {
  return (dispatch) => {
    dispatch({ type: SHOW_PROGRESS });
  }
}

export function hideProgress() {
  return (dispatch) => {
    dispatch({ type: HIDE_PROGRESS });
  }
}