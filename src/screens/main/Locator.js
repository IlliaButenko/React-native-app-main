import React, { Component } from 'react';
import { Body, Button, Container, Content, Icon, Input, Label, Left, ListItem, Right, Separator, Text } from 'native-base';
import { StyleSheet, View, TouchableOpacity, Platform, Image, Animated, FlatList, Dimensions, Keyboard, Linking, Alert, NativeModules } from 'react-native';
import { connect } from 'react-redux';
// import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import MapboxGL, { Logger } from "@react-native-mapbox-gl/maps";
import NetInfo from "@react-native-community/netinfo";
import SQLite from 'react-native-sqlite-storage';
import Svg, { G, Path, Circle, Ellipse } from "react-native-svg";
import Modal from 'react-native-modal';

import { lineString as makeLineString } from '@turf/helpers';
import { point } from '@turf/helpers';
import Share from 'react-native-share';

MapboxGL.setAccessToken("pk.eyJ1IjoiZmFzaGlvbmRldjEiLCJhIjoiY2tscjlmM3diMTNkaTJvbnc1OXBpbzVwNiJ9.yJIaRGA7FoRXjQCSPj3WEA");

import { directionsClient } from '../../components/MapboxClient';
import { runQuery } from '../../actions/areacodes';
import { showProgress, hideProgress } from '../../actions/loading';
import { setMarkerlist, setDonelist, setSelectedMarker, setCenterCoords, setNextDownload } from '../../actions/marker';
import { ScrollView } from 'react-native-gesture-handler';

import MarkerViewPlugin from '../../components/MarkerviewPlugin';
import { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const layerStyles = {
  origin: {
    circleRadius: 5,
    circleColor: 'white',
  },
  destination: {
    circleRadius: 5,
    circleColor: 'white',
  },
  route: {
    lineColor: 'red',
    lineCap: MapboxGL.LineJoin.Round,
    lineWidth: 3,
    lineOpacity: 1,
  },
  progress: {
    lineColor: '#314ccd',
    lineWidth: 3,
  },
};

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

class Locator extends Component {
  constructor(props) {
    super(props);
    SQLite.DEBUG = true;
    this.state = {
      offLinePackName: `ukcourier-${Date.now()}`,
      offlineRegion: null,
      offlineRegionStatus: null,
      searchKey: '',
      mapType: MapboxGL.StyleURL.Street,
      isGetLocation: false,
      zoomLevel: 16,
      netStatus: true,
      isSearchActive: false,
      bounceValue: new Animated.Value(height),
      postcodeResults: [],
      showLibrary: false,
      showDone: false,
      route: null,
      // userLocation: [],
      sharedMarker: null,
      isShared: false,
      followUserLocation: true,
    };
  }

  /**
  * Execute sql queries
  * 
  * @param sql
  * @param params
  * 
  * @returns {resolve} results
  */

  unsubscribe = null;
  componentDidMount = async () => {
    this.unsubscribe = NetInfo.addEventListener(state => {
      this.setState({ netStatus: state.isConnected });
    });
    this.goToMyLocation();
  }

  goToMyLocation = () => {
    this.setState({ followUserLocation: true });
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        this.setState({
          isGetLocation: true,
          // userLocation: [coords.longitude, coords.latitude]
        });
        this.props.setCenterCoords([coords.longitude, coords.latitude]);
      },
      (error) => {
        alert(JSON.stringify(error));
        // alert('Error: Are location services on?');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000, distanceFilter: 1 }
    );
    this.props.setSelectedMarker({});
    // return;
    // Geolocation.watchPosition(
    //   ({ coords }) => {
    //     const { followUserLocation } = this.state;
    //     if (followUserLocation) this.props.setCenterCoords([coords.longitude, coords.latitude]);
    //   },
    //   (error) => {
    //     alert(JSON.stringify(error));
    //     // alert('Error: Are location services on?');
    //   },
    //   { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000, distanceFilter: 1 }
    // )
  }

  movePosition = async () => {
    await this.goToMyLocation();
    const { centerCoords } = this.props.marker;
    console.log('centder coordssssssss', centerCoords);
    await this.camera.flyTo([centerCoords[0], centerCoords[1]]);
  }

  componentWillUnmount() {
    // avoid setState warnings if we back out before we finishing downloading
    // Geolocation.clearWatch(this.watchID);
    MapboxGL.offlineManager.deletePack(this.state.offLinePackName);
    MapboxGL.offlineManager.unsubscribe(this.state.offLinePackName);
  }

  UNSAFE_componentWillReceiveProps(newProps) { }

  onChangeSearch = (searchKey) => {
    let postCode = searchKey.replace(/\s/g, '');
    this.setState({ searchKey: postCode });
  }

  onSearchFocus = () => {
    const { isSearchActive } = this.state;
    if (isSearchActive) return;

    this.setState({ isSearchActive: true, postcodeResults: [] });
    this.toggleOverlayView(0);
  }

  onSearchUnFocus = () => {
    if (!this.state.isSearchActive) {
      return;
    }
    this.setState({ isSearchActive: false });
    this.dismissInput();
    // this.onChangeSearch('');
    this.toggleOverlayView(height);
  }

  toggleOverlayView = (toValue) => {
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: toValue,
        velocity: 5,
        tension: 1,
        friction: 4,
      }
    ).start();
  }

  searchPostcodes = async () => {
    const { searchKey } = this.state;
    if (searchKey.length < 5) {
      alert('Please input min 5 letters');
      return;
    }

    if (!this.state.isSearchActive) {
      this.onSearchFocus();
    }
    let areaCode = !isNaN(parseFloat(searchKey.substring(0, 2)[1])) ? searchKey.substring(0, 1) : searchKey.substring(0, 2);
    let params = {
      query: "SELECT * FROM tb_areacodes WHERE area_code like ?;",
      queryParams: [areaCode.toLowerCase()]
    };
    // let params = {
    //   query: "SELECT name as count FROM sqlite_master WHERE type='table' AND name=?;",
    //   queryParams: ['pc_'+areaCode.toLowerCase()]
    // };
    let isTableDownloaded = false;
    let isAreaExist = false;
    await this.props.runQuery(params, (data) => {
      if (data.rows.length <= 0) {
        alert(areaCode.toUpperCase() + " Offline Map Area doesn't exist on the server. Try other Areas.");
        this.onSearchUnFocus();
        // this.toggleOverlayView(height);
        return;
      } else {
        isTableDownloaded = data.rows.item(0).is_download;
        isAreaExist = true
      }
    });

    if (!isTableDownloaded && isAreaExist) {
      Alert.alert(
        "Alert",
        areaCode.toUpperCase() + " Offline Map Area isn't downloaded. Do you want to download?",
        [
          {
            text: "CANCEL",
            onPress: () => {
              this.onSearchUnFocus();
            },
            style: "cancel"
          },
          {
            text: "OK", onPress: async () => {
              this.onSearchUnFocus();
              let nextDownload = areaCode.toUpperCase();
              this.props.navigation.navigate('Settings', { nextDownload });
            }
          }
        ]
      );
    } else if (isAreaExist) {
      let params = {
        query: "select * from 'pc_" + areaCode.toLowerCase() + "' where postcode like '" + searchKey + "';",
        queryParams: []
      }
      await this.props.runQuery(params, (data) => {
        let postResults = data.rows;
        let postcodes = [];
        if (!postResults.length) {
          alert(searchKey.toUpperCase() + " Offline Area doesn't exist. Try again later.");
          // this.toggleOverlayView(height);
          this.onSearchUnFocus();
        } else {
          for (let i = 0; i < postResults.length; i++) {
            postcodes.push(postResults.item(i));
          }
          this.toggleOverlayView(0);
        }
        this.setState({
          postcodeResults: postcodes,
          followUserLocation: false
        })
      });
    }
    this.dismissInput();
  }

  // changeMapType = () => {
  //   this.setState({
  //     mapType: this.state.mapType == MapboxGL.StyleURL.Street ? MapboxGL.StyleURL.Satellite : MapboxGL.StyleURL.Street
  //   })
  // }

  zoomOutMap = async () => {
    const center = await this.map.getCenter();
    this.props.setCenterCoords(center);
    this.setState({
      zoomLevel: this.state.zoomLevel - 1
    });
  }

  zoomInMap = async () => {
    const center = await this.map.getCenter();
    this.props.setCenterCoords(center);
    this.setState({
      zoomLevel: this.state.zoomLevel + 1
    });
  }

  dismissInput = () => {
    Keyboard.dismiss();
  }

  containsObject = (obj, list) => {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i].latitude === obj.latitude && list[i].longitude === obj.longitude) {
        return true;
      }
    }
    return false;
  }
  addLocationToMap = (item, index) => {
    this.setState({ followUserLocation: false });
    let { markerList } = this.props.marker;
    this.props.setSelectedMarker({
      index: markerList.length + 1,
      searchIndex: index,
      postcode: item.postcode,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      isImportant: index == 0 ? 1 : 0,
      isDone: item.isDone ? true : false
    });

    markerList.push({
      // index: markerList.length + 1,
      searchIndex: index,
      postcode: item.postcode,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      isImportant: index == 0 ? 1 : 0,
      isDone: false
    });
    this.props.setMarkerlist(markerList);
    this.onSearchUnFocus();
    this.props.setCenterCoords([parseFloat(item.longitude), parseFloat(item.latitude)]);
    this.camera.setCamera({ zoomLevel: this.state.zoomLevel });
    this.camera.moveTo([this.props.marker.centerCoords[0], this.props.marker.centerCoords[1]]);
  }

  showMarkerDetail = (item, index) => {
    this.setState({ followUserLocation: false });
    this.props.setSelectedMarker({
      index: index + 1,
      searchIndex: item.searchIndex,
      postcode: item.postcode,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      isImportant: item.isImportant ? 1 : 0,
      isDone: item.isDone ? true : false
    });
    this.props.setCenterCoords([parseFloat(item.longitude), parseFloat(item.latitude)]);
    this.camera.setCamera({ zoomLevel: this.state.zoomLevel });
    this.camera.moveTo([this.props.marker.centerCoords[0], this.props.marker.centerCoords[1]]);
  }

  removeSelectedMarker = () => {
    let { selectedMarker } = this.props.marker;
    Alert.alert(
      "Remove",
      "Are you sure you want to delete *" + selectedMarker.postcode + "* ?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", onPress: () => {
            let { markerList } = this.props.marker;
            markerList.splice(selectedMarker.index - 1, 1);
            this.props.setMarkerlist(markerList);
            this.props.setSelectedMarker({});
          }
        }
      ]
    );
  }
  changeSelectedMarkerColor = () => {
    let { selectedMarker } = this.props.marker;
    selectedMarker.isImportant = !selectedMarker.isImportant;
    // this.setState({ selectedMarker })
    this.props.setSelectedMarker(selectedMarker);
    // this.markerRef.refresh();
    let { markerList } = this.props.marker;
    markerList[selectedMarker.index - 1].isImportant = selectedMarker.isImportant;
    this.props.setMarkerlist(markerList);
  }
  changeMarkerDone = (item, index) => {
    let selectedMarker = item;
    selectedMarker.isDone = !selectedMarker.isDone;
    this.props.setSelectedMarker(selectedMarker);
    let { markerList } = this.props.marker;
    if (index != undefined) {
      markerList[index].isDone = selectedMarker.isDone;
    } else {
      markerList[selectedMarker.index - 1].isDone = selectedMarker.isDone;
    }
    this.props.setMarkerlist(markerList);
    // setTimeout(this.markerRef.refresh(), 10);
    // this.markerRef.refresh();
  }

  linkGoogleMap = async (item, type) => {
    const { netStatus } = this.state;
    // if (netStatus) {
    //   if (type == "directions") {
    //     const url = 'https://www.google.com/maps/dir/?api=1&destination=' + item.latitude + ',' + item.longitude + '&travelmode=driving';
    //     Linking.openURL(url);
    //   } else if (type == "search") {
    //     const url = 'https://www.google.com/maps/@?api=1&map_action=map&center=' + item.latitude + ',' + item.longitude;
    //     Linking.openURL(url);
    //   }
    // } else {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${item.latitude},${item.longitude}`;
      const label = item.address;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      Linking.openURL(url);
    // }
  }

  showLibraryModal = () => {
    this.setState({
      showLibrary: true,
      followUserLocation: false
    })
  }

  hideLibraryModal = () => {
    this.setState({
      showLibrary: false
    })
  }
  showDoneModal = () => {
    this.setState({
      showDone: true,
    })
  }

  hideDoneModal = () => {
    this.setState({
      showDone: false
    })
  }

  removeMarker = (item, index) => {
    Alert.alert(
      "Remove",
      "Are you sure you want to delete *" + item.postcode + "* ?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", onPress: () => {
            let { markerList } = this.props.marker;
            markerList.splice(index, 1);
            this.props.setMarkerlist(markerList);
            this.props.setSelectedMarker({});
          }
        }
      ]
    );
  }

  removeAllMarkers = () => {
    Alert.alert(
      "Remove",
      "Are you sure you want to remove all records ?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", onPress: () => {
            // this.props.setMarkerlist([]);
            // this.props.setSelectedMarker({})
            let { markerList, selectedMarker } = this.props.marker;
            markerList = markerList.filter(item => item.isDone == true)
            this.props.setMarkerlist(markerList);
            if (!selectedMarker.isDone) {
              this.props.setSelectedMarker({})
            }
          }
        }
      ]
    );
  }

  removeAllDoneMarkers = () => {
    Alert.alert(
      "Remove",
      "Are you sure you want to remove all records ?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", onPress: () => {
            let { markerList, selectedMarker } = this.props.marker;
            markerList = markerList.filter(item => item.isDone != true)
            this.props.setMarkerlist(markerList);
            if (selectedMarker.isDone) {
              this.props.setSelectedMarker({})
            }
          }
        }
      ]
    );
  }

  moveToMap = (item, index) => {
    this.setState({ followUserLocation: false });
    this.props.setSelectedMarker({
      index: index + 1,
      searchIndex: item.searchIndex,
      postcode: item.postcode,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      isImportant: item.isImportant ? 1 : 0,
      isDone: item.isDone ? true : false
    });
    this.props.setCenterCoords([parseFloat(item.longitude), parseFloat(item.latitude)]);
    this.hideDoneModal();
    this.hideLibraryModal();
    this.camera.setCamera({ zoomLevel: this.state.zoomLevel, centerCoordinate: [item.longitude, item.latitude], animationDuration: 1000 });
    this.camera.moveTo([item.longitude, item.latitude]);
  }

  shareMarker = (item) => {
    this.setState({
      sharedMarker: item
    });
    const title = 'Awesome Contents';
    const options = Platform.select({
      default: {
        title,
        subject: title,
        // url: 'https://maps.google.com/?q=' + item.latitude + ',' + item.longitude,
        message: item.address + '\n' + 'https://maps.google.com/?q=' + item.latitude + ',' + item.longitude + '\n Shared by UkCourier app',
      },
    });

    Share.open(options)
      .then((res) => { console.log(res) })
      .catch((err) => { err && console.log(err); });
  }
  hideShare = (item) => {
    this.setState({
      isShared: false,
      sharedMarker: null
    })
  }

  moveNextMarker = (item) => {
    let { markerList } = this.props.marker;
    let nextMarker = null;
    if (item.index == markerList.length) {
      nextMarker = markerList[0];
    } else {
      nextMarker = markerList[item.index];
    }
    let itemIndex = item.index == markerList.length ? 0 : item.index;
    this.moveToMap(nextMarker, itemIndex);
  }

  render() {
    const { searchKey, isGetLocation, zoomLevel, mapType, netStatus, isSearchActive, postcodeResults, showLibrary, showDone, followUserLocation } = this.state;

    const { markerList, doneList, selectedMarker, centerCoords, stopColor } = this.props.marker;

    return (
      <>
        <Container style={{ overflow: 'hidden' }}>
          <View style={mapStyles.searchBar}>
            <Button transparent rounded onPress={this.onSearchUnFocus} style={{ marginHorizontal: 16, height: 50 }}>
              {!isSearchActive ?
                <View>
                  <Icon name="search" style={{ color: '#D7D8DC' }}></Icon>
                </View>
                :
                <Icon name="chevron-back" style={{ color: '#D7D8DC' }} />
              }
            </Button>
            <Input
              placeholder="Enter Post Code"
              placeholderTextColor="#D7D8DC"
              onTouchStart={this.onSearchFocus}
              onChangeText={this.onChangeSearch}
              value={searchKey}
              autoCapitalize="characters"
              style={{ color: '#D7D8DC', fontFamily: 'Montserrat_bold' }}
            />
            <TouchableOpacity transparent onPress={this.searchPostcodes} style={mapStyles.searchButton}>
              <Text style={{ color: '#000' }}>Search</Text>
            </TouchableOpacity>
          </View>
          {isGetLocation ?
            <MapboxGL.MapView
              ref={map => { this.map = map; }}
              style={mapStyles.map}
              styleURL={mapType}
              compassEnabled={false}
              zoomEnabled={true}
              onPress={() => { this.setState({ followUserLocation: false }) }}
            >

              {followUserLocation ?
                < MapboxGL.Camera
                  ref={camera => { this.camera = camera; }}
                  zoomLevel={zoomLevel}
                  centerCoordinate={centerCoords}
                  animationMode={'moveTo'}
                  followUserLocation={true}
                  followUserMode={'normal'}
                  followZoomLevel={zoomLevel}
                />
                :
                <MapboxGL.Camera
                  ref={camera => { this.camera = camera; }}
                  zoomLevel={zoomLevel}
                  centerCoordinate={centerCoords}
                  animationMode={'moveTo'}
                  followUserLocation={false}
                  followZoomLevel={zoomLevel}
                />}
              <MapboxGL.UserLocation
                showsUserHeadingIndicator={true}
                renderMode={'normal'}
              />
              {/* {
                markerList.map((item, index) => {
                  return (
                    <MapboxGL.PointAnnotation
                      coordinate={[parseFloat(item.longitude), parseFloat(item.latitude)]}
                      id={'' + index}
                      key={index}
                      ref={ref => (this.markerRef = ref)}
                      onSelected={() => this.showMarkerDetail(item, index)}
                      onDeselected={() => this.showMarkerDetail(item, index)}
                    >
                      <View style={{ width: 40, height: 40 }}>
                        {!item.isDone ?
                          (
                            <View onLoad={() => this.markerRef.refresh()}>
                              <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                x={0}
                                y={0}
                                xmlSpace="preserve"
                                onLoad={() => this.markerRef.refresh()}
                              >
                                <Path
                                  d="M441 132.9C423 74.8 375.7 27.5 317.7 9.6 297.3 3.3 276.4 0 256 0c-41.6 0-81.7 12.9-115.2 38-49.7 36.5-79.3 94.9-79.3 156.5 0 42.5 13.5 82.9 38.9 116.7L256 510.8l155.6-199.5c38.1-50.9 48.9-115.8 29.4-178.4zM256 299.3c-57.8 0-104.8-47-104.8-104.8S198.3 89.8 256 89.8s104.8 47 104.8 104.8-47 104.7-104.8 104.7z"
                                  fill={'#a3c3fa'}
                                />
                                <Path
                                  d="M411.7 311.3L256 510.8V299.3c57.8 0 104.8-47 104.8-104.8S313.8 89.8 256 89.8V0c20.4 0 41.3 3.3 61.7 9.6 58.1 18 105.4 65.3 123.3 123.3 19.5 62.6 8.7 127.5-29.3 178.4z"
                                  fill={'#8cb4f9'}
                                />
                                <Circle cx={256} cy={194.5} r={104.7} fill="#f0f3f4" />
                              </Svg>
                              <Text style={[mapStyles.markerLabel, { color: (item.isImportant ? '#8359af' : '#8cb4f9') }]}>{index + 1}</Text>
                            </View>
                          ) :
                          (
                            <View onLoad={() => this.markerRef.refresh()}>
                              <Svg
                                id="prefix__Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                x={0}
                                y={0}
                                viewBox="0 0 512 512"
                                xmlSpace="preserve"
                                onLoad={() => this.markerRef.refresh()}
                              >
                                <G id="prefix__main_marker_14_">
                                  <Path
                                    className="prefix__st0"
                                    d="M440.1 133.2C422.1 75 374.7 27.6 316.5 9.6 296.1 3.3 275.1 0 254.7 0 213 0 172.8 12.9 139.2 38.1 89.4 74.7 59.7 133.2 59.7 195c0 42.6 13.5 83.1 39 117l156 200 156-200c38.1-51 48.9-116.1 29.4-178.8zM254.7 300c-57.9 0-105-47.1-105-105s47.1-105 105-105 105 47.1 105 105-47.1 105-105 105z"
                                    fill='#49494B'
                                  />
                                  <Path
                                    className="prefix__st0"
                                    d="M410.7 312l-156 200V300c57.9 0 105-47.1 105-105s-47.1-105-105-105V0c20.4 0 41.4 3.3 61.8 9.6 58.2 18 105.6 65.4 123.6 123.6 19.5 62.7 8.7 127.8-29.4 178.8z"
                                    fill='#49494B'
                                  />
                                </G>
                                <Circle cx={254.6} cy={195} r={104.7} fill="#f0f3f4" />
                                <Path
                                  id="prefix__done"
                                  d="M229.2 270l-58.9-58.9 34.5-34.5 24.4 24.4 81.1-81.1 34.5 34.5L229.2 270z"
                                  fill="#202125"
                                />
                              </Svg>
                            </View>
                          )
                        }
                      </View>
                    </MapboxGL.PointAnnotation>
                  )
                })
              } */}
              {
                markerList.map((item, index) => {
                  return (
                    <MapboxGL.MarkerView
                      coordinate={[parseFloat(item.longitude), parseFloat(item.latitude)]}
                      key={index}
                      anchor={{ x: 0.5, y: 0.5 }}
                      draggable={false}
                    >
                      <TouchableOpacity onPress={() => this.showMarkerDetail(item, index)} style={{ width: 40, height: 40 }}>
                        {!item.isDone ?
                          (
                            <>
                              <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={40} height={40}>
                                <Path
                                  d="M441 132.9C423 74.8 375.7 27.5 317.7 9.6 297.3 3.3 276.4 0 256 0c-41.6 0-81.7 12.9-115.2 38-49.7 36.5-79.3 94.9-79.3 156.5 0 42.5 13.5 82.9 38.9 116.7L256 510.8l155.6-199.5c38.1-50.9 48.9-115.8 29.4-178.4zM256 299.3c-57.8 0-104.8-47-104.8-104.8S198.3 89.8 256 89.8s104.8 47 104.8 104.8-47 104.7-104.8 104.7z"
                                  fill={(item.isImportant ? '#af76ea' : '#a3c3fa')}
                                />
                                <Path
                                  d="M411.7 311.3L256 510.8V299.3c57.8 0 104.8-47 104.8-104.8S313.8 89.8 256 89.8V0c20.4 0 41.3 3.3 61.7 9.6 58.1 18 105.4 65.3 123.3 123.3 19.5 62.6 8.7 127.5-29.3 178.4z"
                                  fill={(item.isImportant ? '#8359af' : '#8cb4f9')}
                                />
                                <Circle cx={256} cy={194.5} r={104.7} fill="#f0f3f4" />
                              </Svg>
                              <Text style={[mapStyles.markerLabel, { color: (item.isImportant ? '#8359af' : '#8cb4f9') }]}>{index + 1}</Text>
                            </>
                          ) :
                          (<Svg
                            id="prefix__Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            x={0}
                            y={0}
                            viewBox="0 0 512 512"
                            xmlSpace="preserve"
                          >
                            <G id="prefix__main_marker_14_">
                              <Path
                                className="prefix__st0"
                                d="M440.1 133.2C422.1 75 374.7 27.6 316.5 9.6 296.1 3.3 275.1 0 254.7 0 213 0 172.8 12.9 139.2 38.1 89.4 74.7 59.7 133.2 59.7 195c0 42.6 13.5 83.1 39 117l156 200 156-200c38.1-51 48.9-116.1 29.4-178.8zM254.7 300c-57.9 0-105-47.1-105-105s47.1-105 105-105 105 47.1 105 105-47.1 105-105 105z"
                                fill='#49494B'
                              />
                              <Path
                                className="prefix__st0"
                                d="M410.7 312l-156 200V300c57.9 0 105-47.1 105-105s-47.1-105-105-105V0c20.4 0 41.4 3.3 61.8 9.6 58.2 18 105.6 65.4 123.6 123.6 19.5 62.7 8.7 127.8-29.4 178.8z"
                                fill='#49494B'
                              />
                            </G>
                            <Circle cx={254.6} cy={195} r={104.7} fill="#f0f3f4" />
                            <Path
                              id="prefix__done"
                              d="M229.2 270l-58.9-58.9 34.5-34.5 24.4 24.4 81.1-81.1 34.5 34.5L229.2 270z"
                              fill="#202125"
                            />
                          </Svg>
                          )
                        }
                      </TouchableOpacity>
                    </MapboxGL.MarkerView>
                  )
                })
              }
            </MapboxGL.MapView> : null
          }
          {markerList.length ?
            (<TouchableOpacity onPress={this.showLibraryModal} style={[mapStyles.mapLibraryBtnContainerPosition, mapStyles.myLocationBtnContainer, { elevation: isSearchActive ? 0 : 10 }]}>
              <Svg
                id="prefix__Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                x={0}
                y={0}
                viewBox="0 0 512 512"
                xmlSpace="preserve"
                width={12}
                height={12}
                style={{ marginRight: 5 }}
              >
                <G id="prefix__view_1_">
                  <Path
                    className="prefix__st0"
                    d="M0 217.3h63v63H0zM0 403.1h63v63H0zM0 31.5h63v63H0zM126 217.3h382.7v63H126zM126 31.5h384.2v63H126zM126 403.1h382.7v63H126z"
                    fill={'#A2C3FA'}
                  />
                </G>
              </Svg>
              <Text style={{ color: '#A2C3FA' }}>View list</Text>
            </TouchableOpacity>) : null
          }

          <TouchableOpacity onPress={this.zoomOutMap} rounded style={[mapStyles.zoomOutContainerPosition, mapStyles.myLocationBtnContainer, { opacity: 0.5, elevation: isSearchActive ? 0 : 10 }]}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              className="prefix__ionicon"
              viewBox="0 0 512 512"
              width={24}
              height={24}
            >
              <Path
                fill="none"
                stroke="#D7D8DC"
                strokeWidth={96}
                d="M400 256H112"
              />
            </Svg>
          </TouchableOpacity>
          {/* <MarkerViewPlugin style={{width: 30, height: 30, position: 'absolute', top: 300, left: 20}} source={require('../../../assets/images/icons/livelocation.png')}></MarkerViewPlugin> */}
          <TouchableOpacity onPress={this.zoomInMap} rounded style={[mapStyles.zoomInContainerPosition, mapStyles.myLocationBtnContainer, { opacity: 0.5, elevation: isSearchActive ? 0 : 10 }]}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              className="prefix__ionicon"
              viewBox="0 0 512 512"
              width={24}
              height={24}
            >
              <Path
                fill="none"
                stroke="#D7D8DC"
                strokeWidth={96}
                d="M256 112v288m144-144H112"
              />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.movePosition} rounded style={[mapStyles.myLocationBtnContainerPosition, mapStyles.myLocationBtnContainer, { opacity: 0.5, shadowOffset: { width: 0, height: 0 }, elevation: isSearchActive ? 0 : 10 }]}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              height={24}
              viewBox="0 0 24 24"
              width={24}
            >
              <Path d="M0 0h24v24H0z" fill="none" />
              <Path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                fill="#D7D8DC"
              />
            </Svg>
          </TouchableOpacity>

          <Modal isVisible={showLibrary} style={{ margin: 0 }}>
            <View style={{ flex: 1, backgroundColor: '#1D2535' }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#333' }}>
                <TouchableOpacity onPress={this.hideLibraryModal} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="chevron-back-outline" style={{ color: "#fff" }}></Icon>
                  <Text style={{ color: '#fff' }}>Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 3 }}>
                  <Text style={{ margin: 10, textAlign: 'center', fontSize: 18, color: '#fff' }}>List</Text>
                </View>
                <TouchableOpacity onPress={this.showDoneModal} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={{ color: '#fff' }}>Done</Text>
                  <Icon name="chevron-forward-outline" style={{ color: "#fff" }}></Icon>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ marginTop: 5, marginBottom: 40, paddingBottom: 20 }}>
                {markerList.map((item, index) => {
                  if (!item.isDone) {
                    return (
                      <View style={[mapStyles.libraryPan, { opacity: item.isDone ? 0.4 : 1 }]} key={index}>
                        <Left>
                          <View style={mapStyles.markerLeft}>
                            <View
                              style={[
                                mapStyles.markerLeftIndex,
                                { backgroundColor: '#2A2B2E', }
                              ]}
                            >
                              <Text style={{ color: '#fff' }}>{index + 1}</Text>
                            </View>
                            <TouchableOpacity
                              style={[mapStyles.markerLeftRemove,
                              {
                                backgroundColor: (item.isImportant ? '#8359af' : '#8cb4f9'),
                              }
                              ]}
                              onPress={() => this.changeMarkerDone(item, index)}
                            >
                              {/* <Icon name="checkmark-sharp" style={{ color: '#fff', fontSize: 24 }}></Icon> */}
                              <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 509 509" width={20} height={20}>
                                <Path
                                  d="M171.3 472.9L-.5 301l100.6-100.6 71.2 71.3L407.9 35.1l100.6 100.6-337.2 337.2z"
                                  fill="#2A2B2E"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        </Left>
                        <Body>
                          <TouchableOpacity style={mapStyles.markerAddress} onPress={() => this.moveToMap(item, index)}>
                            <Text style={{ paddingHorizontal: 10, color: 'grey' }}>{item.postcode}</Text>
                            <Text style={{ paddingHorizontal: 10, color: '#D7D8DC' }}>{item.searchIndex == 0 ? 'Post Code Area or Search on google' : item.address}</Text>
                          </TouchableOpacity>
                        </Body>
                        <Right>
                          <TouchableOpacity style={[mapStyles.libraryDirection, { backgroundColor: '#8cb4f9' }]} onPress={() => this.linkGoogleMap(item, "directions")}>
                            <Svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width={28}
                              height={28}
                            >
                              <Path d="M0 0h24v24H0z" />
                              <Path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"
                                fill="#2A2B2E"
                              />
                            </Svg>
                          </TouchableOpacity>
                        </Right>
                      </View>
                    )
                  }
                })}
              </ScrollView>
              <TouchableOpacity style={mapStyles.removeAll} onPress={this.removeAllMarkers}>
                <Icon name="trash-outline" style={{ color: '#af76ea' }}></Icon>
                <Text style={{ color: '#af76ea' }}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <Modal isVisible={showDone} style={{ margin: 0 }}>
            <View style={{ flex: 1, backgroundColor: '#1D2535' }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#333' }}>
                <TouchableOpacity onPress={this.hideDoneModal} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="chevron-back-outline" style={{ color: "#fff" }}></Icon>
                  <Text style={{ color: '#fff' }}>Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 3 }}>
                  <Text style={{ margin: 10, textAlign: 'center', fontSize: 18, color: '#fff' }}>Done</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {/* <Text style={{color: '#fff'}}>Done</Text>
                  <Icon name="chevron-forward-outline" style={{ color: "#fff" }}></Icon> */}
                </View>
              </View>
              <ScrollView style={{ marginTop: 5, marginBottom: 40, paddingBottom: 20 }}>
                {markerList.map((item, index) => {
                  if (item.isDone) {
                    return (
                      <View style={[
                        mapStyles.libraryPan,
                      ]} key={index}>
                        <Left>
                          <View style={mapStyles.markerLeft}>
                            <View
                              style={[mapStyles.markerLeftIndex,
                              { backgroundColor: '#2A2B2E', }
                              ]}
                            >
                              <Text style={{ color: '#fff' }}>{index + 1}</Text>
                            </View>
                            <TouchableOpacity
                              style={[mapStyles.markerLeftRemove,
                              {
                                backgroundColor: '#49494B',
                              }
                              ]}
                              onPress={() => this.changeMarkerDone(item, index)}
                            >
                              <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.7 426.7"
                                width={20} height={20}
                              >
                                <Path
                                  d="M326.9 81.1H145.4l15.2-37.2c3.2-7.9.9-17-5.8-22.4-6.7-5.4-16.1-5.7-23.1-.8l-123 85.4c-5.4 3.7-8.5 10-8.3 16.5.2 6.5 3.7 12.6 9.3 16l128.5 78.1c7.3 4.4 16.7 3.6 23-2.2 6.4-5.7 8.2-15 4.5-22.8L148.9 156h178c13.1 0 23.8 10.9 23.8 24v130.2c0 13.1-10.7 23.6-23.8 23.6h-197c-17.6 0-31.8 14.2-31.8 31.8v11.2c0 17.6 14.2 31.8 31.8 31.8h197c54.4 0 98.7-44.1 98.7-98.5V180c0-54.4-44.2-98.9-98.7-98.9z"
                                  fill="#fff"
                                />
                              </Svg>
                            </TouchableOpacity>
                          </View>
                        </Left>
                        <Body>
                          <TouchableOpacity style={mapStyles.markerAddress} onPress={() => this.moveToMap(item, index)}>
                            <Text style={{ paddingHorizontal: 10, color: 'grey' }}>{item.postcode}</Text>
                            <Text style={{ paddingHorizontal: 10, color: '#D7D8DC' }}>{item.searchIndex == 0 ? 'Post Code Area or Search on google' : item.address}</Text>
                          </TouchableOpacity>
                        </Body>
                        <Right>
                          <TouchableOpacity style={[mapStyles.libraryDirection, { backgroundColor: '#49494B' }]} onPress={() => this.linkGoogleMap(item, "directions")}>
                            <Svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width={28}
                              height={28}
                            >
                              <Path d="M0 0h24v24H0z" />
                              <Path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"
                                fill="#fff"
                              />
                            </Svg>
                          </TouchableOpacity>
                        </Right>
                      </View>
                    )
                  }
                })}
              </ScrollView>
              <TouchableOpacity style={[mapStyles.removeAll, { borderColor: '#fff' }]} onPress={this.removeAllDoneMarkers}>
                <Icon name="trash-outline" style={{ color: '#fff' }}></Icon>
                <Text style={{ color: '#fff' }}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <Animated.View
            style={[mapStyles.subView,
            { transform: [{ translateY: this.state.bounceValue }] }]}
            onTouchEnd={this.dismissInput}
          >
            <View style={{ width: '100%', height: '100%', position: 'relative', }}>
              <ScrollView style={{ marginTop: 70, flex: 1, marginBottom: 60 }}>
                {postcodeResults.map((item, index) => {
                  return (
                    <TouchableOpacity key={index} onPress={() => this.addLocationToMap(item, index)}>
                      <View style={mapStyles.postcodeContainer}>
                        <Left>
                          <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={40} height={40}>
                            <Path
                              d="M441 132.9C423 74.8 375.7 27.5 317.7 9.6 297.3 3.3 276.4 0 256 0c-41.6 0-81.7 12.9-115.2 38-49.7 36.5-79.3 94.9-79.3 156.5 0 42.5 13.5 82.9 38.9 116.7L256 510.8l155.6-199.5c38.1-50.9 48.9-115.8 29.4-178.4zM256 299.3c-57.8 0-104.8-47-104.8-104.8S198.3 89.8 256 89.8s104.8 47 104.8 104.8-47 104.7-104.8 104.7z"
                              fill={index == 0 ? '#af76ea' : '#a3c3fa'}
                            />
                            <Path
                              d="M411.7 311.3L256 510.8V299.3c57.8 0 104.8-47 104.8-104.8S313.8 89.8 256 89.8V0c20.4 0 41.3 3.3 61.7 9.6 58.1 18 105.4 65.3 123.3 123.3 19.5 62.6 8.7 127.5-29.3 178.4z"
                              fill={index == 0 ? '#8359af' : '#8cb4f9'}
                            />
                            <Circle cx={256} cy={194.5} r={104.7} fill="#f0f3f4" />
                          </Svg>
                        </Left>
                        <Body style={{ alignItems: 'flex-start' }}>
                          <Text style={{ color: '#D7D8DC', }}>
                            {index == 0 ? item.postcode + ' - Post Code Area or Search on google' : item.address}
                          </Text>
                        </Body>
                        <Right>
                          <Icon name="add" style={{ color: index == 0 ? '#af76ea' : '#8cb4f9', fontWeight: 'bold' }} />
                        </Right>
                      </View>
                      {/* {index == 0 ? <Separator style={{ height: 1, marginVertical: 5 }}></Separator> : null} */}
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              {/* {postcodeResults.length ? (
                <View style={{ position: 'absolute', bottom: 55, width: '100%' }}>
                  <TouchableOpacity style={{ height: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                    <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12, fontFamily: 'Montserrat' }}>Search SDK for Android ©</Text>
                  </TouchableOpacity>
                </View>) : null
              } */}
            </View>
          </Animated.View>
          {!isSearchActive && selectedMarker.index && (this.containsObject(selectedMarker, markerList) || this.containsObject(selectedMarker, doneList)) ?
            (<>
              <View style={mapStyles.markerPan}>
                <TouchableOpacity style={mapStyles.markerRemove}
                  onPress={this.removeSelectedMarker}
                >
                  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={24} height={24}>
                    <Ellipse cx={256.3} cy={256} rx={255.9} ry={256}
                      fill={"#af76ea"}
                    />
                    <Path
                      d="M256.5 0v512c141.2-.1 255.7-114.7 255.7-256S397.7.1 256.5 0z"
                      fill={"#8359af"}
                    />
                    <Path
                      d="M372.4 182.8l-43.7-43.7c-2.1-2.1-5.6-2.1-7.8 0l-61.1 61.1c-2.1 2.1-5.6 2.1-7.8 0l-61.1-61.1c-2.1-2.1-5.6-2.1-7.8 0l-43.7 43.7c-2.1 2.1-2.1 5.6 0 7.8l61.1 61.1c2.1 2.1 2.1 5.6 0 7.8l-61.1 61.1c-2.1 2.1-2.1 5.6 0 7.8l43.7 43.7c2.1 2.1 5.6 2.1 7.8 0L252 311c2.1-2.1 5.6-2.1 7.8 0l61.1 61.1c2.1 2.1 5.6 2.1 7.8 0l43.7-43.7c2.1-2.1 2.1-5.6 0-7.8l-61.1-61.1c-2.1-2.1-2.1-5.6 0-7.8l61.1-61.1c2.1-2.2 2.1-5.7 0-7.8z"
                      fill={"#fff5f5"}
                    />
                    <Path
                      d="M372.4 190.5c2.1-2.1 2.1-5.6 0-7.8L328.7 139c-2.1-2.1-5.6-2.1-7.8 0l-61.1 61.1c-1 1-2.3 1.5-3.6 1.6v107.5c1.3.1 2.6.6 3.6 1.6l61.1 61.1c2.1 2.1 5.6 2.1 7.8 0l43.7-43.7c2.1-2.1 2.1-5.6 0-7.8l-61.1-61.1c-2.1-2.1-2.1-5.6 0-7.8l61.1-61z"
                      fill={"#dfebf1"}
                    />
                  </Svg>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                  <Left style={{ alignSelf: 'flex-start' }}>
                    <View>
                      {!selectedMarker.isDone ?
                        <>
                          <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={40} height={40}>
                            <Path
                              d="M441 132.9C423 74.8 375.7 27.5 317.7 9.6 297.3 3.3 276.4 0 256 0c-41.6 0-81.7 12.9-115.2 38-49.7 36.5-79.3 94.9-79.3 156.5 0 42.5 13.5 82.9 38.9 116.7L256 510.8l155.6-199.5c38.1-50.9 48.9-115.8 29.4-178.4zM256 299.3c-57.8 0-104.8-47-104.8-104.8S198.3 89.8 256 89.8s104.8 47 104.8 104.8-47 104.7-104.8 104.7z"
                              fill={(selectedMarker.isImportant ? '#af76ea' : '#a3c3fa')}
                            />
                            <Path
                              d="M411.7 311.3L256 510.8V299.3c57.8 0 104.8-47 104.8-104.8S313.8 89.8 256 89.8V0c20.4 0 41.3 3.3 61.7 9.6 58.1 18 105.4 65.3 123.3 123.3 19.5 62.6 8.7 127.5-29.3 178.4z"
                              fill={(selectedMarker.isImportant ? '#8359af' : '#8cb4f9')}
                            />
                            <Circle cx={256} cy={194.5} r={104.7} fill="#f0f3f4" />
                          </Svg>
                          <Text style={[mapStyles.markerLabel, { color: (selectedMarker.isImportant ? '#8359af' : '#8cb4f9') }]}>
                            {selectedMarker.index}
                          </Text>
                        </> :
                        <Svg
                          id="prefix__Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          x={0}
                          y={0}
                          viewBox="0 0 512 512"
                          xmlSpace="preserve"
                          width={40}
                          height={40}
                        >
                          <G id="prefix__main_marker_14_">
                            <Path
                              className="prefix__st0"
                              d="M440.1 133.2C422.1 75 374.7 27.6 316.5 9.6 296.1 3.3 275.1 0 254.7 0 213 0 172.8 12.9 139.2 38.1 89.4 74.7 59.7 133.2 59.7 195c0 42.6 13.5 83.1 39 117l156 200 156-200c38.1-51 48.9-116.1 29.4-178.8zM254.7 300c-57.9 0-105-47.1-105-105s47.1-105 105-105 105 47.1 105 105-47.1 105-105 105z"
                              fill='#49494B'
                            />
                            <Path
                              className="prefix__st0"
                              d="M410.7 312l-156 200V300c57.9 0 105-47.1 105-105s-47.1-105-105-105V0c20.4 0 41.4 3.3 61.8 9.6 58.2 18 105.6 65.4 123.6 123.6 19.5 62.7 8.7 127.8-29.4 178.8z"
                              fill='#49494B'
                            />
                          </G>
                          <Circle cx={254.6} cy={195} r={104.7} fill="#f0f3f4" />
                          <Path
                            id="prefix__done"
                            d="M229.2 270l-58.9-58.9 34.5-34.5 24.4 24.4 81.1-81.1 34.5 34.5L229.2 270z"
                            fill="#202125"
                          />
                        </Svg>
                      }
                    </View>
                  </Left>
                  <Body style={{ alignItems: 'flex-start' }}>
                    {!selectedMarker.isImportant ?
                      <>
                        <Text style={{ color: '#A2C3FA' }}>{selectedMarker.postcode}</Text>
                        <Text style={{ color: '#D7D8DC' }}>{selectedMarker.address}</Text>
                      </>
                      :
                      <View style={{ flexDirection: 'row' }}>
                        <View
                          style={[
                            mapStyles.markerDirection,
                            { backgroundColor: "#2A2B2F" }
                          ]}
                        >
                          <Text style={{ color: '#8359af' }}>{selectedMarker.postcode}</Text>
                        </View>
                        <TouchableOpacity
                          style={[mapStyles.markerDirection, { marginLeft: 10, backgroundColor: "#A2C3FA" }]}
                          // disabled={selectedMarker.isDone ? true : false}
                          onPress={() => this.linkGoogleMap(selectedMarker, "search")}
                        >
                          <Svg
                            height={25}
                            viewBox="0 0 512 512"
                            width={25}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <Path
                              d="M272.5 268.5l-54.958 84.957-52.443 22.442C134.2 340.499 101.201 298.5 85.6 245.4L117 187l50.5-23.5c-.899 5.4-1.5 10.8-1.5 16.5 0 49.499 40.499 90 90 90 5.7 0 11.1-.601 16.5-1.5z"
                              fill="#ffda2d"
                            />
                            <Path
                              d="M344.51 196.41c.9-5.37 1.49-10.74 1.49-16.41 0-49.46-40.44-89.94-89.89-90H256c-5.7 0-11.1.6-16.5 1.5l79.8-79.8c48.3 18 87 56.7 105 105l-79.8 79.8c0-.03.01-.06.01-.09z"
                              fill="#80aef8"
                            />
                            <Path
                              d="M424.3 116.7L397 170l-52.5 26.5c0-.03.01-.06.01-.09.9-5.37 1.49-10.74 1.49-16.41 0-49.46-40.44-89.94-89.89-90h-.08V74.97L274 35l45.3-23.3c48.3 18 87 56.7 105 105z"
                              fill="#4086f4"
                            />
                            <Path
                              d="M424.3 116.7l-79.8 79.799c-6.901 36.301-35.7 65.1-72.001 72.001h-.001l-86.872 86.871-20.528 20.527c5.101 5.7 9.6 10.802 14.401 16.201C212.5 429.6 241 463.999 241 497c0 8.399 6.599 15 15 15s15-6.601 15-15c0-33.001 28.5-67.4 61.5-104.9C378.701 340.199 436 275.4 436 180c0-22.2-3.9-43.5-11.7-63.3z"
                              fill="#59c36a"
                            />
                            <Path
                              d="M424.3 116.7l-79.799 79.798v.001c-6.901 36.301-35.7 65.1-72.001 72.001h-.002l-16.467 16.466v227.028C264.417 511.976 271 505.388 271 497c0-33.001 28.5-67.4 61.5-104.9C378.701 340.199 436 275.4 436 180c0-22.2-3.9-43.5-11.7-63.3z"
                              fill="#00a66c"
                            />
                            <Path
                              d="M256.031 284.969L272.5 268.5c-5.389.897-10.779 1.492-16.469 1.496z"
                              fill="#fdbf00"
                            />
                            <Path
                              d="M319.3 11.7l-79.8 79.8c-18.3 3.6-34.501 12.299-47.1 24.901L146 97l-17.2-44.2C161.201 20.099 206.201 0 256 0c22.2 0 43.5 3.9 63.3 11.7z"
                              fill="#4086f4"
                            />
                            <Path
                              d="M256.031 74.969L319.3 11.7C299.51 3.903 278.22.007 256.032.003v74.966z"
                              fill="#4175df"
                            />
                            <Path
                              d="M192.4 116.4c-12.599 12.6-21.301 28.799-24.9 47.1l-81.9 81.9c-6-20.099-9.6-41.7-9.6-65.4 0-49.801 20.099-94.801 52.8-127.2z"
                              fill="#f03800"
                            />
                          </Svg>
                          <Text style={{ marginLeft: 5 }}>Search</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  </Body>
                  {!selectedMarker.isImportant ?
                    <Right style={{ alignItems: 'center' }}>
                      {!selectedMarker.isDone ?
                        <TouchableOpacity
                          style={{ width: 40, height: 40, borderRadius: 50, borderWidth: 1, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                          onPress={() => this.shareMarker(selectedMarker)}
                        >
                          <Icon name="share-social-sharp" style={{ color: '#D7D8DC', marginLeft: -3 }} />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                          style={{ width: 40, height: 40, backgroundColor: '#A2C3FA', borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                          onPress={() => this.moveNextMarker(selectedMarker)}
                        >
                          <Svg
                            height={20}
                            viewBox="0 0 24 24"
                            width={20}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <Path
                              d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z"
                              fill="#2196f3"
                            />
                            <Path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12z" fill="#1d83d4" />
                            <Path
                              d="M12 18.25V15H6.25C5.561 15 5 14.439 5 13.75v-3.5C5 9.561 5.561 9 6.25 9H12V5.75c0-.66.795-.999 1.27-.541l6.5 6.25a.752.752 0 010 1.082l-6.5 6.25A.75.75 0 0112 18.25z"
                              fill="#fff"
                            />
                            <Path
                              d="M5 12h15a.752.752 0 01-.23.541l-6.5 6.25A.75.75 0 0112 18.25V15H6.25C5.561 15 5 14.439 5 13.75z"
                              fill="#dedede"
                            />
                          </Svg>
                        </TouchableOpacity>
                      }
                    </Right> :
                    <Right>
                      {!selectedMarker.isDone ?
                        null
                        :
                        <TouchableOpacity
                          style={{ width: 40, height: 40, backgroundColor: '#A2C3FA', borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                          onPress={() => this.moveNextMarker(selectedMarker)}
                        >
                          <Svg
                            height={20}
                            viewBox="0 0 24 24"
                            width={20}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <Path
                              d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z"
                              fill="#2196f3"
                            />
                            <Path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12z" fill="#1d83d4" />
                            <Path
                              d="M12 18.25V15H6.25C5.561 15 5 14.439 5 13.75v-3.5C5 9.561 5.561 9 6.25 9H12V5.75c0-.66.795-.999 1.27-.541l6.5 6.25a.752.752 0 010 1.082l-6.5 6.25A.75.75 0 0112 18.25z"
                              fill="#fff"
                            />
                            <Path
                              d="M5 12h15a.752.752 0 01-.23.541l-6.5 6.25A.75.75 0 0112 18.25V15H6.25C5.561 15 5 14.439 5 13.75z"
                              fill="#dedede"
                            />
                          </Svg>
                        </TouchableOpacity>
                      }
                    </Right>
                  }
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <Left></Left>
                  <Body style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[
                        mapStyles.markerDirection,
                        { backgroundColor: selectedMarker.isDone ? "#49494B" : "#A2C3FA" }
                      ]}
                      onPress={() => this.linkGoogleMap(selectedMarker, "directions")} disabled={selectedMarker.isDone ? true : false}>
                      <Svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width={28}
                        height={28}
                      >
                        <Path d="M0 0h24v24H0z" fill="none" />
                        <Path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"
                          fill="#1F2124"
                        />
                      </Svg>
                      <Text style={{ marginLeft: 5 }}>Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[mapStyles.markerDirection, { marginLeft: 10, backgroundColor: "#A2C3FA" }]}
                      onPress={() => this.changeMarkerDone(selectedMarker)}
                    // disabled={selectedMarker.isDone ? true : false}
                    >
                      {!selectedMarker.isDone ?
                        <>
                          {/* <Icon name="checkmark-sharp" style={{ color: '#1F2124' }} /> */}
                          <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 509 509" width={20} height={20}>
                            <Path
                              d="M171.3 472.9L-.5 301l100.6-100.6 71.2 71.3L407.9 35.1l100.6 100.6-337.2 337.2z"
                              fill="#202125"
                            />
                          </Svg>
                          <Text style={{ marginLeft: 5 }}>Done</Text>
                        </>
                        : <>
                          <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.7 426.7"
                            width={20} height={20}
                            style={{ marginRight: 5 }}
                          >
                            <Path
                              d="M326.9 81.1H145.4l15.2-37.2c3.2-7.9.9-17-5.8-22.4-6.7-5.4-16.1-5.7-23.1-.8l-123 85.4c-5.4 3.7-8.5 10-8.3 16.5.2 6.5 3.7 12.6 9.3 16l128.5 78.1c7.3 4.4 16.7 3.6 23-2.2 6.4-5.7 8.2-15 4.5-22.8L148.9 156h178c13.1 0 23.8 10.9 23.8 24v130.2c0 13.1-10.7 23.6-23.8 23.6h-197c-17.6 0-31.8 14.2-31.8 31.8v11.2c0 17.6 14.2 31.8 31.8 31.8h197c54.4 0 98.7-44.1 98.7-98.5V180c0-54.4-44.2-98.9-98.7-98.9z"
                              fill="#202125"
                            />
                          </Svg>
                          <Text style={{ marginLeft: 5 }}>Back</Text>
                        </>
                      }
                    </TouchableOpacity>
                  </Body>
                  <Right></Right>
                </View>
              </View>
            </>) : null
          }
        </Container>
      </>
    );
  }
}

const mapStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  searchBar: {
    zIndex: 999,
    backgroundColor: '#292B2E',
    margin: 10,
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 50,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    paddingHorizontal: 20,
    backgroundColor: '#A2C3FA',
    height: '100%',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: height - 55,
    overflow: 'hidden'
  },
  // mapTypeBtnContainerPosition: {
  //   right: 10,
  //   top: 70,
  //   backgroundColor: '#292B2E',
  //   borderColor: '#000',
  //   borderWidth: 1,
  //   width: 40,
  //   height: 40,
  // },
  mapLibraryBtnContainerPosition: {
    right: 10,
    top: 70,
    backgroundColor: '#292B2E',
    borderColor: '#000',
    borderWidth: 1,
    // width: 40,
    height: 40,
    flexDirection: 'row',
    paddingHorizontal: 10
  },
  myLocationBtnContainerPosition: {
    right: 10,
    top: 120,
    backgroundColor: '#292B2E',
    // borderColor: '#000',
    // borderWidth: 1,
    width: 40,
    height: 40,
  },
  zoomOutContainerPosition: {
    left: 10,
    top: 70,
    backgroundColor: '#292B2E',
    // borderColor: '#000',
    // borderWidth: 1,
    width: 40,
    height: 40,
  },
  zoomInContainerPosition: {
    left: 10,
    top: 120,
    backgroundColor: '#292B2E',
    // borderColor: '#000',
    // borderWidth: 1,
    width: 40,
    height: 40,
  },
  myLocationBtnContainer: {
    zIndex: 500,
    position: 'absolute',
    borderRadius: 50,
    // backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 50,
    elevation: 10,
  },
  subView: {
    zIndex: 990,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#1D2535",
    height: height,
  },
  postcodeContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#292B2E',
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 1
  },
  markerLabel: {
    position: 'absolute',
    width: 40,
    top: 6,
    textAlign: 'center',
    color: '#a3c3fa',
    fontSize: 11
  },
  markerOptions: {
    position: 'absolute',
    bottom: 170,
    flexDirection: 'row',
    paddingHorizontal: 10
  },
  markerRemove: {
    marginTop: -10,
    marginBottom: 15,
    backgroundColor: '#1F2124',
    width: 20,
    height: 20,
    // marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 50,
    elevation: 5,
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1,
  },
  changeMarkerColor: {
    backgroundColor: '#1F2124',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 50,
    elevation: 5,
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  markerPan: {
    // backgroundColor: '#3E444D',
    backgroundColor: '#1F2124',
    width: width,
    minHeight: 60,
    maxHeight: 350,
    // height: 160,
    position: 'absolute',
    bottom: 0,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  markerDirection: {
    backgroundColor: '#A2C3FA',
    borderRadius: 50,
    // width: 40,
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  // markerDone: {
  //   backgroundColor: '#A2C3FA',
  //   borderRadius: 50,
  //   // width: 40,
  //   height: 40,
  //   paddingHorizontal: 10,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   alignSelf: 'flex-start'
  // },
  libraryPan: {
    width: width - 20,
    minHeight: 40,
    maxHeight: 200,
    marginHorizontal: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D2535'
  },
  markerLeft: {
    flexDirection: 'row',
    flex: 1
  },
  markerLeftIndex: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 0,
    backgroundColor: '#ffcd39',
    flex: 1
  },
  markerLeftRemove: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffc107',
    width: 25
  },
  markerAddress: {
    paddingVertical: 10,
    backgroundColor: '#2A2B2E',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center'
  },
  libraryDirection: {
    backgroundColor: '#a3c3fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    flex: 1,
    width: '100%'
  },
  removeAll: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#af76ea',
    borderTopWidth: 1
  }
});

function mapStateToProps({ state, marker }) {
  return { state, marker };
}

const bindActions = {
  runQuery,
  showProgress,
  hideProgress,
  setMarkerlist,
  setDonelist,
  setSelectedMarker,
  setCenterCoords,
  setNextDownload
};

export default connect(mapStateToProps, bindActions)(Locator);
