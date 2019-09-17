import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    ImageBackground,
    View,
    Button
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { navigateTo } from '../Redux/actions';
import { bgDrawerActiveItem } from '../global.styles';
const backgroundImage = require('../Images/background-images-for-android-app-10.jpg');

import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';
import MapView, { Marker, Circle } from 'react-native-maps';
import to from 'await-to-js';

class Home extends React.Component{

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount(){
   
  }


  resetLocation(){
    AsyncStorage.setItem('locations', JSON.stringify([]))
  }

  getDelta(lat, lon, distance) {
    const oneDegreeOfLatitudeInMeters = 111.32 * 1000;

    const latitudeDelta =distance / oneDegreeOfLatitudeInMeters;
    const longitudeDelta = distance / (oneDegreeOfLatitudeInMeters * Math.cos(lat * (Math.PI / 180)));

    return {
        latitude: lat,
        longitude: lon,
        latitudeDelta,
        longitudeDelta,
    }
  }

  getCurrentLocation(){
    return new Promise((resolve, rejects)=>{
      Geolocation.getCurrentPosition(
        //Will give you the current location
        (position) => {
          console.log(position)
          let currentLongitude = JSON.stringify(position.coords.longitude);
          //getting the Longitude from the location json
          let currentLatitude = JSON.stringify(position.coords.latitude);
          resolve({ lat: currentLatitude, lon: currentLongitude })
        },
        (error) => alert(error.message),
        { enableHighAccuracy: true, timeout: 20000 }
      );
    })
  }

  render(){
    const { activeRoute, navigateTo } = this.props;
    const { latitude, longitude, latitudeDelta, longitudeDelta   } = this.getDelta(global.centerPoint.lat, global.centerPoint.lon, 1008);
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.container}
        imageStyle={{ opacity: 0.3 }}
      >

       <Button 
        title={"Reset location" + global.km}
        onPress={()=>{this.resetLocation()}}
        style={styles.resetButton}
       />


      <MapView
          style={styles.map}
          initialRegion={{
              latitude,
              longitude,
              latitudeDelta,
              longitudeDelta,
          }}
          showsUserLocation={true}
      >

        <Marker
            coordinate={{latitude, longitude}}
            title="Center Point"
            description="Radius of the circle"
        />


        <Circle 
            center={{latitude, longitude}}
            radius={ global.km * 1000 }
            strokeColor="#9d0707"
            strokeWidth={3}
            fillColor="#f7b7b7"
        />

      </MapView>
        
        {/* <View style={styles.bottomView}>
                    <Button
                        title="Show all" 
                        buttonStyle={styles.buttonLeft}
                    />
                    <Button
                        title="Add"
                        buttonStyle={styles.buttonRight}
                    />
                </View> */}
      </ImageBackground>
    )
  }
}

Home.propTypes = {
  activeRoute: PropTypes.shape({
    name: PropTypes.string.isRequired,
    screen: PropTypes.any.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  navigateTo: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  map: {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
  },
    view: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingTop: 20,
        marginHorizontal: 22
    },
    buttonView: {
      width: 90, 
      height: 40,
      marginBottom:15,
      marginRight: 15
    },
    header1: {
        fontSize: 28,
        marginBottom: '30%',
    },
    text: {
        fontSize: 20,
        width: '70%',
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: '10%',
    },
    atozButton: {
      backgroundColor: '#868e91'
    },
    bottomView: {
      flexDirection: 'row',
      width: '100%',  
      position: 'absolute',
      bottom: 0.5,
      marginHorizontal: 2
    }, 
    buttonLeft: {
        width: "90%",
        // marginLeft: 2,
        marginRight: -2, 
        backgroundColor: bgDrawerActiveItem
    }, 
    buttonRight: { 
        width: "97%", 
        backgroundColor: bgDrawerActiveItem,
        marginLeft: -17, 
        // marginRight: 1
    },
});

const mapStateToProps = state => ({
  activeRoute: state.routes.activeRoute,
});

const mapDispatchToProps = dispatch => ({
  navigateTo: routeName => { dispatch(navigateTo(routeName)); },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);