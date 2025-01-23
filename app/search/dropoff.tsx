import { useLocalSearchParams } from "expo-router";
import { View, Text } from "tamagui";

const DropOffPage = () => {
  const { type } = useLocalSearchParams();

  return (
    <View>
      <Text>{type}</Text>
    </View>
  );
};

export default DropOffPage;
