import React, { Component } from 'react';
import { Body, Button, Container, Content, Footer, Header, Left, Right, Root, Text, Title, Toast, Icon, H1, Subtitle, H3, Row, Input, Item } from 'native-base';
import MapView, { Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import haversine from "haversine";
import Geolocation from 'react-native-geolocation-service';


import styles, { Material, screenSize } from '../../styles';
import { Center } from '../../components';
import { Dimensions, StyleSheet, View, TouchableOpacity, Platform, PermissionsAndroid, Image } from 'react-native';


const { width, height } = Dimensions.get("window")

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
// const LATITUDE = 37.78825;
// const LONGITUDE = -122.4324;

class Locator extends Component {
  state = {
    searchKey: '',
    latitude: 0,
    longitude: 0,
    routeCoordinates: [],
    distanceTravelled: 0,
    prevLatLng: {},
    mapType: 'standard',
    isGetLocation: false
  };

  coordinate = new AnimatedRegion({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  });


  async componentDidMount() {
    this.coordinate.timing({
      duration: 500
    });

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
        'title': 'Location Access Required',
        'message': 'This App needs to Access your location'
      }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.gotToMyLocation();
        //To Check, If Permission is granted
        this.watchPosition();
      } else {
        alert("Permission Denied");
      }
    } catch (err) {
      alert("err", err);
    }
  }

  watchPosition = () => {
    this.watchID = Geolocation.watchPosition(
      position => {
        const { coordinate, routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = position.coords;
        // console.log({ latitude, longitude });

        const newCoordinate = {
          latitude,
          longitude
        };
        if (Platform.OS === "android") {
          if (this.marker) {
            this.coordinate.setValue({
              ...newCoordinate,
              latitudeDelta: 0,
              longitudeDelta: 0
            });

            // this.marker._component.animateMarkerToCoordinate(
            //   newCoordinate,
            //   500
            // );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }
        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          prevLatLng: newCoordinate
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 500, distanceFilter: 1 }
    );
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  onChangeSearch = (searchKey) => {
    this.setState({ searchKey });
  }

  onCheck = () => {
    console.log('ddddddddddddddddddd', this.state.searchKey);
  }

  onCancelSearch = () => { }

  gotToMyLocation = () => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        this.setState({
          isGetLocation: true,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (this.map) {
          this.map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          })
          this.coordinate.setValue({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          });
        }
      },
      (error) => alert('Error: Are location services on?'),
      { enableHighAccuracy: true }
    )
  }

  changeMapType = () => {
    console.log('map type', this.state.mapType)
    this.setState({
      mapType: this.state.mapType == 'standard' ? 'satellite' : 'standard'
    })
  }

  render() {
    const { searchKey, isGetLocation } = this.state;
    return (
      <>
        <Header iosBarStyle={Material.iosStatusbar} searchBar rounded>
          <Item style={{ marginTop: 10 }}>
            <Input placeholder="Search" onChangeText={this.onChangeSearch} value={searchKey} />
            {searchKey ?
              <Button transparent rounded icon onPress={this.onCancelSearch}>
                <Icon name="close-circle" />
              </Button> : null}
            <Button transparent onPress={this.onCheck} rounded>
              <Icon name="close" />
            </Button>
          </Item>
        </Header>
        <Container>
          {isGetLocation? <MapView
            ref={map => { this.map = map; }}
            style={mapStyles.map}
            provider={PROVIDER_GOOGLE}
            showUserLocation
            followUserLocation
            showsMyLocationButton
            loadingEnabled
            initialRegion={this.getMapRegion()}
            mapType={this.state.mapType}
          >
            <Marker.Animated
              ref={marker => {
                this.marker = marker;
              }}
              coordinate={this.coordinate}
              pinColor="blue"
            >
              <Image style={{ width: 20, height: 20 }}
              source={require('../../../assets/images/icons/livelocation.png')} />
            </Marker.Animated>
          </MapView> : null}
          <TouchableOpacity onPress={this.changeMapType} rounded style={[mapStyles.mapTypeBtnContainerPosition, mapStyles.myLocationBtnContainer]}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require('../../../assets/images/icons/maplayers.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.gotToMyLocation} rounded style={[mapStyles.myLocationBtnContainerPosition, mapStyles.myLocationBtnContainer]}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require('../../../assets/images/icons/mylocation1.png')}
            />
          </TouchableOpacity>
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
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  },
  mapTypeBtnContainerPosition: {
    left: 10, 
    top: 10,
  },
  myLocationBtnContainerPosition: {
    left: 10, 
    top: 70,
  },
  myLocationBtnContainer: {
    position: 'absolute', 
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#d2d2d2",
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Locator;
