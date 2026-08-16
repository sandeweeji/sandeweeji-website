"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "./types";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      locale: "ar",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "ar" ? "en" : "ar" }),
    }),
    { name: "sandweeji-locale" },
  ),
);
