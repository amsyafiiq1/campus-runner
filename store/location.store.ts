import { create } from "zustand";
import { DeliveryType } from "./delivery-type.store";

export interface Location {
  id: number | undefined;
  latitude: number;
  longitude: number;
  address: string | undefined;
}

interface LocationStore {
  pickup: Location;
  dropoff: Location;
  type: DeliveryType | undefined;

  setPickup: (location: Location) => void;
  setDropoff: (location: Location) => void;
  setDeliveryType: (type: DeliveryType | undefined) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  pickup: {
    id: 0,
    latitude: 0,
    longitude: 0,
    address: undefined,
  },
  dropoff: {
    id: 0,
    latitude: 0,
    longitude: 0,
    address: undefined,
  },
  type: undefined,

  setPickup: (location) => {
    set({ pickup: location });
  },
  setDropoff: (location) => {
    set({ dropoff: location });
  },
  setDeliveryType: (type) => {
    set({ type });
  },
}));
