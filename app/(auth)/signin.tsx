import { router } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Customer, useAuthStore } from "store/auth.store";
import { Button, Input, SizableText, View, Text } from "tamagui";

const SigninPage = () => {
  const [customer, setCustomer] = useState<Customer>({
    id: 0,
    createdAt: "",
    user: {
      id: "",
      email: "",
      supabaseUuid: "",
      name: "",
      phone: "",
      type: "",
      photo: undefined,
      createdAt: undefined,
    },
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const signIn = useAuthStore((state) => state.signUpWithEmail);

  const handleSignIn = () => {
    if (
      !customer.user.email ||
      !password ||
      !confirmPassword ||
      !customer.user.name ||
      !customer.user.phone ||
      !customer.user.id
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Signing up...", customer);
    signIn(customer, password);
  };

  // useEffect(() => {
  //   // console.log(customer);
  // }, [customer]);

  return (
    <>
      <View padding={"$4"} gap={"$4"} flex={1}>
        <SizableText size={"$8"}>Create an account</SizableText>
        <Input
          placeholder="Email"
          onChangeText={(email) => {
            setCustomer({ ...customer, user: { ...customer?.user, email } });
          }}
          value={customer?.user?.email}
        />
        <Input
          placeholder="Name"
          onChangeText={(name) => {
            setCustomer({ ...customer, user: { ...customer?.user, name } });
          }}
          value={customer?.user?.name}
        />
        <Input
          placeholder="Student / Staff ID"
          onChangeText={(id) => {
            setCustomer({ ...customer, user: { ...customer?.user, id } });
          }}
          value={customer?.user?.id}
        />
        <Input
          placeholder="Phone Number"
          onChangeText={(phone) => {
            setCustomer({ ...customer, user: { ...customer?.user, phone } });
          }}
          value={customer?.user?.phone}
        />
        <Input
          placeholder="Password"
          onChangeText={(password) => {
            setPassword(password);
          }}
          value={password}
          secureTextEntry
        />
        <Input
          placeholder="Confirm Password"
          onChangeText={(confirmPassword) => {
            setConfirmPassword(confirmPassword);
          }}
          value={confirmPassword}
          secureTextEntry
        />

        <Button
          onPress={() => {
            handleSignIn();
          }}
        >
          Sign Up
        </Button>
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
              router.replace("/(auth)/login");
            }}
          >
            Already have an account?
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default SigninPage;
