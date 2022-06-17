import axios from "axios";
import { SERVER_URL, AREA_URL } from "../config";

export function sendPostRequest(url, data, db_type) {
  return new Promise((resolve, reject) => {
    if (db_type == "area") {
      url = `${AREA_URL}${url}`;
    } else {
      url = `${SERVER_URL}${url}`;
    }
    console.log('sendRequest111', url);
    axios({
      method: 'POST',
      url,
      data,
    }).then((response) => {
      resolve(response.data);
    }).catch(error => {
      console.log('Axios Error', error);
      reject(error);
    })
  });
}

export function sendGetRequest(url, data) {
  return new Promise((resolve, reject) => {
    url = `${SERVER_URL}${url}`;
    console.log('sendRequest', url);
    axios({
      method: 'GET',
      url,
      data,
    }).then((response) => {
      resolve(response.data);
    }).catch(error => {
      console.log('Axios Error', error);
      reject(error);
    })
  });
}

export function executeQuery (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction((trans) => {
      trans.executeSql(sql, params, (trans, results) => {
        resolve(results);
      },
        (error) => {
          reject(error);
        });
    });
  });
}