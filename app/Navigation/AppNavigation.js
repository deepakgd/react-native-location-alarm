import * as React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import routes from "./routes";

const routeConfig = {};

routes.map(route => {
  routeConfig[route.name] = route.screen;
});

const MainStack = createStackNavigator(
  {
    ...routeConfig
  },
  {
    headerMode: "none"
  }
);

export default createAppContainer(MainStack);
