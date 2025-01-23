import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import "react-native-get-random-values";
import { Button, useTheme, View } from "tamagui";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet } from "react-native";
import { useRef, useState, useEffect } from "react";
import { Locate, Search } from "@tamagui/lucide-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useLocationStore } from "store/location.store";

const MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const PickupPage = () => {
  const { type } = useLocalSearchParams();

  const color = useTheme();

  const pickup = useLocationStore((state) => state.pickup);
  const setPickup = useLocationStore((state) => state.setPickup);

  const dropoff = useLocationStore((state) => state.dropoff);
  const setDropoff = useLocationStore((state) => state.setDropoff);

  const [initialRegion, setInitialRegion] = useState({
    latitude: 3.0700939853725044,
    longitude: 101.49932443650975,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 0,
    longitude: 0,
    address: "",
  });

  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  const getLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    try {
      try {
        const location = await Location.getCurrentPositionAsync();

        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });

        // Also update the map view to center on current location
        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync();

      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });

      // Also update the map view to center on current location
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });

      // Get address from coordinates
      const results = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const { name, city, region, postalCode } = results[0];
      const address = `${name}, ${city}, ${region}` || "";

      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });

      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.setAddressText(address);
        } else {
          console.warn("SearchRef is not initialized");
        }
      }, 100);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    try {
      // Get address from coordinates
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const { name, city, region, postalCode } = results[0];
        const address = `${name}, ${city}, ${region}` || "";

        setSelectedLocation({
          latitude,
          longitude,
          address,
        });

        // Add timeout to ensure ref is mounted
        setTimeout(() => {
          if (searchRef.current) {
            searchRef.current.setAddressText(address);
          } else {
            console.warn("SearchRef is not initialized");
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  useEffect(() => {
    getLocationPermission();
  }, []);

  return (
    <View flex={1}>
      <GooglePlacesAutocomplete
        ref={searchRef}
        placeholder="Search"
        textInputProps={{
          placeholderTextColor: color.gray10.val,
          returnKeyType: "search",
        }}
        renderLeftButton={() => (
          <View
            padding={0}
            paddingLeft={"$3"}
            alignItems="center"
            justifyContent="center"
          >
            <Search size={"$1"} color={color.accentColor.val} />
          </View>
        )}
        styles={{
          container: {
            flex: 0,
            backgroundColor: color.background.val,
            margin: 12,
            position: "absolute",
            top: 0,
            left: 0,
            width: "95%",
            borderRadius: 12,
          },
          textInput: {
            backgroundColor: color.background.val,
            color: color.accentColor.val,
            borderRadius: 12,
          },
          textInputContainer: {
            backgroundColor: color.background.val,
            borderRadius: 12,
          },
          row: {
            backgroundColor: color.background.val,
            borderBottomLeftRadius: 12,
          },
          description: {
            color: color.accentColor.val,
          },
        }}
        fetchDetails={true}
        onPress={(data, details) => {
          if (details) {
            const { lat, lng } = details.geometry.location;

            setSelectedLocation({
              latitude: lat,
              longitude: lng,
              address: data.description,
            });

            mapRef.current?.animateToRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.00822,
              longitudeDelta: 0.00821,
            });
          }
        }}
        query={{
          key: MAPS_API_KEY,
          language: "en",
          components: "country:my",
        }}
        renderDescription={(data) =>
          data.description.split(",").slice(0, -1).join(",")
        } // Remove last segment (country)
        enablePoweredByContainer={false}
      />
      <MapView
        ref={mapRef}
        style={styles.map}
        region={initialRegion}
        provider={PROVIDER_GOOGLE}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {selectedLocation.latitude !== 0 && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
          />
        )}
      </MapView>

      <View position="absolute" bottom={"$12"} right={0} padding={"$4"}>
        <Button
          circular
          onPress={getCurrentLocation}
          borderWidth={0.5}
          $theme-dark={{
            backgroundColor: color.gray11Light.val,
            pressStyle: {
              backgroundColor: color.gray12Light.val,
            },
          }}
          $theme-light={{
            backgroundColor: color.gray11Light.val,
            pressStyle: {
              backgroundColor: color.gray12Light.val,
            },
          }}
          borderColor={color.background.val}
        >
          <Locate size={"$1"} color={color.background.val} />
        </Button>
      </View>
      <View position="absolute" bottom={"$4"} width={"100%"} padding={"$4"}>
        <Button
          onPress={() => {
            if (type === "pickup") {
              setPickup(selectedLocation);
            } else if (type === "dropoff") {
              setDropoff(selectedLocation);
            } else {
              console.warn("Unknown type:", type);
            }
            router.push("/(drawer)/");
          }}
          theme={"red"}
          disabled={
            selectedLocation.latitude === 0 ||
            selectedLocation.longitude === 0 ||
            selectedLocation.address === ""
          }
          disabledStyle={{
            backgroundColor: color.red2.val,
          }}
        >
          Confirm
        </Button>
      </View>
    </View>
  );
};

export default PickupPage;

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
