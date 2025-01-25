import { useEffect } from "react";
import { RefreshControl } from "react-native";
import { useAuthStore } from "store/auth.store";
import { useCustomerOrdersStore } from "store/customer-orders.store";
import { format } from "date-fns";
import {
  Card,
  ScrollView,
  SizableText,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";
import { Circle, MapPin } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const OrdersPage = () => {
  const color = useTheme();
  const user = useAuthStore((state) => state.user);
  const orders = useCustomerOrdersStore((state) => state.ongoing);
  const getOngoing = useCustomerOrdersStore((state) => state.getOngong);

  useEffect(() => {
    getOngoing(user?.id!);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        getOngoing(user.id);
      }
    }, [user])
  );

  return (
    <ScrollView
      flex={1}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => getOngoing(user?.id!)}
        />
      }
    >
      {/* <SizableText size={"$4"}>{JSON.stringify(orders, null, 2)}</SizableText> */}
      <YStack flex={1} padding={"$4"} gap={"$4"}>
        {orders.map((order) => (
          <Card
            key={order.id}
            backgroundColor={color.gray2.val}
            shadowColor={"$shadow"}
            shadowOffset={{ width: 0, height: 24 }}
            shadowOpacity={0.25}
            shadowRadius={4}
            elevation={6}
            onPress={() => {
              router.push({
                pathname: "/order/details/[id]",
                params: { id: order.id, status: "ongoing" },
              });
              return;
            }}
          >
            <YStack gap={"$3"}>
              <View
                borderBottomWidth={0.25}
                borderColor={"$red10"}
                px={"$4"}
                py={"$2"}
              >
                <SizableText size={"$2"}>
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm")}
                </SizableText>
              </View>
              <YStack
                gap={"$2"}
                borderBottomWidth={0.25}
                borderColor={"$red10"}
                px={"$4"}
                pb={"$2"}
              >
                <XStack flex={1} gap={"$2"} alignItems="center" px={"$4"}>
                  <Circle size={14} borderWidth={1} color={"$red10"} />
                  <SizableText flexShrink={1}>
                    {order.pickup.address}
                  </SizableText>
                </XStack>
                <XStack flex={1} gap={"$2"} alignItems="center" px={"$4"}>
                  <MapPin size={14} borderWidth={1} color={"$red10"} />
                  <SizableText flexShrink={1}>
                    {order.dropoff.address}
                  </SizableText>
                </XStack>
              </YStack>
              <XStack justifyContent={"space-between"} px={"$4"} pb={"$2"}>
                <SizableText size={"$2"}>{order.orderType.name}</SizableText>
                <SizableText size={"$2"}>
                  RM{order.payment.toFixed(2)}
                </SizableText>
              </XStack>
            </YStack>
          </Card>
        ))}
      </YStack>
    </ScrollView>
  );
};

export default OrdersPage;
