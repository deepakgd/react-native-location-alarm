import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  Platform,
  View,
  StatusBar,
  DrawerLayoutAndroid, 
  Alert,
  Text,
  PermissionsAndroid
} from 'react-native';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert';
import to from 'await-to-js';


import reducer from './app/Redux/reducers';
import { setNavigator, setActiveRoute } from "./app/Redux/actions";
import DrawerContent from './app/Navigation/DrawerContent';
import Toolbar from './app/Navigation/Toolbar';
import AppNavigation from './app/Navigation/AppNavigation';
import { bgStatusBar, bgDrawer } from './app/global.styles';

// ID-1 - task -run even in foreground or background but not work if app killed
import BackgroundTimer from 'react-native-background-timer';
import PushController from './app/Views/PushController';
import PushNotification from 'react-native-push-notification';

// ID-2 - task - run even if app killed
// import BackgroundTaskController from "./BackgroundTaskController";

// ID-3 - get current location
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';

let store = createStore(reducer);
/* getDrawerWidth       Default drawer width is screen width - header width
* https://material.io/guidelines/patterns/navigation-drawer.html
*/
const getDrawerWidth = () => Dimensions.get('window').width - (Platform.OS === 'android' ? 56 : 64);


var locations = [], centerPoint = { lat: 12.9820181, lon: 80.251561 }, km = 0.2



export default class App extends Component {
  constructor() {
    super();
    // creating global variable
    global.centerPoint = centerPoint;
    global.km = km;
    global.currentLocation = { };

    this.drawer = React.createRef();
    this.navigator = React.createRef();
    this.state = {
      activities: []
    }

    this.callLocation.bind(this);
    this.requestLocationPermission.bind(this);
  }
 
  async componentDidMount() {
    store.dispatch(setNavigator(this.navigator.current));

    //Checking for the permission just after component loaded
    if(Platform.OS === 'ios'){
        this.callLocation();
    }else{
        this.requestLocationPermission();
    }    

   
  }

  async requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
            'title': 'Location Access Required',
            'message': 'This App needs to Access your location'
        }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //To Check, If Permission is granted
        this.callLocation();
        } else {
          alert("Permission Denied");
        }
    } catch (err) {
        alert("err",err);
        console.log(err)
    }
  }

  async callLocation(){
    // BackgroundTaskController.init();

    // get already saved locations
    let error;
    [error, locations] = await to(this.getLocations());
    if(error) return console.log(error);
    console.log("Locations are ", locations)

    this.initTaskRunner()
  }
  
  openDrawer = () => {
    this.drawer.current.openDrawer();
  };

  closeDrawer = () => {
    this.drawer.current.closeDrawer();
  }; 
 
  getActiveRouteName = navigationState => {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return getActiveRouteName(route);
    }
    return route.routeName;
  };


  initTaskRunner(){ 
    let error, location, isInside, response, status;
    // set background and foreground runner 
    // Start a timer that runs continuous after X milliseconds
    const locationInterval = BackgroundTimer.setInterval(async () => {
      console.log('running location interval');

      // get current location
      [error, location] = await to(this.getCurrentLocation());
      if(error) return console.log(error);
      console.log("current location ", location);
      // save location
      [error, response] = await to(this.saveLocation(location));
      if(error) return console.log(error);
      // validate current location within radius
      isInside = this.validateLocation(location);
      console.log("isInside-->", isInside);

      if(!isInside && (!status || status === "inside")){
        PushNotification.localNotificationSchedule({
          message: `Out of range. Please come back`,
          date: new Date()
        });
        status = "outside";
      }else if(isInside && (!status || status === "outside")) {
        PushNotification.localNotificationSchedule({
          message: `Thanks for coming back`,
          date: new Date()
        });
        status = "inside";
      }
    }, 5000);
  }


  async getLocations(){
    let [error, savedLocation] = await to(AsyncStorage.getItem('locations'));
    if(error) return console.log(error);
    if(savedLocation){
      savedLocation = JSON.parse(savedLocation);
      Array.prototype.push.apply(locations, savedLocation);
    }
    return locations;
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
          resolve({ lat: parseFloat(currentLatitude), lon: parseFloat(currentLongitude) })
        },
        (error) => alert(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    })
  }

  saveLocation(location){
    global.currentLocation = Object.assign({}, location);
    locations.push(location);
    return AsyncStorage.setItem('locations', JSON.stringify(locations));
  }

  validateLocation(checkPoint){
      var ky = 40000 / 360;
      var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
      var dx = Math.abs(centerPoint.lon - checkPoint.lon) * kx;
      var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
      return Math.sqrt(dx * dx + dy * dy) <= km;
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Provider store={store}> 
          <DrawerLayoutAndroid
            drawerWidth={getDrawerWidth()}
            drawerPosition={DrawerLayoutAndroid.positions.Left}
            renderNavigationView={
              () => <DrawerContent closeDrawer={this.closeDrawer} />
            }
            drawerBackgroundColor={bgDrawer}
            ref={this.drawer}
          >
            <View style={styles.container}>
              <StatusBar
                  translucent
                  backgroundColor={bgStatusBar}
                  animated
              />
              <Toolbar showMenu={this.openDrawer} />
              <AppNavigation
                onNavigationStateChange={(prevState, currentState) => {
                  const currentScreen = this.getActiveRouteName(currentState);
                  store.dispatch(setActiveRoute(currentScreen));
                }}
                ref={this.navigator}
              />
            </View>
          </DrawerLayoutAndroid>
        </Provider>
        {/* common notification component */}
        <DropdownAlert ref={ref => global.dropDownAlertRef = ref}  closeInterval={2000} tapToCloseEnabled={true} />

        {/* ID-1 */}
        <PushController />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});

// ID-1 code pratice: run job event 5 second and send local push notification and stop it after 15 second
// var interval = 1;
// // Start a timer that runs continuous after X milliseconds
// const intervalId = BackgroundTimer.setInterval(() => {
// 	// this will be executed every 200 ms
// 	// even when app is the the background
//   console.log('tic');
//   PushNotification.localNotificationSchedule({
//       message: `Notifcation - ${interval}`,
//       date: new Date()
//   });

//   // getCurrentLocation();
  
//   if(interval === 1) {
//     // Cancel the timer when you are done with it
//     BackgroundTimer.clearInterval(intervalId);
//   }
//   interval += 1;
// }, 5000);