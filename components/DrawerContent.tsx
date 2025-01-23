import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { LogOut } from "@tamagui/lucide-icons";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "store/auth.store";
import { SizableText, useTheme, View } from "tamagui";

export default function DrawerContent(props: any) {
  const color = useTheme();
  const colorScheme = useColorScheme();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View
      flex={1}
      backgroundColor={colorScheme === "dark" ? color.red1.val : color.red2.val}
    >
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={"Log Out"}
          onPress={function (): void {
            useAuthStore.getState().signOut();
          }}
          icon={() => <LogOut />}
        />
      </DrawerContentScrollView>

      <View paddingBottom={20 + bottom}>
        <SizableText
          color={color.accentColor.val}
          size={"$1"}
          textAlign={"center"}
          opacity={0.5}
        >
          UiTM Campus Runner Service
        </SizableText>
      </View>
    </View>
  );
}
