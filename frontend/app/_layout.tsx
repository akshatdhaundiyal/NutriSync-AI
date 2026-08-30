import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/src/components/ToastProvider";
import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { useStore } from "@/src/store/useStore";
import { useTheme } from "@/src/theme/useTheme";

LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon + app fonts register.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { colors, name } = useTheme();
  return (
    <>
      <StatusBar style={name === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="breath"
          options={{ presentation: "fullScreenModal", animation: "fade" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [iconsLoaded, iconError] = useIconFonts();
  const [fontsLoaded, fontError] = useFonts({
    "Geist-Regular": require("@/assets/fonts/Geist-Regular.ttf"),
    "Geist-Medium": require("@/assets/fonts/Geist-Medium.ttf"),
    "Geist-SemiBold": require("@/assets/fonts/Geist-SemiBold.ttf"),
    "GeistMono-Regular": require("@/assets/fonts/GeistMono-Regular.ttf"),
    "GeistMono-Medium": require("@/assets/fonts/GeistMono-Medium.ttf"),
  });

  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = (iconsLoaded || iconError) && (fontsLoaded || fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <RootNavigator />
          </ToastProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
