import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  Platform,
  View,
  StatusBar,
  DrawerLayoutAndroid, Alert
} from 'react-native';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert';


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


let store = createStore(reducer);
/* getDrawerWidth       Default drawer width is screen width - header width
* https://material.io/guidelines/patterns/navigation-drawer.html
*/
const getDrawerWidth = () => Dimensions.get('window').width - (Platform.OS === 'android' ? 56 : 64);

export default class App extends Component {
  constructor() {
    super();

    this.drawer = React.createRef();
    this.navigator = React.createRef();
  }
 
  componentDidMount() {
    store.dispatch(setNavigator(this.navigator.current));
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
var interval = 1;
// Start a timer that runs continuous after X milliseconds
const intervalId = BackgroundTimer.setInterval(() => {
	// this will be executed every 200 ms
	// even when app is the the background
  console.log('tic');
  PushNotification.localNotificationSchedule({
      message: `Notifcation - ${interval}`,
      date: new Date()
  });
  if(interval === 3) {
    // Cancel the timer when you are done with it
    BackgroundTimer.clearInterval(intervalId);
  }
  interval += 1;
}, 5000);
