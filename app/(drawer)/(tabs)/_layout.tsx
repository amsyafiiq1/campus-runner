import { useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { useTheme } from "tamagui";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const TabsLayout = () => {
  const color = useTheme();
  const colorScheme = useColorScheme();
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: color.red10.val,
        tabBarInactiveTintColor: color.gray10.val,
        tabBarIndicatorStyle: {
          backgroundColor: color.red10.val,
        },
        tabBarStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? color.colorTransparent.val
              : color.gray4.val,
        },
        tabBarLabelStyle: { textTransform: "none" },
      }}
    >
      <MaterialTopTabs.Screen
        name="ongoing"
        options={{
          title: "On Going",
        }}
      />
      <MaterialTopTabs.Screen
        name="completed"
        options={{
          title: "Completed",
        }}
      />
      <MaterialTopTabs.Screen
        name="cancelled"
        options={{
          title: "Cancelled",
        }}
      />
    </MaterialTopTabs>
  );
};

export default TabsLayout;
