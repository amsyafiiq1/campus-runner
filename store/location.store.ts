import { create } from "zustand";

export interface Location {
  latitude: number;
  longitude: number;
  address: string | undefined;
}

interface LocationStore {
  pickup: Location;
  dropoff: Location;

  setPickup: (location: Location) => void;
  setDropoff: (location: Location) => void;
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

  setPickup: (location) => {
    set({ pickup: location });
  },
  setDropoff: (location) => {
    set({ dropoff: location });
  },
}));
