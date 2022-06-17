import auth from "@react-native-firebase/auth";
import { Toast } from "native-base";
import { APP_NAME } from "../config";
import { sendPostRequest } from "../utils/api";
import { HIDE_PROGRESS, SHOW_PROGRESS, SET_TOKEN, SET_USERTYPE, SET_USERDATA, AUTH_SIGNOUT } from "./types";

export function signUp(params) {
  return async (dispatch) => {
    try {
      const { name, email, mobile, password } = params;
      dispatch({ type: SHOW_PROGRESS });
      const { result, data: userData } = await sendPostRequest('/register', { name, email, mobile, password });
      dispatch({ type: HIDE_PROGRESS });
      dispatch({ type: SET_USERDATA, payload: userData });

    } catch (error) {
      return dispatch({ type: HIDE_PROGRESS });
    }
  };
}

export function signOut() {
  return async (dispatch) => {
    return dispatch({ type: AUTH_SIGNOUT });
  };
}

export function signIn(params) {
  return async (dispatch) => {
    try {
      dispatch({ type: SHOW_PROGRESS });
      const { email, password } = params;
      const res = await sendPostRequest('/loginUser', { email, password });
      const user_type = res.user_type == "driver" ? "driver" :
        (res.user.user_type === 0
          ? "admin"
          : res.user.user_type === 1
            ? "client"
            : "user");
      // Toast.show({ text: `Welcome to ${APP_NAME}`, type: 'success', duration: 2000, position: 'top' });
      dispatch({ type: HIDE_PROGRESS });

      dispatch({ type: SET_TOKEN, payload: res.token });
      dispatch({ type: SET_USERTYPE, payload: user_type });
      dispatch({ type: SET_USERDATA, payload: res.user });
    } catch (error) {
      Toast.show({ text: error.response.data.message, type: 'warning', duration: 3000 });
      return dispatch({ type: HIDE_PROGRESS });
    }
  };
}

export function updateUser(params) {
  return async (dispatch) => {
    try {
      const { userId, name, email, mobile } = params;
      dispatch({ type: SHOW_PROGRESS });
      const { result, data: userData } = await sendPostRequest('/updateUser', { userId, name, email, mobile });
      dispatch({ type: HIDE_PROGRESS });
      Toast.show({ text: `Success!`, type: 'success', duration: 2000, position: 'top' });
      dispatch({ type: SET_USERDATA, payload: userData });
    } catch (error) {
      Toast.show({ text: `Failed! Try again!`, type: 'danger', duration: 2000, position: 'top' });
      return dispatch({ type: HIDE_PROGRESS });
    }
  };
}

export function updatePwd(params) {
  return async (dispatch) => {
    try {
      const { userId, password } = params;
      dispatch({ type: SHOW_PROGRESS });
      const { result, data: userData } = await sendPostRequest('/updatePassword', { userId, password });
      dispatch({ type: HIDE_PROGRESS });
      Toast.show({ text: `Success!`, type: 'success', duration: 2000, position: 'top' });
      // dispatch({ type: SET_USERDATA, payload: userData });

    } catch (error) {
      Toast.show({ text: `Failed! Try again!`, type: 'danger', duration: 2000, position: 'top' });
      return dispatch({ type: HIDE_PROGRESS });
    }
  };
}