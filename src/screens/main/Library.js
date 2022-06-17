import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Dimensions, FlatList, Linking, TouchableOpacity } from 'react-native';
import { Button, Container, Content, Text, Icon, Left, View, Body, Right } from 'native-base';
import Svg, { Path } from 'react-native-svg';

import { setMarkerlist, setSelectedMarker, setCenterCoords } from '../../actions/marker';
import { Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

class Library extends Component {
  constructor(props) {
    super(props);
  }
  linkGoogleMap = (item) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${item.latitude},${item.longitude}`;
    const label = 'Custom Label';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
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
            this.props.setSelectedMarker({})
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
            this.props.setMarkerlist([]);
            this.props.setSelectedMarker({})
          }
        }
      ]
    );
  }

  moveToMap = (item, index) => {
    this.props.setSelectedMarker({
      index: index + 1,
      postcode: item.postcode,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      isImportant: item.isImportant ? 1 : 0
    });
    this.props.setCenterCoords([parseFloat(item.longitude), parseFloat(item.latitude)]);

    this.props.navigation.navigate('Home');
  }
  render() {
    const { markerList } = this.props.marker;

    return (
      <Container>
        <ScrollView style={{marginBottom: 50}}>
          {markerList.map((item, index) => {
            return (
              <View style={libraryStyles.markerPan} key={index} onPress={() => this.linkGoogleMap(item)}>
                <Left>
                  <View style={libraryStyles.markerLeft}>
                    <View style={[libraryStyles.markerLeftIndex, { backgroundColor: item.isImportant ? '#E95851' : '#ffcd39' }]}>
                      <Text >{index + 1}</Text>
                    </View>
                    <TouchableOpacity style={[libraryStyles.markerLeftRemove, { backgroundColor: item.isImportant ? '#E7335C' : '#ffc107' }]} onPress={() => this.removeMarker(item, index)}>
                      <Icon name="close-outline" style={{ color: '#fff', fontSize: 24 }}></Icon>
                    </TouchableOpacity>
                  </View>
                </Left>
                <Body>
                  <TouchableOpacity style={libraryStyles.markerAddress} onPress={() => this.moveToMap(item, index)}>
                    <Text style={{ paddingHorizontal: 10 }}>{item.address}</Text>
                  </TouchableOpacity>
                </Body>
                <Right>
                  <TouchableOpacity style={libraryStyles.markerDirection} onPress={() => this.linkGoogleMap(item)}>
                    <Svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width={28}
                      height={28}
                    >
                      <Path d="M0 0h24v24H0z" fill="#4687DE" />
                      <Path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"
                        fill="#fff"
                      />
                    </Svg>
                  </TouchableOpacity>
                </Right>
              </View>
            )
          })}
        </ScrollView>
        <TouchableOpacity style={libraryStyles.removeAll} onPress={this.removeAllMarkers}>
          <Icon name="trash-outline"></Icon>
          <Text>Remove All</Text>
        </TouchableOpacity>
      </Container>
    );
  }
}

const libraryStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  libraryPan: {
    width: width - 20,
    minHeight: 60,
    maxHeight: 100,
    marginHorizontal: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2'
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
    paddingVertical: 5,
  },
  markerDirection: {
    backgroundColor: '#4687DE',
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
    borderColor: '#f00',
    borderTopWidth: 1
  }
});

function mapStateToProps({ marker }) {
  return { marker };
}

const bindActions = {
  setMarkerlist,
  setSelectedMarker,
  setCenterCoords
};

export default connect(mapStateToProps, bindActions)(Library);
// export default Library;