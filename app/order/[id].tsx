import { ORDER_STATUS } from "@/store/customer-orders.store";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { BackHandler, Linking, Platform, StyleSheet } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {
  View,
  Circle,
  SizableText,
  XStack,
  useTheme,
  YStack,
  Avatar,
  Button,
  Card,
} from "tamagui";
import { MapPin, Phone } from "@tamagui/lucide-icons";
import { useRunnerLocationStore } from "@/store/runner-location.store";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSelectedOrderStore } from "@/store/selected-order.store";

const OrderPage = () => {
  const color = useTheme();
  const { id } = useLocalSearchParams();
  const order = useSelectedOrderStore((state) => state.selectedOrder);
  const getOrder = useSelectedOrderStore((state) => state.getSelectedOrder);

  const mapRef = useRef<MapView>(null);
  const runnerLocation = useRunnerLocationStore(
    (state) => state.runnerLocation
  );
  const getRunnerLocation = useRunnerLocationStore(
    (state) => state.getRunnerLocation
  );
  const resetRunnerLocation = useRunnerLocationStore(
    (state) => state.resetRunnerLocation
  );
  const [time, setTime] = useState(0);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = (index: number) => {};

  const [region, setRegion] = useState({
    latitude: 3.0700939853725044,
    longitude: 101.49932443650975,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

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
        getOrder(Number(id));
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (order && order?.runner) {
      getRunnerLocation(order!.runner.id);
      useSelectedOrderStore.getState().liveUpdate(order.id);
    }

    if (
      order?.orderStatus === ORDER_STATUS.COMPLETED ||
      order?.orderStatus === ORDER_STATUS.CANCELED
    ) {
      mapRef.current?.fitToCoordinates(
        [
          {
            latitude: order?.pickup.latitude!,
            longitude: order?.pickup.longitude!,
          },
          {
            latitude: order?.dropoff.latitude!,
            longitude: order?.dropoff.longitude!,
          },
        ],
        {
          edgePadding: {
            right: 30,
            left: 30,
            top: 100,
            bottom: 100,
          },
        }
      );
    }
  }, [order]);

  useEffect(() => {
    return () => {
      resetRunnerLocation(); // Reset runner location on unmount
      useSelectedOrderStore.getState().unsubscribe();
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push("/(drawer)/(tabs)/ongoing");
        return true;
      }
    );

    return () => backHandler.remove();
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
                  ? "Finding Driver"
                  : order?.orderStatus === ORDER_STATUS.ON_GOING
                  ? "Order Ongoing"
                  : order?.orderStatus === ORDER_STATUS.PICKED_UP
                  ? "Order Picked Up"
                  : order?.orderStatus === ORDER_STATUS.COMPLETED
                  ? "Order Completed"
                  : order?.orderStatus === ORDER_STATUS.CANCELED}
              </SizableText>
            </XStack>
          ),
        }}
      />
      <View flex={1}>
        <View>
          {/* <Text>{JSON.stringify(order?.orderStatus, null, 2)}</Text> */}
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsTraffic={false}
          showsBuildings={false}
          showsPointsOfInterest={false}
          showsIndoors={false}
          showsIndoorLevelPicker={false}
          zoomControlEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          pitchEnabled={false}
        >
          {order?.pickup && order.orderStatus !== ORDER_STATUS.PICKED_UP && (
            <Marker
              coordinate={{
                latitude: order.pickup.latitude,
                longitude: order.pickup.longitude,
              }}
              title="Pickup"
              description={order.pickup.address}
            >
              <View>
                <MapPin size={36} color={color.green11Light.val} />
              </View>
            </Marker>
          )}
          {order?.dropoff && order.orderStatus !== ORDER_STATUS.ON_GOING && (
            <Marker
              coordinate={{
                latitude: order?.dropoff.latitude!,
                longitude: order?.dropoff.longitude!,
              }}
              title="Dropoff"
              description={order?.dropoff.address}
            >
              <View>
                <MapPin size={36} color={color.yellow11Light.val} />
              </View>
            </Marker>
          )}
          {runnerLocation.latitude !== 0 &&
          order?.orderStatus !== ORDER_STATUS.COMPLETED &&
          order?.orderStatus !== ORDER_STATUS.CANCELED ? (
            <MapViewDirections
              origin={{
                latitude: runnerLocation.latitude,
                longitude: runnerLocation.longitude,
              }}
              destination={
                order?.orderStatus === ORDER_STATUS.ON_GOING
                  ? {
                      latitude: order?.pickup.latitude!,
                      longitude: order?.pickup.longitude!,
                    }
                  : {
                      latitude: order?.dropoff.latitude!,
                      longitude: order?.dropoff.longitude!,
                    }
              }
              apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              strokeWidth={5}
              strokeColor={
                order?.orderStatus === ORDER_STATUS.ON_GOING
                  ? color.green11Light.val
                  : color.yellow11Light.val
              }
              optimizeWaypoints={true}
              onReady={(result) => {
                setTime(result.duration);
                setTimeout(() => {
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: 30,
                      left: 30,
                      top: 100,
                      bottom: 100,
                    },
                  });
                }, 100);
              }}
            />
          ) : null}
          {order?.runner && (
            <Marker
              coordinate={{
                latitude: runnerLocation.latitude,
                longitude: runnerLocation.longitude,
              }}
              title="Driver Location"
              anchor={{
                x: 0.5,
                y: 0.5,
              }}
            >
              <View>
                <View
                  borderColor={color.blue11Light.val}
                  borderWidth={3}
                  borderRadius={50}
                  width={30}
                  height={30}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Circle size={15} backgroundColor={color.blue11Light.val} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        <BottomSheet
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          enableDynamicSizing
          enableOverDrag={false}
          backgroundStyle={{
            backgroundColor: color.background.val,
          }}
          handleIndicatorStyle={{
            backgroundColor: color.red10.val,
          }}
          handleStyle={{
            display: "none",
          }}
          style={{
            shadowColor: "#000000",
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 1,
            shadowRadius: 16.0,

            elevation: 24,
          }}
        >
          <BottomSheetView
            style={{
              flex: 1,
              // backgroundColor: color.background.val,
            }}
          >
            <View gap={"$4"} flex={1} py={"$4"}>
              <XStack
                alignItems="center"
                justifyContent="space-between"
                flex={1}
                px={"$4"}
                pb={"$2"}
                borderBottomColor={color.gray11.val}
                borderBottomWidth={0.5}
              >
                {order?.orderStatus === ORDER_STATUS.ON_GOING ? (
                  <YStack maxWidth={"74%"}>
                    <SizableText
                      size={"$6"}
                      fontWeight="800"
                      color={color.green11.val}
                    >
                      Picking up your order
                    </SizableText>
                    <SizableText
                      size={"$3"}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      flexShrink={1}
                    >
                      {order?.pickup.address}
                    </SizableText>
                  </YStack>
                ) : order?.orderStatus === ORDER_STATUS.PICKED_UP ? (
                  <YStack maxWidth={"74%"}>
                    <SizableText
                      size={"$6"}
                      fontWeight="800"
                      color={color.yellow11.val}
                    >
                      Delivering your order
                    </SizableText>
                    <SizableText
                      size={"$3"}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      flexShrink={1}
                    >
                      {order?.dropoff.address}
                    </SizableText>
                  </YStack>
                ) : order?.orderStatus === ORDER_STATUS.COMPLETED ? (
                  <YStack maxWidth={"74%"}>
                    <SizableText
                      size={"$6"}
                      fontWeight="800"
                      color={color.yellow11.val}
                    >
                      Order Delivered
                    </SizableText>
                    <SizableText
                      size={"$3"}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      flexShrink={1}
                    >
                      {order?.dropoff.address}
                    </SizableText>
                  </YStack>
                ) : null}
                <XStack alignItems="flex-end">
                  <SizableText
                    size={"$3"}
                    color={color.gray11.val}
                    fontWeight="800"
                  >
                    {time > 0
                      ? `${time.toFixed(0)} minutes`
                      : "Calculating time..."}
                  </SizableText>
                </XStack>
              </XStack>
              <Card
                elevate
                mx={"$4"}
                my={"$2"}
                borderRadius={10}
                gap={"$5"}
                padding={"$4"}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack gap={"$2"}>
                    <Avatar circular size="$5">
                      <Avatar.Image
                        accessibilityLabel="Runner Photo"
                        src={
                          order?.runner.user.photo ??
                          "https://www.gravatar.com/avatar/"
                        }
                      />
                      <Avatar.Fallback delayMs={0} backgroundColor="$red10" />
                    </Avatar>
                    <SizableText
                      size={"$3"}
                      fontWeight={800}
                      maxWidth={"74%"}
                      color={color.gray11.val}
                    >
                      {order?.runner.user.name}
                    </SizableText>
                  </YStack>
                  <YStack gap={"$2"} alignItems="flex-end">
                    <SizableText
                      size={"$8"}
                      fontWeight={800}
                      color={
                        order?.orderStatus === ORDER_STATUS.ON_GOING
                          ? color.green11.val
                          : color.yellow11.val
                      }
                    >
                      {order?.runner.vehicle.plateNo}
                    </SizableText>
                    <SizableText
                      size={"$4"}
                      color={color.gray11.val}
                      fontWeight={800}
                    >
                      {order?.runner.vehicle.vehicleType.name}
                    </SizableText>
                  </YStack>
                </XStack>
              </Card>

              <XStack px={"$4"} py={"$2"} gap={"$2"}>
                {order?.orderStatus !== ORDER_STATUS.COMPLETED && (
                  <Button
                    variant="outlined"
                    theme={"red"}
                    borderRadius={50}
                    flex={1}
                    disabled={
                      order?.orderStatus !== ORDER_STATUS.ON_GOING &&
                      order?.orderStatus !== ORDER_STATUS.OPEN
                    }
                    onPress={() => {
                      console.log("Cancel Order");
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
                {order?.orderStatus === ORDER_STATUS.COMPLETED && (
                  <Button
                    variant="outlined"
                    theme={"green"}
                    borderRadius={50}
                    flex={1}
                    onPress={() => {
                      router.push("/(drawer)/(tabs)/completed");
                    }}
                  >
                    Go Back
                  </Button>
                )}
                <Button variant="outlined">
                  <Phone
                    size={16}
                    onPress={() => onPressCallButton(order?.runner.user.phone)}
                  />
                </Button>
              </XStack>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </>
  );
};

export default OrderPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "60%",
    zIndex: -1,
  },
});
