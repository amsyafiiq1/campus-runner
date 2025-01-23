import { useLocalSearchParams } from "expo-router";
import { View, Text } from "tamagui";

const OrderPage = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Order {id}</Text>
    </View>
  );
};

export default OrderPage;
