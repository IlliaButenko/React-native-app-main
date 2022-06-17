import { Dimensions, StyleSheet } from "react-native";
import { default as Material } from '../native-base-theme/variables/material';

export const screenSize = Dimensions.get('window');
export { default as Material } from '../native-base-theme/variables/material';

const { width, height } = screenSize;

const style = StyleSheet.create({
  logoTitle: {
    fontSize: 50,
    fontWeight: 'bold'
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  pageTitleSub: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Material.disableRow
  },
  overlay: {
    width: width,
    height: height,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: Material.overlayColor,
    alignItems: 'center',
    flexDirection: 'row'
  },

  // Code fields for Verification Code
  codeFieldRoot: { marginTop: 20 },
  codeCell: {
    width: width / 7,
    height: width / 7,
    lineHeight: width / 8,
    fontSize: width / 8,
    textAlign: 'center',
    backgroundColor: Material.contentStyle,
    marginHorizontal: 1,
    paddingTop: 5,
    borderRadius: 5,
    color: Material.blackColor
  },
  focusCell: {
    borderColor: '#000',
  },

  tabContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    width: width / 5,
    height: width * 0.15,
    backgroundColor: '#fff'
  },
  tabIcon: {
    color: Material.blackColor
  }
});

export default style;
