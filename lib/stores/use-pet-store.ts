import { supabase } from "@/lib/utils/supabase";
import { Database } from "@/types/database.types";
import { create } from "zustand";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

interface PetStore {
  pets: Pet[];
  activePet: Pet | null;
  isLoading: boolean;
  fetchPets: () => Promise<void>;
  setActivePet: (pet: Pet) => void;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  activePet: null,
  isLoading: false,

  fetchPets: async () => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("Failed to fetch pets:", error.message);
      set({ isLoading: false });
      return;
    }

    const pets = data ?? [];

    set((state) => ({
      pets,
      // Only set the active pet if one isn't already selected
      activePet: state.activePet ?? pets[0] ?? null,
      isLoading: false,
    }));
  },

  setActivePet: (pet: Pet) => {
    set({ activePet: pet });
  },
}));
