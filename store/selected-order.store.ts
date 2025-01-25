import { create } from "zustand";
import { Order, ORDER_STATUS } from "./customer-orders.store";
import { supabase } from "@/lib/supabase";

interface SelectedOrderStore {
  selectedOrder: Order | null;

  getSelectedOrder: (orderId: number) => Promise<void>;
  liveUpdate: (id: number) => void;
  unsubscribe: () => void;
  resetSelectedOrder: () => void;
  cancelOrder: (orderId: number) => Promise<void>;
}

export const useSelectedOrderStore = create<SelectedOrderStore>((set) => ({
  selectedOrder: null,

  getSelectedOrder: async (orderId) => {
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
          plateNo: plate_no,
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
      .eq("id", orderId)
      .single();

    if (error) {
      console.log("Error fetching selected order", error);
      return;
    }

    if (data) {
      set({ selectedOrder: data as any });
    }
  },
  liveUpdate: (id) => {
    console.log("Getting live updates for order: ", id);
    supabase
      .channel("order_live_update")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const data = payload.new as any;
          console.log(payload);
          const current = useSelectedOrderStore.getState().selectedOrder;
          let updatedRunner = current?.runner;

          if (current?.runner?.id !== data.runner_id) {
            const { data: runnerData, error: runnerError } = await supabase
              .from("Runner")
              .select(
                `
                *,
                user:User!inner(id, email, type, name, phone, photo)
              `
              )
              .eq("id", data.runner_id)
              .single();

            if (runnerError) {
              console.log("Error fetching runner", runnerError);
            }

            if (runnerData) {
              updatedRunner = runnerData;
            }
          }

          set((state) => {
            const updatedOrder = {
              ...state.selectedOrder!,
              orderStatus: data.order_status,
              runner: updatedRunner || state.selectedOrder!.runner,
            };

            return { selectedOrder: updatedOrder };
          });
        }
      )
      .subscribe();
  },

  resetSelectedOrder: () => {
    set({ selectedOrder: null });
  },
  unsubscribe: () => {
    supabase.channel("order_live_update").unsubscribe();
  },
  cancelOrder: async (orderId) => {
    const { error } = await supabase
      .from("Order")
      .update({ order_status: ORDER_STATUS.CANCELED })
      .eq("id", orderId);

    if (error) {
      console.log("Error cancelling order", error);
    }

    set((state) => {
      const updatedOrder = {
        ...state.selectedOrder!,
        orderStatus: ORDER_STATUS.CANCELED,
      };

      return { selectedOrder: updatedOrder };
    });
  },
}));
