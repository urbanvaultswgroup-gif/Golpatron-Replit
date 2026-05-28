import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface LiveBadgeProps {
  minute?: number;
  size?: "sm" | "md";
}

export function LiveBadge({ minute, size = "md" }: LiveBadgeProps) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const isSmall = size === "sm";

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: colors.accent,
            opacity: pulse,
            width: isSmall ? 6 : 8,
            height: isSmall ? 6 : 8,
          },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            color: colors.accent,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        LIVE{minute ? ` ${minute}'` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    borderRadius: 4,
  },
  text: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
