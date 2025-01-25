import { router } from "expo-router";
import { supabase } from "lib/supabase";
import { useEffect } from "react";
import { useAuthStore } from "store/auth.store";
import { Spinner, View } from "tamagui";

const AppScreen = () => {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || session === null) {
        router.replace("/(auth)/login");
      } else if (event === "SIGNED_IN" || session !== null) {
        router.replace("/(drawer)/");
        loadUser(session.user.email!);
      }
    });
  });

  return (
    <View
      flex={1}
      jc={"center"}
      ai={"center"}
      backgroundColor={"$accentBackground"}
    >
      <Spinner size="large" />
    </View>
  );
};

export default AppScreen;
