import {
  View,
  SizableText,
  XStack,
  ScrollView,
  Avatar,
  Card,
  YStack,
  Button,
} from "tamagui";
import { useEffect } from "react";
import { router, Stack, useGlobalSearchParams } from "expo-router";
import { ORDER_STATUS } from "@/store/customer-orders.store";
import { useSelectedOrderStore } from "@/store/selected-order.store";
import { format } from "date-fns";
import {
  Circle,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Map,
} from "@tamagui/lucide-icons";
import { Linking, Platform, RefreshControl } from "react-native";

const OrderDetailsPage = () => {
  const { id, status } = useGlobalSearchParams();
  const order = useSelectedOrderStore((state) => state.selectedOrder);

  const onPressCallButton = (number) => {
    console.log(`Calling ${number}`);

    let phoneNumber = "";

    if (Platform.OS === "android") {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }

    Linking.openURL(phoneNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await useSelectedOrderStore.getState().getSelectedOrder(Number(id));
        useSelectedOrderStore.getState().liveUpdate(Number(id));
      }
    };

    fetchData();

    return () => {
      useSelectedOrderStore.getState().resetSelectedOrder();
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <XStack
              alignItems="center"
              justifyContent="center"
              backgroundColor={"$background"}
              paddingBottom={"$2"}
              shadowColor={"$shadow"}
              shadowOffset={{ width: 0, height: 24 }}
              shadowOpacity={0.25}
              shadowRadius={4}
              elevation={6}
            >
              <SizableText>
                {order?.orderStatus === ORDER_STATUS.OPEN
                  ? "Open"
                  : order?.orderStatus === ORDER_STATUS.ON_GOING
                  ? "On Going"
                  : order?.orderStatus === ORDER_STATUS.PICKED_UP
                  ? "Picked Up"
                  : order?.orderStatus === ORDER_STATUS.COMPLETED
                  ? "Completed"
                  : order?.orderStatus === ORDER_STATUS.CANCELED && "Canceled"}
              </SizableText>
            </XStack>
          ),
        }}
      />
      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() =>
              useSelectedOrderStore.getState().getSelectedOrder(Number(id))
            }
          />
        }
      >
        {order?.runner && (
          <Card margin={"$4"} padded elevate gap={"$4"}>
            <XStack flex={1} alignItems="center" gap={"$4"}>
              <Avatar size="$8" circular>
                <Avatar.Image
                  accessibilityLabel="Runner Photo"
                  src={
                    order?.runner.user.photo ??
                    "https://www.gravatar.com/avatar/"
                  }
                />
                <Avatar.Fallback delayMs={0} backgroundColor="$red10" />
              </Avatar>
              <YStack flex={1}>
                <SizableText size="$4" flexShrink={1}>
                  {order?.runner.user.name}
                </SizableText>
                <SizableText size="$3">{order?.runner.user.phone}</SizableText>
              </YStack>
            </XStack>
            <XStack flex={1} gap={"$2"}>
              <Button
                variant="outlined"
                flex={1}
                onPress={() => onPressCallButton(order?.runner.user.phone)}
              >
                <PhoneCall size={14} />
                Call
              </Button>
              {(order.orderStatus === ORDER_STATUS.ON_GOING ||
                order.orderStatus === ORDER_STATUS.PICKED_UP) && (
                <Button
                  flex={1}
                  theme={"red"}
                  onPress={() => {
                    router.push({
                      pathname: "/order/[id]",
                      params: { id: id.toString() },
                    });
                  }}
                >
                  <Map />
                  Live View
                </Button>
              )}
            </XStack>
          </Card>
        )}
        <Card margin={"$4"} elevate gap={"$4"}>
          <XStack
            justifyContent={"space-between"}
            alignItems="center"
            gap={"$4"}
            borderBottomColor={"$red10"}
            borderBottomWidth={0.5}
            px={"$4"}
            pt={"$4"}
            pb={"$2"}
          >
            <SizableText size="$3">
              {format(order?.createdAt ?? new Date(), "dd MMM yyyy HH:mm")}
            </SizableText>
            <SizableText size="$2">#{order?.id}</SizableText>
          </XStack>
          <YStack gap={"$4"} px={"$4"} py={"$2"}>
            <XStack gap={"$4"} alignItems="center">
              <Circle size={14} borderWidth={1} color={"$red10"} />
              <SizableText size="$3" flexShrink={1}>
                {order?.pickup.address}
              </SizableText>
            </XStack>
            <XStack gap={"$4"} alignItems="center">
              <MapPin size={14} borderWidth={1} color={"$red10"} />
              <SizableText size="$3" flexShrink={1}>
                {order?.dropoff.address}
              </SizableText>
            </XStack>
            {order?.remarks && (
              <XStack
                padding={"$4"}
                backgroundColor={"$red4"}
                br={"$2"}
                gap={"$2"}
                alignItems="center"
              >
                <MessageSquareText size={14} />
                <SizableText size="$3">{order?.remarks}</SizableText>
              </XStack>
            )}
          </YStack>
          <XStack
            justifyContent={"space-between"}
            px={"$4"}
            pt={"$2"}
            pb={"$4"}
          >
            <SizableText size="$3">{order?.orderType.name}</SizableText>
            <SizableText size="$3">RM{order?.payment.toFixed(2)}</SizableText>
          </XStack>
        </Card>
      </ScrollView>

      <View
        position="absolute"
        bottom={20}
        flex={1}
        width="100%"
        px={"$4"}
        gap={"$4"}
      >
        {order?.orderStatus !== ORDER_STATUS.CANCELED &&
          order?.orderStatus !== ORDER_STATUS.COMPLETED && (
            <Button
              theme={"red"}
              onPress={() => {
                useSelectedOrderStore.getState().cancelOrder(Number(id));
              }}
              disabled={
                order?.orderStatus !== ORDER_STATUS.OPEN &&
                order?.orderStatus !== ORDER_STATUS.ON_GOING
              }
            >
              Cancel
            </Button>
          )}
      </View>
    </>
  );
};

export default OrderDetailsPage;
