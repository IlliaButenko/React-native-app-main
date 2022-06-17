import axios from "axios";
import { SERVER_URL } from "../config";

export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

export function validateEmail(text) {
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return reg.test(text);
}

export function validatePhoneNumber(phoneNumber) {
  return phoneNumber.match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s./0-9]*$/g);
}

export const refinePhoneNumber = number => {
  if (!number) return false;
  if (number.indexOf("+") !== 0) {
    number = "+1" + number;
  } else if (number.indexOf("+1") !== 0) {
    return false
  }
  return '+' + number.replace(/[^\d]/g, '');
}

export const isProfileCompleted = (userData, userType) => {
  if (!userData) return false;
  if (userType == "driver") {
    return true;
  } else if (userType == "admin") {
    return true;
  } else {
    if (userData.is_active) {
      return true;
    } else {
      return false;
    }
  }
  // if (!userData) return false;
  // const { name, email, phone } = userData;
  // const is_active = user
  // return name && email && phone;
  return false;
}