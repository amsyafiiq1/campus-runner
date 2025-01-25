import { useEffect, useState } from "react";
import { Location } from "store/location.store";

export function useLatLonDistance(origin: Location, destination: Location) {
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    async function fetchDistance() {
      try {
        const { latitude: originLat, longitude: originLng } = origin;
        const { latitude: destLat, longitude: destLng } = destination;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const routeDistance = data.routes[0]?.legs[0]?.distance?.value / 1000;
        if (routeDistance) setDistance(routeDistance);
      } catch (error) {
        console.error(error);
      }
    }

    if (origin && destination) fetchDistance();
  }, [origin, destination]);

  return distance;
}
