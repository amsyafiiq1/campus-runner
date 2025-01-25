import {
  MapPin,
  Utensils,
  Coffee,
  ShoppingBag,
  NotebookPen,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useDeliveryTypeStore } from "store/delivery-type.store";
import { useLocationStore } from "store/location.store";
import {
  XStack,
  Card,
  View,
  Circle,
  Button,
  Text,
  YStack,
  SizableText,
  ToggleGroup,
  useTheme,
  Input,
} from "tamagui";
import { useLatLonDistance } from "lib/distance"; // Adjust path if needed
import { useCustomerOrdersStore } from "@/store/customer-orders.store";
import { useAuthStore } from "@/store/auth.store";
import { Alert } from "react-native";

const iconMap = {
  Utensils: Utensils,
  Coffee: Coffee,
  ShoppingBag: ShoppingBag,
  NotebookPen: NotebookPen,
  // Add other mappings as needed
};

const HomePage = () => {
  const orderTypes = useDeliveryTypeStore((state) => state.types) ?? [];
  const color = useTheme();

  useEffect(() => {
    useDeliveryTypeStore.getState().getAll();
  }, []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {}, []);

  const pickup = useLocationStore((state) => state.pickup);
  const dropoff = useLocationStore((state) => state.dropoff);
  const type = useLocationStore((state) => state.type);
  const [remarks, setRemarks] = useState("");
  const setType = useLocationStore((state) => state.setDeliveryType);
  const addOrder = useCustomerOrdersStore((state) => state.addOrder);
  const error = useCustomerOrdersStore((state) => state.error);
  const user = useAuthStore((state) => state.user);

  const distance = useLatLonDistance(pickup, dropoff);
  const [price, setPrice] = useState<number>(0);

  const handleSelectOrderType = (id: string) => {
    const selectedType = orderTypes.find((type) => type.id.toString() === id);
    setType(selectedType ?? undefined);
  };

  const handleAddOrder = async () => {
    if (pickup.address && dropoff.address && type) {
      const order = await addOrder(
        pickup,
        dropoff,
        type,
        remarks,
        user?.id!,
        price
      );
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        useLocationStore.getState().setPickup({
          id: 0,
          latitude: 0,
          longitude: 0,
          address: undefined,
        });
        useLocationStore.getState().setDropoff({
          id: 0,
          latitude: 0,
          longitude: 0,
          address: undefined,
        });
        useLocationStore.getState().setDeliveryType(undefined);

        router.push({
          pathname: "/order/details/[id]",
          params: { id: order.id },
        });
      }
    }
  };

  const canOpenSheet = useMemo(() => {
    return Boolean(pickup.address && dropoff.address && type);
  }, [type]);

  useEffect(() => {
    if (canOpenSheet) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [canOpenSheet]);

  useEffect(() => {
    if (distance) {
      const price = distance * 0.75;

      if (price < 1) {
        setPrice(1);
        return;
      }
      setPrice(price);
    }
  }, [distance]);

  return (
    <View gap={"$4"} padding={"$4"} flex={1}>
      <Card elevate px={"$4"}>
        <XStack
          padding={"$2"}
          gap={"$2"}
          ai={"center"}
          borderBottomColor={"$red10"}
          borderBottomWidth={0.5}
        >
          <Circle size={16} borderWidth={1} borderColor={"$red10"} />
          <Button
            size={"$3"}
            flex={1}
            borderWidth={0}
            justifyContent="flex-start"
            chromeless
            onPress={() => {
              router.push("/search/pickup?type=pickup");
            }}
          >
            <Text opacity={pickup.address ? 1 : 0.3}>
              {pickup.address ?? "Pick-up location"}
            </Text>
          </Button>
        </XStack>
        <XStack padding={"$2"} gap={"$2"} ai={"center"}>
          <MapPin size={16} color={"$red10"} />
          <Button
            size={"$3"}
            flex={1}
            borderWidth={0}
            justifyContent="flex-start"
            chromeless
            onPress={() => {
              router.push("/search/pickup?type=dropoff");
            }}
          >
            <Text opacity={dropoff.address ? 1 : 0.3}>
              {dropoff.address ?? "Drop-off location"}
            </Text>
          </Button>
        </XStack>
      </Card>

      <YStack>
        {/* @ts-ignore */}
        <ToggleGroup
          type="single"
          orientation="vertical"
          defaultValue=""
          value={type?.id.toString() ?? ""}
          onValueChange={(value) => handleSelectOrderType(value)}
        >
          {(orderTypes ?? []).map((type) => (
            <ToggleGroup.Item
              key={type.id}
              value={type.id.toString()}
              alignItems="flex-start"
            >
              <XStack gap={"$4"} ai={"center"}>
                {createElement(iconMap[type.icon as keyof typeof iconMap], {
                  size: "$1",
                })}
                <YStack>
                  <SizableText size={"$4"}>{type.name}</SizableText>
                  <SizableText size={"$1"} opacity={0.5}>
                    {type.description}
                  </SizableText>
                </YStack>
              </XStack>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </YStack>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        enableDynamicSizing
        index={pickup.address && dropoff.address && type ? 0 : -1}
        backgroundStyle={{
          backgroundColor: color.gray2.val,
        }}
        handleStyle={{
          display: "none",
        }}
      >
        <BottomSheetView
          style={{
            flex: 1,
          }}
        >
          <View padding={"$4"} gap={"$4"}>
            <Input
              placeholder="Add notes to your runner"
              size={"$4"}
              value={remarks}
              onChangeText={setRemarks}
            />
            <View
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap={"$4"}
            >
              <Text>Total</Text>
              <Text fontSize={"$6"}>
                {price ? `RM${price.toFixed(2)}` : "-"}
              </Text>
            </View>
            <Button
              onPress={() => {
                handleAddOrder();
              }}
              theme={"red"}
              animatePresence
            >
              Proceed
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default HomePage;
