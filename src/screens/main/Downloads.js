import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, ScrollView, View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Button, Container, Text, Icon, Header, Item, Input, Picker, Label } from 'native-base';
import Svg, { G, Path, LinearGradient, Stop } from "react-native-svg"

import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';

import SQLite from 'react-native-sqlite-storage';
import MapboxGL, { Logger } from "@react-native-mapbox-gl/maps";
import NetInfo from '@react-native-community/netinfo';

import { signOut } from '../../actions/auth';
import { showProgress, hideProgress } from '../../actions/loading';
import { runQuery, getPostcodes, setDownloadStates } from '../../actions/areacodes';
import { setNextDownload, setMapNavigation, setStopColor } from '../../actions/marker';
// import Animated from 'react-native-reanimated';
import { Easing } from 'react-native';
const { width, height } = Dimensions.get('window');

Logger.setLogCallback(log => {
  const { message } = log;

  // expected warnings - see https://github.com/mapbox/mapbox-gl-native/issues/15341#issuecomment-522889062
  if (
    message.match('Request failed due to a permanent error: Canceled') ||
    message.match('Request failed due to a permanent error: Socket Closed')
  ) {
    return true;
  }
  return false;
});

class Downloads extends Component {
  constructor(props) {
    super(props);
    SQLite.DEBUG = true;
    this.state = {
      searchKey: '',
      areaList: [],
      filteredList: [],
      downloadCount: 0,
      downloadStarted: 0,
      netStatus: true,
      showDownloadAreaDlg: false,
      mapDownloadPercentage: 0,
      rotateDegree: 0
    };
    this.animation = new Animated.Value(0);
  }

  filteredCodes = [];
  spinValue = new Animated.Value(0);
  spin = null;

  // areaList = [
  // ];
  // filteredList = this.areaList;

  /**
  * Execute sql queries
  * 
  * @param sql
  * @param params
  * 
  * @returns {resolve} results
  */

  setTileLimit = () => {
    MapboxGL.offlineManager.setTileCountLimit(10000000);
  }

  getAreas = async () => {
    let params = {
      query: "select * from tb_areacodes order by is_download desc",
      queryParams: []
    };
    await this.props.runQuery(params, (data) => {
      let areaResults = data.rows;
      let areaCodes = [];
      let count = 0;
      for (let i = 0; i < areaResults.length; i++) {
        areaCodes.push(areaResults.item(i));
        if (areaResults.item(i).is_download == 1 || areaResults.item(i).is_download == "1") {
          count++;
        }
      }
      this.setState({
        areaList: areaCodes,
        filteredList: areaCodes,
        downloadCount: count
      });
      this.filteredCodes = this.state.filteredList;
    });
  }

  downloadAreaMap = async (item, index) => {
    const { netStatus } = this.state;
    if (!netStatus) {
      this.showAlert('No internet connection. Go online to download Offline Map Areas.');
      return null;
    }
    if (this.state.downloadCount >= 4) {
      Alert.alert(
        'Download Limitation',
        'You have reached the limit of Offline Maps. Do you want to delete current maps and download new one ?',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ],
        { cancelable: false }
      );
      return null;
    }

    try {
      this.setState({ showDownloadAreaDlg: true });
      Animated.loop(
        Animated.timing(
          this.spinValue,
          {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear, // Easing is an additional import from react-native
            useNativeDriver: true  // To make use of native driver for performance
          }
        )
      ).start()

      // let interval = setInterval(() => this.setState({ rotateDegree: this.state.rotateDegree + 18 }), 50);

      this.setState({ downloadStarted: 1, filteredList: this.filteredCodes });
      let downloadIndex = 0;

      await this.removeAreaInfo(item.area_code);
      while (true) {
        const count = await this.downloadAreacodes(item, index, downloadIndex);
        if (count < 10000) break;
        downloadIndex++;
      }
      this.setState({ showDownloadAreaDlg: false });

      // clearInterval(interval);

      this.setState({ nextDownload: '' });

      let updateParams = {
        query: "update tb_areacodes set is_download = ? where id = ?;",
        queryParams: [1, item.id]
      };
      await this.props.runQuery(updateParams, (data) => {
        // let areaCodes = this.state.areaList;
        let downloadCount = this.state.downloadCount;
        downloadCount++;
        this.filteredCodes[index].is_download = 1;
        this.filteredCodes.sort(function (a, b) {
          return b.is_download - a.is_download;
        });
        this.setState({
          filteredList: this.filteredCodes,
          downloadCount: downloadCount
        })
      })

      await this.downloadOfflineMap(item, index);

      // this.props.hideProgress();
    } catch (error) {
      console.log('EEEEEEEEEE', error);
      // this.props.hideProgress();
    }
  }

  downloadOfflineMap = async (item, index) => {
    return new Promise(async (resolve, reject) => {
      const options = {
        name: `ukcourier-${item.area_code.toLowerCase()}`,
        styleURL: MapboxGL.StyleURL.Street,
        bounds: [
          [item.nelng, item.nelat],
          [item.swlng, item.swlat],
        ],
        minZoom: 13,
        maxZoom: 13,
      };
      // this.props.showProgress();
      await MapboxGL.offlineManager.deletePack(`ukcourier-${item.area_code.toLowerCase()}`);
      MapboxGL.offlineManager.createPack(options, async (offlineRegion, downloadOfflineStatus) => {
        // this.filteredCodes[index].is_download = Math.round((downloadOfflineStatus.percentage + Number.EPSILON) * 100) / 10000;
        this.setState({
          mapDownloadPercentage: downloadOfflineStatus.percentage.toFixed(2)
        });
        // console.log('offline progress', this.state.mapDownloadPercentage);
        if (downloadOfflineStatus.state == 1) {
        } else if (downloadOfflineStatus.state == 2) {
          // this.props.hideProgress();
          this.filteredCodes[index].is_download_map = 1;
          this.setState({
            filteredList: this.filteredCodes,
          });
          console.log('download finished');

          let updateParams = {
            query: "update tb_areacodes set is_download_map = ? where id = ?;",
            queryParams: [1, item.id]
          };
          await this.props.runQuery(updateParams, (data) => {
            // let areaCodes = this.state.areaList;
            this.filteredCodes[index].is_download_map = 1;
            this.setState({
              filteredList: this.filteredCodes,
            })
          })
          this.setState({ downloadStarted: 0 });
          resolve();
        }
      });
      console.log('download map');
    });
  }

  downloadAreacodes = async (item, index, downloadIndex) => {
    return new Promise((resolve, reject) => {
      let params = {
        code: item.area_code,
        downloadIndex
      };
      console.log('paramssss', params);
      let postCodes = [];
      getPostcodes(params, async (data) => {
        if (typeof data == 'string') data = JSON.parse(data);
        postCodes = data.postcodes;

        let createParams = {
          query: "CREATE TABLE IF NOT EXISTS pc_" + item.area_code.toLowerCase() + " (id	INTEGER PRIMARY KEY NOT NULL, postcode	varchar(10), address	varchar(191), latitude	varchar(30), longitude	varchar(30));",
          queryParams: []
        }
        await this.props.runQuery(createParams, (data) => { });

        let insertParams = {
          query: "",
          queryParams: []
        }
        insertParams.query = 'INSERT INTO pc_' + item.area_code.toLowerCase() + ' (postcode, address, latitude, longitude) VALUES ';
        for (let i = 0; i < postCodes.length; i++) {
          insertParams.query += '("' + postCodes[i].postcode + '", "' + postCodes[i].address + '", "' + postCodes[i].latitude + '", "' + postCodes[i].longitude + '")';
          if (i != postCodes.length - 1) {
            insertParams.query += ",";
          }
        }
        console.log(downloadIndex, ' LENGTH: ', postCodes.length, '  SIZE: ', insertParams.query.length);
        insertParams.query += ";";
        await this.props.runQuery(insertParams, (data) => { });
        resolve(postCodes.length);
      });
    });
  }

  removeAreaMap = async (item, index) => {
    Alert.alert(
      'Alert',
      'Do you want to delete current maps?',
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: 'OK', onPress: async () => {
            await MapboxGL.offlineManager.deletePack(`ukcourier-${item.area_code.toLowerCase()}`);
            await MapboxGL.offlineManager.unsubscribe(`ukcourier-${item.area_code.toLowerCase()}`);

            await this.removeAreaInfo(item.area_code);

            let updateParams = {
              query: "update tb_areacodes set is_download = ? where id = ?;",
              queryParams: [0, item.id]
            }
            await this.props.runQuery(updateParams, (data) => {
              // let areaCodes = this.state.areaList;
              let downloadCount = this.state.downloadCount;
              downloadCount--;
              this.filteredCodes[index].is_download = 0;
              this.filteredCodes.sort(function (a, b) {
                return b.is_download - a.is_download;
              });
              this.setState({
                filteredList: this.filteredCodes,
                downloadCount: downloadCount
              })
            })
          }
        },
      ],
      { cancelable: true }
    );
  }
  removeAreaInfo = async (code) => {
    let deleteParams = {
      query: "DROP TABLE IF EXISTS pc_" + code.toLowerCase() + ";",
      queryParams: []
    }
    await this.props.runQuery(deleteParams, (data) => {
      console.log('remove all');
    })
  }

  unsubscribe = null;
  async componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      this.setState({ netStatus: state.isConnected });
    });

    await this.setTileLimit();
    await this.getAreas();

    const { navigation } = this.props;
    if (navigation && navigation.state && navigation.state.params) {
      const { nextDownload } = this.props.navigation.state.params;
      this.nextDownload(nextDownload);
    }

    // First set up animation 
    // Animated.loop(
    //   Animated.timing(
    //     this.spinValue,
    //     {
    //       toValue: 1,
    //       duration: 1000,
    //       easing: Easing.linear, // Easing is an additional import from react-native
    //       useNativeDriver: true  // To make use of native driver for performance
    //     }
    //   )
    // ).start()
  }

  componentWillUnmount() {
    // Unsubscribe
    if (this.unsubscribe != null) this.unsubscribe();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    const { navigation: newNavigation } = newProps;
    const { state: { params: { nextDownload: newNextDownload = null } = {} } = {} } = newNavigation;
    this.nextDownload(newNextDownload);
  }

  nextDownload = (nextDownload) => {
    // console.log('nextdownloadddddddddd', nextDownload);
    const index = this.state.filteredList.findIndex(item => item.area_code === nextDownload);
    if (index > -1 && !this.state.filteredList[index].is_download) {
      this.setState({ nextDownload });
      this.downloadAreaMap(this.state.filteredList[index], index);
    }
  }

  onChangeSearch = (searchKey) => {
    this.setState({ searchKey });
    if (searchKey) {
      this.setState({
        filteredList: this.state.areaList.filter(item => {
          return item.area_code.toLowerCase().includes(searchKey.toLowerCase())
        })
      });
      this.filteredCodes = this.state.filteredList;
    } else {
      this.setState({ filteredList: this.state.areaList });
      this.filteredCodes = this.state.filteredList;
    }
  }

  onCancelSearch = async () => {
    this.onChangeSearch('');
    // const offlinePacks = await MapboxGL.offlineManager.getPacks();
    // console.log('offline packs', offlinePacks);
  }

  showAlert = (text) => {
    Alert.alert(
      'Alert',
      text,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') }
      ],
      { cancelable: false }
    );
  }

  setMapNav = (item) => {
    console.log('navigation value', item);
    this.props.setMapNavigation(item.value);
  }

  setMarkerColor = (item) => {
    this.props.setStopColor(item.value);
  }

  render() {
    const { filteredList, downloadStarted, downloadCount, showDownloadAreaDlg, nextDownload, mapDownloadPercentage } = this.state;
    const { mapNavigation, stopColor } = this.props.marker;
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })

    return (
      <>
        <Container style={{ backgroundColor: '#1A2537' }}>
          <Modal isVisible={showDownloadAreaDlg}>
            <View style={{ backgroundColor: 'transparent', width: '100%', minHeight: 80, padding: 10, marginTop: 250, alignItems: 'center' }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ textAlign: 'center', color: '#fff' }}>Offline Maps preparing to download</Text>
                <Text style={{ textAlign: 'center', color: '#fff' }}>Please wait...</Text>
              </View>
              <Animated.View
                style={{ transform: [{ rotate: spin }] }} >
                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={30} height={30}
                  rotation={90}
                >
                  <Path
                    d="M465.1 110.7C415.9 40.1 337 .6 255.1 1.2c-32.7.3-66 6.9-98.1 20.3C79 54.2 22.6 122.9 6.1 205.4L3.7 218l86.4 32.6 2.7-18.5c8.1-56.5 45.9-105.5 98.7-127.9 19.8-8.1 41.4-12.6 63.6-12.9 50.7-.6 103.5 21.5 137.7 73.5l-47.7 35.6L512 262.2V76.3l-46.9 34.4z"
                    fill="#bf90ee"
                  />
                  <Path
                    d="M421.6 261.3l-2.4 18.2c-8.4 56.5-46.2 105.2-99 127.7-20.1 8.4-42.3 13.8-65.1 13.8-50.1 0-102-22.8-135.9-74.5l47.4-35.3-138-52L0 249.4V435l46.9-34.4c48.9 70.3 126.9 110.1 208.2 110.1 33.3 0 67.2-7.3 99.9-21 78-32.6 134.4-101.3 150.9-183.9l2.4-12.6-86.7-31.9z"
                    fill="#af76ea"
                  />
                  <G opacity={0.23}>
                    <LinearGradient
                      id="prefix__a"
                      gradientUnits="userSpaceOnUse"
                      x1={255.098}
                      y1={386.047}
                      x2={508.301}
                      y2={386.047}
                    >
                      <Stop offset={0.019} />
                      <Stop offset={0.503} stopColor="#fff" />
                      <Stop offset={1} />
                    </LinearGradient>
                    <Path
                      d="M421.6 261.3l86.7 32-2.4 12.6C489.4 388.4 433 457.1 355 489.7c-32.7 13.8-66.6 21-99.9 21V421c22.8 0 45-5.5 65.1-13.9 52.8-22.4 90.6-71.1 99-127.7l2.4-18.1z"
                      fill="url(#prefix__a)"
                    />
                    <LinearGradient
                      id="prefix__b"
                      gradientUnits="userSpaceOnUse"
                      x1={255.098}
                      y1={131.735}
                      x2={512}
                      y2={131.735}
                    >
                      <Stop offset={0.019} />
                      <Stop offset={0.503} stopColor="#fff" />
                      <Stop offset={1} />
                    </LinearGradient>
                    <Path
                      d="M512 76.3v185.9l-166.9-61.9 47.7-35.6c-34.2-52-87-74.1-137.7-73.5v-90c81.9-.6 160.8 38.9 210 109.4L512 76.3z"
                      fill="url(#prefix__b)"
                    />
                  </G>
                </Svg>
              </Animated.View>
            </View>
          </Modal>
          <ScrollView style={{ marginTop: 5, padding: 20 }}>
            <View style={{ minHeight: 300 }}>
              <Label style={{ color: '#fff' }}>Navigation App</Label>
              <DropDownPicker
                items={[
                  { label: 'Google Maps', value: 'google-map', },
                  // { label: 'DFK Navigation', value: 'self-nav' },
                ]}
                defaultValue={mapNavigation}
                containerStyle={{ height: 40 }}
                style={{ backgroundColor: 'transparent', borderWidth: 0, borderBottomWidth: 1, }}
                itemStyle={{
                  justifyContent: 'flex-start',
                }}
                labelStyle={{
                  fontSize: 16,
                  textAlign: 'left',
                  fontFamily: 'Montserrat_bold',
                  color: '#fff'
                }}
                dropDownStyle={{ backgroundColor: '#1A2537' }}
                onChangeItem={item => this.setMapNav(item)}
              />
              <Label style={{ color: '#fff', marginTop: 30 }}>Stop Color</Label>
              <DropDownPicker
                items={[
                  // { label: 'Purple', value: 'purple', },
                  { label: 'Light Blue', value: 'light-blue' },
                ]}
                defaultValue={stopColor}
                containerStyle={{ height: 40 }}
                style={{ backgroundColor: 'transparent', borderWidth: 0, borderBottomWidth: 1 }}
                itemStyle={{
                  justifyContent: 'flex-start'
                }}
                labelStyle={{
                  fontSize: 16,
                  textAlign: 'left',
                  fontFamily: 'Montserrat_bold',
                  color: '#fff'
                }}
                dropDownStyle={{ backgroundColor: '#1A2537' }}
                onChangeItem={item => this.setMarkerColor(item)}
              />
              <View style={{ flexDirection: 'row', marginTop: 30, alignItems: 'center', justifyContent: 'space-between' }}>
                <Label style={{ color: '#fff' }}>Offline Map Areas</Label>
                <Text style={{ color: '#fff' }}>{downloadCount}/{filteredList.length}</Text>
              </View>
              <View style={{ flexWrap: 'wrap' }}>
                {filteredList.map((item, index) => {
                  return (
                    item.is_download == 1 ?
                      (
                        <View key={item.id} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          <TouchableOpacity
                            style={downloadStyles.areaContainer}
                            onPress={() => {
                              (downloadStarted ? this.showAlert('download already started') : (this.removeAreaMap(item, index)))
                            }}
                          >
                            {
                              item.is_download == 1 && item.is_download_map == 1 ?
                                <>
                                  <Icon name='close' style={{ color: '#8359af' }} />
                                  <Text style={{ color: '#8359af' }}> &nbsp;{item.area_code}</Text>
                                </> :
                                (
                                  <>
                                    <Icon name='close' style={{ color: '#8359af' }} />
                                    <Text style={{ color: '#8359af' }}> &nbsp; {item.area_code + ' '} {item.is_download ? (mapDownloadPercentage + '%') : ''} </Text>
                                  </>
                                )
                            }
                          </TouchableOpacity>
                          <TouchableOpacity disabled={item.is_download_map}
                            style={[downloadStyles.areaContainer, { backgroundColor: item.is_download_map == 1 ? 'transparent' : '#8cb4f9' }]}
                            onPress={() => this.downloadOfflineMap(item, index)}
                          >
                            {item.is_download_map == 1 && (<Icon name="checkmark-sharp" style={{ color: '#8359af' }} />)}
                            <Text style={{ color: item.is_download_map == 1 ? '#8359af' : '#fff' }}>
                              {item.is_download_map == 1 ? 'COMPLETED' : 'RE-DOWNLOAD'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )
                      : null
                  )
                })}
              </View>
            </View>
          </ScrollView>
        </Container>
      </>
    );
  }
}

const downloadStyles = StyleSheet.create({
  areaContainer: {
    // backgroundColor: '#A2C3FA',
    marginVertical: 5,
    marginRight: 10,
    minWidth: 120,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10
  },
  // downloadContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
});

function mapStateToProps({ auth, marker, areacodes }) {
  return {
    auth, marker, areacodes
  };
}

const bindActions = {
  runQuery,
  getPostcodes,
  signOut,
  showProgress,
  hideProgress,
  setNextDownload,
  setMapNavigation,
  setStopColor,
  setDownloadStates
};

export default connect(mapStateToProps, bindActions)(Downloads);
