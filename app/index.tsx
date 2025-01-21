import { Spinner, View } from "tamagui";

const AppScreen = () => {
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
