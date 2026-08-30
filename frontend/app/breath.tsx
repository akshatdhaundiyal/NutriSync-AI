import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/useTheme";
import { impact, success } from "@/src/utils/haptics";

const PHASES = [
  { key: "inhale", label: "Inhale slowly through your nose", dur: 4000, scale: 1 },
  { key: "inhale2", label: "Second short inhale — top it up", dur: 1500, scale: 1.14 },
  { key: "exhale", label: "Long, slow exhale through your mouth", dur: 6000, scale: 0.42 },
] as const;

const SESSION_SECONDS = 120;

export default function BreathScreen() {
  const { colors, font, fontSize, spacing, name } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scale = useSharedValue(0.42);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);

  const phaseRef = useRef(0);
  const runningRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(() => {
    runningRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    cancelAnimation(scale);
    scale.value = withTiming(0.7, { duration: 600 });
    setRunning(false);
    setDone(true);
    success();
  }, [scale]);

  const schedule = useCallback(
    (i: number) => {
      phaseRef.current = i;
      setPhaseIdx(i);
      impact();
      const p = PHASES[i];
      scale.value = withTiming(p.scale, {
        duration: p.dur,
        easing: Easing.inOut(Easing.ease),
      });
      timeoutRef.current = setTimeout(() => {
        if (runningRef.current) schedule((i + 1) % PHASES.length);
      }, p.dur);
    },
    [scale],
  );

  const startTick = useCallback(() => {
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, [finish]);

  useEffect(() => {
    runningRef.current = true;
    schedule(0);
    startTick();
    return () => {
      runningRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      cancelAnimation(scale);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    if (done) return;
    if (runningRef.current) {
      runningRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      cancelAnimation(scale);
      setRunning(false);
    } else {
      runningRef.current = true;
      setRunning(true);
      schedule(phaseRef.current);
      startTick();
    }
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  const label = done ? "Session complete" : PHASES[phaseIdx].label;

  return (
    <LinearGradient
      colors={name === "dark" ? [colors.canvas, "#04121f"] : [colors.canvas, "#e6f7f1"]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: insets.top + spacing.md }}>
        {/* top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg }}>
          <View>
            <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>
              Cyclic Sighing
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: font.regular, fontSize: fontSize.sm }}>
              2-minute nervous system reset
            </Text>
          </View>
          <Pressable
            testID="breath-close"
            hitSlop={10}
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceTertiary }}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* pacer */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 300, height: 300, alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute" }, circleStyle]}>
              <LinearGradient
                colors={[colors.brand, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  opacity: 0.9,
                }}
              />
            </Animated.View>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.canvas,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text testID="breath-timer" style={{ color: colors.text, fontFamily: font.monoMed, fontSize: fontSize.xxl }}>
                {mmss}
              </Text>
            </View>
          </View>

          <Text
            testID="breath-phase"
            style={{
              color: colors.text,
              fontFamily: font.medium,
              fontSize: fontSize.lg,
              textAlign: "center",
              marginTop: spacing.xxl,
              paddingHorizontal: spacing.xl,
              minHeight: 50,
            }}
          >
            {label}
          </Text>
        </View>

        {/* controls */}
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}>
          {done ? (
            <Pressable
              testID="breath-done"
              onPress={() => router.back()}
              style={{ backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
            >
              <Text style={{ color: colors.onBrand, fontFamily: font.semibold, fontSize: fontSize.lg }}>
                Done — back to protocol
              </Text>
            </Pressable>
          ) : (
            <Pressable
              testID="breath-toggle"
              onPress={toggle}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name={running ? "pause" : "play"} size={18} color={colors.text} />
              <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: fontSize.lg }}>
                {running ? "Pause" : "Resume"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
