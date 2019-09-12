import HomeScreen from '../Views/Home';
import AboutScreen from '../Views/About';


/* Icon key is optional. It must be of type string and its value should match a valid provider icon
  name.
  To omit the icon just pass null on its value.
*/
export default [
  { name: 'Home', screen: HomeScreen, icon: 'book' },
  { name: 'About', screen: AboutScreen, icon: 'information-outline' },
];
// note whenever searching for icon - look in MaterialCommunityIcons section in below link
// https://oblador.github.io/react-native-vector-icons/