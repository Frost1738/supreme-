// hooks/useCustomFonts.js
import { useFonts } from "expo-font";
import {
  AlanSans_600SemiBold,
  Agbalumo_400Regular,
  Amethysta_400Regular,
} from "@expo-google-fonts/dev";

export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    AlanSans_600SemiBold,

    Agbalumo_400Regular,

    Amethysta_400Regular,
  });

  return fontsLoaded;
}
