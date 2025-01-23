import { supabase } from "lib/supabase";
import { create } from "zustand";

export interface DeliveryType {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface DeliveryTypeStore {
  types: DeliveryType[] | undefined;
  getAll: () => Promise<void>;
}

export const useDeliveryTypeStore = create<DeliveryTypeStore>((set) => ({
  types: undefined,
  getAll: async () => {
    set({ types: undefined });

    const { data, error } = await supabase.from("Order_Type").select("*");

    if (error) {
      console.log("error", error);
      return;
    }

    // console.log("data", data);
    if (data) {
      set({ types: data });
    }
  },
}));
