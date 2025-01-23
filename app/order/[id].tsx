import {
  Order,
  ORDER_STATUS,
  useCustomerOrdersStore,
} from "@/store/customer-orders.store";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { View, SizableText, XStack, useTheme, Circle, Text } from "tamagui";
import { MapPin } from "@tamagui/lucide-icons";
import { useRunnerLocationStore } from "@/store/runner-location.store";

const OrderPage = () => {
  const color = useTheme();
  const { id, status } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const ongoings = useCustomerOrdersStore((state) => state.ongoing);

  const mapRef = useRef<MapView>(null);
  const runnerLocation = useRunnerLocationStore(
    (state) => state.runnerLocation
  );
  const getRunnerLocation = useRunnerLocationStore(
    (state) => state.getRunnerLocation
  );

  const [region, setRegion] = useState({
    latitude: 3.0700939853725044,
    longitude: 101.49932443650975,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });

  useEffect(() => {
    if (status === "ongoing") {
      const foundOrder = useCustomerOrdersStore
        .getState()
        .ongoing.find((order) => order.id === Number(id));

      if (foundOrder?.runner) {
        getRunnerLocation(order?.runner.id ?? 0);
      }

      setOrder(foundOrder || null);
    } else if (status === "completed") {
      const foundOrder = useCustomerOrdersStore
        .getState()
        .completed.find((order) => order.id === Number(id));
      setOrder(foundOrder || null);
    } else if (status === "cancelled") {
      const foundOrder = useCustomerOrdersStore
        .getState()
        .cancelled.find((order) => order.id === Number(id));
      setOrder(foundOrder || null);
    } else if (status === "open") {
      const foundOrder = useCustomerOrdersStore
        .getState()
        .orders.find((order) => order.id === Number(id));
      setOrder(foundOrder || null);
    }
  }, [id, status, order, ongoings]);

  useEffect(() => {
    console.log("Order", order?.orderStatus);
    if (order) {
      useCustomerOrdersStore.getState().liveUpdate(order!);
    }

    if (order?.orderStatus === ORDER_STATUS.OPEN) {
      setTimeout(() => {
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
              bottom: 200,
            },
          }
        );
      }, 100);
    }
  }, [order]);

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
        >
          {order?.pickup &&
            (order?.orderStatus === ORDER_STATUS.OPEN ||
              order?.orderStatus === ORDER_STATUS.ON_GOING) && (
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
          {order?.dropoff &&
            (order?.orderStatus === ORDER_STATUS.OPEN ||
              order?.orderStatus === ORDER_STATUS.PICKED_UP) && (
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
          {runnerLocation.latitude !== 0 ? (
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
              strokeColor={color.blue11Light.val}
              optimizeWaypoints={true}
              onReady={(result) => {
                setTimeout(() => {
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: 30,
                      left: 30,
                      top: 100,
                      bottom: 200,
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
            >
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
            </Marker>
          )}
        </MapView>
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
    height: "100%",
    zIndex: -1,
  },
});
