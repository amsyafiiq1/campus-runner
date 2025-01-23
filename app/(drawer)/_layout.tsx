import Drawer from "expo-router/drawer";
import { Home, ListOrdered, Menu } from "@tamagui/lucide-icons";
import { Image, useTheme, XStack } from "tamagui";
import DrawerContent from "components/DrawerContent";
import { useColorScheme } from "react-native";

const DrawerLayout = () => {
  const color = useTheme();
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={DrawerContent}
      screenOptions={({ navigation }) => ({
        headerShadowVisible: false,
        headerBackgroundContainerStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? color.colorTransparent.val
              : color.gray4.val,
        },
        headerLeft: () => (
          <XStack onPress={() => navigation.openDrawer()} padding={16}>
            <Menu size={24} color={"$accentForeground"} />
          </XStack>
        ),
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerShadowVisible: false,
          headerTitle: () => (
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 100, height: 100 }}
            />
          ),
          headerTitleAlign: "center",
          drawerLabel: "Home",
          headerStyle: { backgroundColor: "transparent" },
          drawerLabelStyle: { color: color.accentColor.val },
          drawerActiveBackgroundColor: color.red6.val,
          drawerIcon: () => <Home size={"$1"} color={color.accentColor.val} />,
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Order History",
          headerTitleAlign: "center",
          drawerLabel: "Order",
          headerStyle: { backgroundColor: "transparent" },
          drawerLabelStyle: { color: color.accentColor.val },
          drawerActiveBackgroundColor: color.red6.val,
          drawerIcon: () => (
            <ListOrdered size={"$1"} color={color.accentColor.val} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
