import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="signin"
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
};

export default AuthLayout;
