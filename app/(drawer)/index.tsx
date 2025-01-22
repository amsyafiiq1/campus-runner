import {
  MapPin,
  Utensils,
  Coffee,
  ShoppingBag,
  NotebookPen,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { createElement, useEffect, useState } from "react";
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
  const [selectedOrderType, setSelectedOrderType] = useState(
    orderTypes[0]?.id.toString() ?? ""
  );
  const pickup = useLocationStore((state) => state.pickup);
  const dropoff = useLocationStore((state) => state.dropoff);

  useEffect(() => {
    useDeliveryTypeStore.getState().getAll();
  }, []);

  return (
    <>
      <View gap={"$4"} padding={"$4"}>
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
            value={selectedOrderType}
            onValueChange={(value) => setSelectedOrderType(value)}
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
      </View>
      <View position="absolute" bottom={"$8"} flex={1} w={"100%"} p={"$4"}>
        <Button
          onPress={() => {
            console.log("Proceed to order");
          }}
          theme={"red"}
          disabled={
            pickup.address === undefined ||
            dropoff.address === undefined ||
            selectedOrderType === ""
          }
        >
          Proceed
        </Button>
      </View>
    </>
  );
};

export default HomePage;
