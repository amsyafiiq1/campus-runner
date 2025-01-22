import Drawer from "expo-router/drawer";
import { Home, Menu } from "@tamagui/lucide-icons";
import { useTheme, XStack } from "tamagui";
import DrawerContent from "components/DrawerContent";

const DrawerLayout = () => {
  const color = useTheme();

  return (
    <Drawer
      drawerContent={DrawerContent}
      screenOptions={({ navigation }) => ({
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
          title: "Campus Runner",
          headerTitleAlign: "center",
          drawerLabel: "Home",
          headerStyle: { backgroundColor: color.colorTransparent.val },
          drawerLabelStyle: { color: color.accentColor.val },
          drawerActiveBackgroundColor: color.red6.val,
          drawerIcon: () => <Home size={"$1"} color={color.accentColor.val} />,
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
