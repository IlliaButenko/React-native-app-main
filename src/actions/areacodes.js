import { sendGetRequest, sendPostRequest, executeQuery } from "../utils/api";
import { SET_DOWNLOADSTATES } from "./types";


export async function getPostcodes(params, callback) {
  try {
    const data = await sendPostRequest('/getAreaData', params, 'area');
    callback(data);
  } catch (error) {
    console.log('error', error)
  }
}

export function runQuery(params, callback) {
  return async (dispatch, getState) => {
    const { query, queryParams } = params;
    // dispatch({ type: SHOW_PROGRESS });
    const data = await executeQuery(query, queryParams);
    // dispatch({ type: HIDE_PROGRESS });
    callback(data);
  }
}

export function setDownloadStates(downloadStates) {
  return (dispatch) => {
    dispatch({ type: SET_DOWNLOADSTATES, payload: downloadStates });
  }
}
