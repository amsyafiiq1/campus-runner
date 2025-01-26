import "../tamagui-web.css";

import { useEffect } from "react";
import { StatusBar, useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { Provider } from "./Provider";
import { SizableText, useTheme, XStack, Image } from "tamagui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  // initialRouteName: "(drawer)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(drawer)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="search"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="order"
            options={{
              header: () => (
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  paddingTop={"$11"}
                  height={50}
                  paddingBottom={"$4"}
                  backgroundColor={"$background"}
                >
                  <Image
                    source={require("../assets/images/icon.png")}
                    style={{ width: 100, height: 100 }}
                  />
                </XStack>
              ),

              headerShadowVisible: false,
              headerTitleAlign: "center",
              headerBackVisible: false,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
