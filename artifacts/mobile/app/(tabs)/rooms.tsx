import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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
import { LiveBadge } from "@/components/LiveBadge";

const FEATURED_MATCH = {
  home: "MEX",
  away: "ARG",
  homeScore: 1,
  awayScore: 1,
  minute: 72,
  stage: "Quarter-Final",
  homeColor: "#006847",
  awayColor: "#4B9CD3",
};

const ROOMS = [
  {
    id: "1",
    country: "Mexico",
    code: "MEX",
    colors: ["#006847", "#CE1126"] as [string, string],
    online: 12443,
    live: true,
    message: "GOOOAL! Chucky equalizes — el tri is ALIVE!",
    vibe: "ELECTRIC",
  },
  {
    id: "2",
    country: "Argentina",
    code: "ARG",
    colors: ["#4B9CD3", "#FFFFFF"] as [string, string],
    online: 9104,
    live: true,
    message: "Messi playing out of his mind, this man is built different",
    vibe: "HYPE",
  },
  {
    id: "3",
    country: "Brazil",
    code: "BRA",
    colors: ["#009C3B", "#FEDF00"] as [string, string],
    online: 7843,
    live: false,
    message: "Next match in 1h 48m – canarinho já ta preparado",
    vibe: "READY",
  },
  {
    id: "4",
    country: "France",
    code: "FRA",
    colors: ["#0055A4", "#ED2939"] as [string, string],
    online: 6208,
    live: true,
    message: "Mbappe hat-trick incoming??",
    vibe: "DOMINANT",
  },
  {
    id: "5",
    country: "England",
    code: "ENG",
    colors: ["#CF091D", "#00247D"] as [string, string],
    online: 4904,
    live: true,
    message: "Kane needs one more to equal the all-time record",
    vibe: "TENSE",
  },
  {
    id: "6",
    country: "Spain",
    code: "ESP",
    colors: ["#C60B1E", "#F1BF00"] as [string, string],
    online: 5182,
    live: true,
    message: "Pedri absolutely controlling midfield — poetry",
    vibe: "SMOOTH",
  },
  {
    id: "7",
    country: "Portugal",
    code: "POR",
    colors: ["#006600", "#FF0000"] as [string, string],
    online: 3671,
    live: false,
    message: "Ronaldo dropped from starting XI — massive news",
    vibe: "DEBATE",
  },
  {
    id: "8",
    country: "Germany",
    code: "GER",
    colors: ["#DD0000", "#FFCE00"] as [string, string],
    online: 2887,
    live: true,
    message: "Tactical masterclass from Nagelsmann",
    vibe: "PRECISE",
  },
];

function formatOnline(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function RoomRow({
  room,
  onPress,
  active,
}: {
  room: (typeof ROOMS)[0];
  onPress: () => void;
  active: boolean;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.roomRow,
          animStyle,
          {
            backgroundColor: active ? colors.secondary : colors.card,
            borderColor: active ? colors.primary : colors.border,
            borderWidth: active ? 1.5 : 1,
          },
        ]}
      >
        {/* Team color strip */}
        <LinearGradient
          colors={room.colors}
          style={styles.colorStrip}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {/* Avatar */}
        <View style={[styles.roomAvatar, { backgroundColor: room.colors[0] }]}>
          <Text style={styles.roomAvatarText}>{room.code}</Text>
        </View>
        {/* Info */}
        <View style={styles.roomInfo}>
          <View style={styles.roomInfoTop}>
            <Text style={[styles.roomName, { color: colors.foreground }]}>
              {room.country}
            </Text>
            {room.live && <LiveBadge size="sm" />}
            <View
              style={[
                styles.vibeBadge,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text
                style={[
                  styles.vibeText,
                  { color: colors.mutedForeground },
                ]}
              >
                {room.vibe}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.roomMessage, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {room.message}
          </Text>
        </View>
        {/* Online count */}
        <View style={styles.roomOnlineBlock}>
          <Ionicons name="person" size={11} color={colors.mutedForeground} />
          <Text style={[styles.roomOnline, { color: colors.mutedForeground }]}>
            {formatOnline(room.online)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.mutedForeground}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Fan Rooms
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {ROOMS.filter((r) => r.live).length} rooms live now
          </Text>
        </View>

        {/* Live score banner — pinned at top */}
        <View
          style={[
            styles.scoreBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <LinearGradient
            colors={[
              FEATURED_MATCH.homeColor + "55",
              "transparent",
              FEATURED_MATCH.awayColor + "55",
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <View style={styles.scoreBannerInner}>
            <View style={styles.scoreBannerTeam}>
              <View
                style={[
                  styles.scoreBannerFlag,
                  { backgroundColor: FEATURED_MATCH.homeColor },
                ]}
              >
                <Text style={styles.scoreBannerFlagText}>
                  {FEATURED_MATCH.home}
                </Text>
              </View>
              <Text
                style={[
                  styles.scoreBannerTeamName,
                  { color: colors.foreground },
                ]}
              >
                {FEATURED_MATCH.home}
              </Text>
            </View>
            <View style={styles.scoreBannerCenter}>
              <LiveBadge minute={FEATURED_MATCH.minute} />
              <Text
                style={[styles.scoreBannerScore, { color: colors.foreground }]}
              >
                {FEATURED_MATCH.homeScore} : {FEATURED_MATCH.awayScore}
              </Text>
              <Text
                style={[
                  styles.scoreBannerStage,
                  { color: colors.mutedForeground },
                ]}
              >
                {FEATURED_MATCH.stage}
              </Text>
            </View>
            <View style={[styles.scoreBannerTeam, { alignItems: "flex-end" }]}>
              <View
                style={[
                  styles.scoreBannerFlag,
                  { backgroundColor: FEATURED_MATCH.awayColor },
                ]}
              >
                <Text style={styles.scoreBannerFlagText}>
                  {FEATURED_MATCH.away}
                </Text>
              </View>
              <Text
                style={[
                  styles.scoreBannerTeamName,
                  { color: colors.foreground },
                ]}
              >
                {FEATURED_MATCH.away}
              </Text>
            </View>
          </View>
        </View>

        {/* Room list */}
        <View style={styles.listSection}>
          <Text
            style={[styles.listLabel, { color: colors.mutedForeground }]}
          >
            ALL ROOMS
          </Text>
          <View style={styles.roomList}>
            {ROOMS.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                active={activeRoomId === room.id}
                onPress={() =>
                  setActiveRoomId(
                    activeRoomId === room.id ? null : room.id
                  )
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  scoreBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
    padding: 16,
  },
  scoreBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreBannerTeam: {
    alignItems: "flex-start",
    gap: 6,
    width: 60,
  },
  scoreBannerFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreBannerFlagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  scoreBannerTeamName: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  scoreBannerCenter: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  scoreBannerScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    letterSpacing: -1,
  },
  scoreBannerStage: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  listLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  roomList: {
    gap: 10,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
    paddingVertical: 12,
    paddingRight: 14,
    gap: 12,
  },
  colorStrip: {
    width: 4,
    alignSelf: "stretch",
  },
  roomAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  roomAvatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  roomInfo: {
    flex: 1,
    gap: 4,
  },
  roomInfoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  roomName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  vibeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vibeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  roomMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  roomOnlineBlock: {
    alignItems: "center",
    gap: 3,
  },
  roomOnline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
