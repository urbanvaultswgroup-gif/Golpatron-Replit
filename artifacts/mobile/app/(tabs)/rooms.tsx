import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const BUBBLE_SIZE = (width - 60) / 2;

const ROOMS = [
  {
    id: "1",
    country: "Brazil",
    code: "BRA",
    colors: ["#009C3B", "#FEDF00"] as [string, string],
    online: 7843,
    live: true,
    message: "GOOOAL! Vinicius Jr fires it home!",
  },
  {
    id: "2",
    country: "Argentina",
    code: "ARG",
    colors: ["#74ACDF", "#FFFFFF"] as [string, string],
    online: 5104,
    live: true,
    message: "Messi is literally everywhere tonight",
  },
  {
    id: "3",
    country: "France",
    code: "FRA",
    colors: ["#002395", "#ED2939"] as [string, string],
    online: 3208,
    live: true,
    message: "Mbappe hat-trick incoming??",
  },
  {
    id: "4",
    country: "Mexico",
    code: "MEX",
    colors: ["#006847", "#CE1126"] as [string, string],
    online: 2411,
    live: false,
    message: "Next match in 2h 34m - LET'S GO",
  },
  {
    id: "5",
    country: "England",
    code: "ENG",
    colors: ["#C8102E", "#00247D"] as [string, string],
    online: 2904,
    live: true,
    message: "Kane needs one more to equal record",
  },
  {
    id: "6",
    country: "Spain",
    code: "ESP",
    colors: ["#AA151B", "#F1BF00"] as [string, string],
    online: 4182,
    live: true,
    message: "Pedri controlling midfield completely",
  },
  {
    id: "7",
    country: "Portugal",
    code: "POR",
    colors: ["#006600", "#FF0000"] as [string, string],
    online: 3671,
    live: true,
    message: "1-1 with 12 min to go... hold your breath",
  },
  {
    id: "8",
    country: "Germany",
    code: "GER",
    colors: ["#000000", "#DD0000"] as [string, string],
    online: 2887,
    live: true,
    message: "Tactical masterclass in the making",
  },
];

function formatOnline(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function RoomBubble({
  room,
  onPress,
}: {
  room: (typeof ROOMS)[0];
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 12 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 12 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.bubbleWrapper}>
      <Animated.View style={[styles.bubbleOuter, animStyle]}>
        <LinearGradient
          colors={[...room.colors, room.colors[0] + "88"] as [string, string, string]}
          style={styles.bubbleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bubbleInner}>
            {room.live && (
              <View style={styles.livePip}>
                <View style={styles.livePipDot} />
              </View>
            )}
            <Text style={styles.bubbleCode}>{room.code}</Text>
            <Text style={styles.bubbleCountry} numberOfLines={1}>
              {room.country}
            </Text>
            <View style={styles.bubbleOnlineRow}>
              <Ionicons name="person" size={10} color="rgba(255,255,255,0.8)" />
              <Text style={styles.bubbleOnline}>{formatOnline(room.online)}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const [activeRoom, setActiveRoom] = useState<(typeof ROOMS)[0] | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Fan Rooms
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {ROOMS.filter((r) => r.live).length} rooms live now
          </Text>
        </View>

        {/* Active room preview */}
        {activeRoom && (
          <Pressable
            onPress={() => setActiveRoom(null)}
            style={[
              styles.activeRoomBanner,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <LinearGradient
              colors={[...activeRoom.colors]}
              style={styles.activeRoomStripe}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.activeRoomContent}>
              <View style={styles.activeRoomTop}>
                <Text
                  style={[
                    styles.activeRoomCode,
                    { color: colors.foreground },
                  ]}
                >
                  {activeRoom.code}
                </Text>
                {activeRoom.live && (
                  <View
                    style={[
                      styles.liveBadge,
                      { backgroundColor: colors.accent + "22" },
                    ]}
                  >
                    <View
                      style={[
                        styles.liveDot,
                        { backgroundColor: colors.accent },
                      ]}
                    />
                    <Text
                      style={[styles.liveText, { color: colors.accent }]}
                    >
                      LIVE
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.activeRoomMessage,
                  { color: colors.foreground },
                ]}
                numberOfLines={2}
              >
                "{activeRoom.message}"
              </Text>
              <Text
                style={[
                  styles.activeRoomOnline,
                  { color: colors.mutedForeground },
                ]}
              >
                {formatOnline(activeRoom.online)} supporters online
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        )}

        <Text
          style={[
            styles.gridLabel,
            { color: colors.mutedForeground, paddingHorizontal: 20 },
          ]}
        >
          {activeRoom ? "ALL ROOMS" : "PICK YOUR NATION"}
        </Text>

        <View style={styles.grid}>
          {ROOMS.map((room) => (
            <RoomBubble
              key={room.id}
              room={room}
              onPress={() => setActiveRoom(room)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  activeRoomBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 14,
    gap: 12,
  },
  activeRoomStripe: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  activeRoomContent: {
    flex: 1,
    paddingLeft: 8,
    gap: 4,
  },
  activeRoomTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeRoomCode: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  liveText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  activeRoomMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  activeRoomOnline: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  gridLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
  bubbleWrapper: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
  },
  bubbleOuter: {
    width: "100%",
    height: "100%",
    borderRadius: BUBBLE_SIZE / 2,
    overflow: "hidden",
  },
  bubbleGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleInner: {
    alignItems: "center",
    gap: 4,
  },
  livePip: {
    position: "absolute",
    top: -BUBBLE_SIZE * 0.25,
    right: -BUBBLE_SIZE * 0.1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4500",
    justifyContent: "center",
    alignItems: "center",
  },
  livePipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  bubbleCode: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  bubbleCountry: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bubbleOnlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  bubbleOnline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
});
