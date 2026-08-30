import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/useTheme";

type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
}>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { colors, radius, font, fontSize, spacing } = useTheme();

  const show = useCallback(
    (message: string, type: ToastType = "success") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, type });
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, 2400);
    },
    [anim],
  );

  useEffect(() => () => timer.current ? clearTimeout(timer.current) : undefined, []);

  const iconName: keyof typeof Ionicons.glyphMap = toast
    ? toast.type === "error"
      ? "alert-circle"
      : toast.type === "info"
        ? "information-circle"
        : "checkmark-circle"
    : "checkmark-circle";
  const accent = toast
    ? toast.type === "error"
      ? colors.danger
      : toast.type === "info"
        ? colors.info
        : colors.brand
    : colors.brand;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              top: insets.top + spacing.sm,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
              opacity: anim,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.pill,
              paddingVertical: 12,
              paddingHorizontal: spacing.lg,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Ionicons name={iconName} size={18} color={accent} />
            <Text
              style={{
                color: colors.text,
                fontFamily: font.medium,
                fontSize: fontSize.base,
                flexShrink: 1,
              }}
            >
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
});
