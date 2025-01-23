import {
  MapPin,
  Utensils,
  Coffee,
  ShoppingBag,
  NotebookPen,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useDeliveryTypeStore } from "store/delivery-type.store";
import { useLocationStore } from "store/location.store";
import { StyleSheet } from "react-native";
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
  // const snapPoints = useMemo(() => ["50%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const pickup = useLocationStore((state) => state.pickup);
  const dropoff = useLocationStore((state) => state.dropoff);
  const type = useLocationStore((state) => state.type);
  const [remarks, setRemarks] = useState("");
  const setType = useLocationStore((state) => state.setDeliveryType);

  const handleSelectOrderType = (id: string) => {
    const selectedType = orderTypes.find((type) => type.id.toString() === id);
    setType(selectedType ?? undefined);
  };

  useEffect(() => {
    if (pickup.address && dropoff.address && type) {
      console.log("open bottom sheet");
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [pickup.address, dropoff.address, type]);

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
            backgroundColor: color.gray2.val,
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
              <Text fontSize={"$6"}>RM10.00</Text>
            </View>
            <Button
              onPress={() => {
                console.log(
                  "pickup",
                  pickup,
                  "dropoff",
                  dropoff,
                  "type",
                  type,
                  "remarks",
                  remarks
                );
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
});
