import { supabase } from "@/lib/supabase";
import { create } from "zustand";

export interface RunnerLocation {
  latitude: number;
  longitude: number;
}

interface RunnerLocationStore {
  runnerLocation: RunnerLocation;

  getRunnerLocation: (runnerId: number) => Promise<void>;
}

export const useRunnerLocationStore = create<RunnerLocationStore>((set) => ({
  runnerLocation: {
    latitude: 0,
    longitude: 0,
  },

  getRunnerLocation: async (runnerId) => {
    if (runnerId === 0) {
      return;
    }

    const { data, error } = await supabase
      .from("Runner_Live_Location")
      .select("latitude, longitude")
      .eq("runner_id", runnerId)
      .single();

    if (error) {
      console.log("Error getting runner location:", error);
      return;
    }

    if (data) {
      set({
        runnerLocation: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
    }

    const liveLocation = supabase
      .channel("runner_live_location")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Runner_Live_Location",
          filter: `runner_id=eq.${runnerId}`,
        },
        (payload) => {
          const data = payload.new as any;
          console.log("Change received!", data.latitude, data.longitude);
          set({
            runnerLocation: {
              latitude: data.latitude,
              longitude: data.longitude,
            },
          });
        }
      )
      .subscribe();
  },
}));
