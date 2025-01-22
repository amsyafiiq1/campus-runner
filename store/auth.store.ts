import {
  AuthError,
  PostgrestError,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import { ReceiptRussianRuble } from "@tamagui/lucide-icons";
import { supabase } from "lib/supabase";
import { create } from "zustand";

export interface User {
  id: string;
  supabaseUuid: string;
  name: string;
  phone: string;
  photo: string | undefined;
  type: string;
  email: string;
  createdAt: Date | undefined;
}

export interface Customer {
  id: number;
  createdAt: string;
  user: User;
}

interface AuthStore {
  authUser: SupabaseUser | null;
  user: Customer | null;
  loading: boolean;
  error: AuthError | PostgrestError | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (customer: Customer, password: string) => Promise<void>;
  loadUser: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  user: null,
  loading: false,
  error: null,
  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .eq("type", "Customer")
      .single();

    if (error) {
      set({ error });
      console.log("error", error);
      return;
    }

    if (data) {
      await supabase.auth
        .signInWithPassword({
          email: email,
          password: password,
        })
        .then(async ({ data, error }) => {
          if (error) {
            set({ error });
            return;
          }

          set({ authUser: data.user, loading: false, error: null });

          await useAuthStore.getState().loadUser(email);
        });
    }
  },
  signUpWithEmail: async (customer: Customer, password: string) => {
    set({ loading: true, error: null });

    // sign up with email and password
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: customer.user.email,
      password: password,
    });

    if (authError) {
      set({ error: authError });
      console.log(authError);
      return;
    }

    // add user to User table
    const { data, error } = await supabase
      .from("User")
      .insert([
        {
          id: customer.user.id,
          email: customer.user.email,
          type: "Customer",
          name: customer.user.name,
          phone: customer.user.phone,
          photo: customer.user.photo,
          supabase_uuid: authUser?.user?.id,
        },
      ])
      .select("*")
      .single();

    if (error) {
      set({ error });
      console.log(error);
      return;
    }

    // add user to Customer table
    const { data: customerData, error: customerError } = await supabase
      .from("Customer")
      .insert([
        {
          id: data.id,
        },
      ])
      .select(
        `
          *,
          user:User!inner(id, email, type, name, phone, photo)
        `
      )
      .single();

    if (customerError) {
      set({ error: customerError });
      console.log(customerError);
      return;
    }

    set({
      user: customerData,
      authUser: authUser.user,
      loading: false,
      error: null,
    });
  },
  loadUser: async (email) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("Customer")
      .select(
        `
          *,
          user:User!inner(id, email, type, name, phone, photo)
        `
      )
      .eq("user.email", email)
      .single();

    if (error) {
      set({ error });
      console.log("error", error);
      return;
    }

    set({ user: data, loading: false, error: null });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ authUser: null, user: null, loading: false, error: null });
  },
}));
