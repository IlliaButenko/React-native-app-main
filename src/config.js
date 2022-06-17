import RNFS from 'react-native-fs';

export const APP_NAME = 'UKDriverDEPOT';

// export const SERVER_URL = "http://10.0.2.2:8000/api";
export const SERVER_URL = "https://ukcourier.a2hosted.com/api";
export const AREA_URL = "https://driverapp.ukcourier.a2hosted.com/api";
export const MIN_PASSWORD_LEN = 6;
export const PHONE_CODE_COUNT = 6;


export const TileConstants = {
  TILE_FOLDER: `${RNFS.DocumentDirectoryPath}/tiles`,
  MAP_URL: 'http://a.tile.openstreetmap.org',
}
