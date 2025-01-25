import { create } from "zustand";
import { Customer, User } from "./auth.store";
import { DeliveryType } from "./delivery-type.store";
import { Location } from "./location.store";
import { supabase } from "lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export interface Order {
  id: number;
  remarks: string;
  payment: number; // price
  pickup: Location;
  dropoff: Location;
  orderType: DeliveryType;
  runner: Runner;
  customer: Customer;
  orderStatus: OrderStatus;
  createdAt: Date;
}

export const ORDER_STATUS = {
  OPEN: "OPEN",
  ON_GOING: "ON_GOING",
  PICKED_UP: "PICKED_UP",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELLED",
} as const;

// For type annotations
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface Runner {
  id: number;
  vehicle: Vehicle;
  user: User;
}

export interface Vehicle {
  id: number;
  vehicleType: VehicleType;
  plateNo: string;
}

export interface VehicleType {
  id: number;
  name: string;
}

interface CustomerOrdersStore {
  orders: Order[];
  ongoing: Order[];
  completed: Order[];
  cancelled: Order[];
  error: PostgrestError | null;
  getAll: (customerId: number) => Promise<void>;
  getOngong: (customerId: number) => Promise<void>;
  getCompleted: (customerId: number) => Promise<void>;
  getCancelled: (customerId: number) => Promise<void>;
  liveUpdate: (order: Order) => void;

  addOrder: (
    pickup: Location,
    dropoff: Location,
    type: DeliveryType,
    remarks: string,
    customerId: number,
    payment: number
  ) => Promise<Order>;
}

export const useCustomerOrdersStore = create<CustomerOrdersStore>((set) => ({
  orders: [],
  ongoing: [],
  completed: [],
  cancelled: [],
  error: null,
  getAll: async (customerId) => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
      id,
      remarks,
      payment,
      pickup:Location!pickup_id (*),
      dropoff:Location!dropoff_id (*),
      orderType:Order_Type!order_type_id (*),
      runner:Runner!runner_id (
        id,
        vehicle:Vehicle_Details!vehicle_id (
          id,
          vehicleType:Vehicle_Type!type_id (*)
        ),
        user:User(*)
      ),
      customer:Customer!customer_id (
        id, 
        user:User(*)
      ),
      orderStatus:order_status,
      createdAt: created_at
    `
      )
      .eq("customer_id", customerId);

    if (error) {
      set({ error });
      console.log("Error fetching orders", error);
      return;
    }

    if (data) {
      set({ orders: data as any });
    }
  },
  getOngong: async (customerId) => {
    console.log("Getting ongoing orders for customer", customerId);
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
      id,
      remarks,
      payment,
      pickup:Location!pickup_id (*),
      dropoff:Location!dropoff_id (*),
      orderType:Order_Type!order_type_id (*),
      runner:Runner!runner_id (
        id,
        vehicle:Vehicle_Details!vehicle_id (
          id,
          vehicleType:Vehicle_Type!type_id (*)
        ),
        user:User(*)
      ),
      customer:Customer!customer_id (
        id, 
        user:User(*)
      ),
      orderStatus:order_status,
      createdAt: created_at
    `
      )
      .eq("customer_id", customerId)
      .or(
        `order_status.eq.${ORDER_STATUS.OPEN},order_status.eq.${ORDER_STATUS.ON_GOING},order_status.eq.${ORDER_STATUS.PICKED_UP}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      set({ error });
      console.log("Error fetching orders", error);
      return;
    }

    if (data) {
      set({ ongoing: data as any });
    }
  },
  getCompleted: async (customerId) => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
      id,
      remarks,
      payment,
      pickup:Location!pickup_id (*),
      dropoff:Location!dropoff_id (*),
      orderType:Order_Type!order_type_id (*),
      runner:Runner!runner_id (
        id,
        vehicle:Vehicle_Details!vehicle_id (
          id,
          vehicleType:Vehicle_Type!type_id (*)
        ),
        user:User(*)
      ),
      customer:Customer!customer_id (
        id, 
        user:User(*)
      ),
      orderStatus:order_status,
      createdAt: created_at
    `
      )
      .eq("customer_id", customerId)
      .eq("order_status", ORDER_STATUS.COMPLETED)
      .order("created_at", { ascending: false });

    if (error) {
      set({ error });
      console.log("Error fetching orders", error);
      return;
    }

    if (data) {
      set({ completed: data as any });
    }
  },
  getCancelled: async (customerId) => {
    const { data, error } = await supabase
      .from("Order")
      .select(
        `
      id,
      remarks,
      payment,
      pickup:Location!pickup_id (*),
      dropoff:Location!dropoff_id (*),
      orderType:Order_Type!order_type_id (*),
      runner:Runner!runner_id (
        id,
        user:User(*)
      ),
      customer:Customer!customer_id (
        id, 
        user:User(*)
      ),
      orderStatus:order_status,
      createdAt: created_at
    `
      )
      .eq("customer_id", customerId)
      .eq("order_status", ORDER_STATUS.CANCELED)
      .order("created_at", { ascending: false });

    if (error) {
      set({ error });
      console.log("Error fetching orders", error);
      return;
    }

    if (data) {
      set({ cancelled: data as any });
    }
  },
  liveUpdate: (order) => {
    console.log("Listening for changes on order", order.id);
    supabase
      .channel("order_live_update")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const data = payload.new as any;
          console.log("Order live update", data);
          set((state) => ({
            ongoing: state.ongoing.map((ord) => {
              console.log("Order", ord.id, order.id);
              if (ord.id === data.id) {
                console.log("Updating order", data.order_status);
                return {
                  ...ord,
                  orderStatus: data.order_status,
                };
              }
              return ord;
            }),
          }));
        }
      )
      .subscribe();
  },

  addOrder: async (pickup, dropoff, type, remarks, customerId, payment) => {
    set({ error: null });
    const { data: locations, error: locError } = await supabase
      .from("Location")
      .insert([
        {
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          address: pickup.address,
        },
        {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude,
          address: dropoff.address,
        },
      ])
      .select("*");

    if (locError) {
      console.log("Error adding locations", locError);
      set({ error: locError });
      return;
    }

    if (!locations) {
      console.log("No locations added");
      return;
    }

    if (locations) {
      const [pickLoc, dropLoc] = locations;

      const { data, error } = await supabase
        .from("Order")
        .insert([
          {
            pickup_id: pickLoc.id,
            dropoff_id: dropLoc.id,
            order_type_id: type.id,
            remarks,
            customer_id: customerId,
            order_status: ORDER_STATUS.OPEN,
            payment,
          },
        ])
        .select(
          `
        id,
        remarks,
        payment,
        pickup:Location!pickup_id (*),
        dropoff:Location!dropoff_id (*),
        orderType:Order_Type!order_type_id (*),
        runner:Runner!runner_id (
          id,
          vehicle:Vehicle_Details!vehicle_id (
            id,
            vehicleType:Vehicle_Type!type_id (*)
          ),
          user:User(*)
        ),
        customer:Customer!customer_id (
          id, 
          user:User(*)
        ),
        orderStatus:order_status,
        createdAt: created_at
      `
        )
        .single();

      if (error) {
        console.log("Error adding order", error);
        set({ error });
        return;
      }

      console.log("Order added", data);

      if (data) {
        set((state) => ({
          orders: [...state.orders, data as any],
          ongoing: [...state.ongoing, data as any],
          error: null,
        }));
        return data as any;
      }
    }
  },
}));
