import { sendRequest } from "../utils/api";
import { HIDE_PROGRESS, SET_PHONENUMBER, SET_USERNAME, SHOW_PROGRESS } from "./types";

export function setUsername(userName, callback) {
  return async (dispatch, getState) => {
    const { auth: { userData: { uid } } } = getState();
    dispatch({ type: SHOW_PROGRESS });
    await sendRequest('/auth/setUsername', { uid, userName });
    dispatch({ type: SET_USERNAME, payload: userName });
    dispatch({ type: HIDE_PROGRESS });
    callback();
  }
}

export function verifyPhoneNumber(phoneNumber, callback) {
  return async (dispatch, getState) => {
    dispatch({ type: SHOW_PROGRESS });
    const { auth: { userData: { uid } } } = getState();
    const { result, data } = await sendRequest('/auth/verifyPhoneNumber', { uid, phoneNumber });
    dispatch({ type: HIDE_PROGRESS });
    callback(data);
  }
}

export function confirmPhoneCode(params, callback) {
  return async (dispatch, getState) => {
    const { phoneNumber, code, sid } = params;
    const { auth: { userData: { uid } } } = getState();
    dispatch({ type: SHOW_PROGRESS });
    const { result } = await sendRequest('/auth/confirmPhoneCode', { uid, phoneNumber, code, sid });
    dispatch({ type: HIDE_PROGRESS });
    dispatch({ type: SET_PHONENUMBER, payload: phoneNumber });
    callback(result);
  };
}