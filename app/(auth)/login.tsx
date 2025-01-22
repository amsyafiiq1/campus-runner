import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAuthStore } from "store/auth.store";
import { Button, Input, SizableText, View, XStack, Text } from "tamagui";
// import { Text } from "react-native";

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    console.log("Logging in...");
    signInWithEmail(email, password);
  };

  useEffect(() => {
    if (error?.code === "PGRST116") {
      Alert.alert("Error", "No user found");
    }
  }, [error]);

  return (
    <>
      <View padding={"$4"} gap={"$4"} flex={1}>
        <SizableText size={"$8"}>Great to have you back!</SizableText>

        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <XStack w={"100%"}>
          <Input
            placeholder="Password"
            secureTextEntry={!showPassword}
            flex={1}
            value={password}
            onChangeText={setPassword}
          />
          <Eye
            size={"$1"}
            position="absolute"
            right={"$4"}
            top="50%"
            transform={[{ translateY: -11 }]}
            onPress={() => setShowPassword(false)}
            display={showPassword ? "block" : "none"}
          />
          <EyeOff
            size={"$1"}
            position="absolute"
            right={"$4"}
            top="50%"
            transform={[{ translateY: -11 }]}
            onPress={() => setShowPassword(true)}
            display={showPassword ? "none" : "block"}
          />
        </XStack>
        <Button onPress={handleLogin}>Log In</Button>

        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Text color={"$red10"}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <View position="absolute" bottom={"$8"} w={"100%"}>
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Text
            color={"$red10"}
            onPress={() => {
              router.push("/(auth)/signin");
            }}
          >
            Don't have an account?
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default LoginScreen;
