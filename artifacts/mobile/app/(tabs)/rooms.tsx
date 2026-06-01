import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
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
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LiveBadge } from "@/components/LiveBadge";
import { footballApi } from "@/services/footballApi";
import {
  subscribeToRoomPresence,
  joinRoom,
  leaveRoom,
  type RoomPresence,
} from "@/services/firebase";
import { useAuth } from "@/contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COL = 3;
const CARD_GAP = 10;
const CARD_W = (SCREEN_WIDTH - 20 * 2 - CARD_GAP * (COL - 1)) / COL;

const ROOMS = [
  { id: "1", country: "Mexico",   code: "MEX", color: "#006847", color2: "#CE1126", online: 12443, active: 2100, live: true,  vibe: "ELECTRIC", message: "GOOOAL! Chucky equalizes — el tri is ALIVE!" },
  { id: "2", country: "Argentina",code: "ARG", color: "#4B9CD3", color2: "#74B2E0", online: 9104,  active: 840,  live: true,  vibe: "HYPE",     message: "Messi playing out of his mind, this man is built different" },
  { id: "3", country: "France",   code: "FRA", color: "#0055A4", color2: "#ED2939", online: 6208,  active: 590,  live: true,  vibe: "DOMINANT", message: "Mbappe hat-trick incoming?? This man is unstoppable" },
  { id: "4", country: "Brazil",   code: "BRA", color: "#009C3B", color2: "#FEDF00", online: 7843,  active: 310,  live: false, vibe: "READY",    message: "Next match in 1h 48m – canarinho já ta preparado" },
  { id: "5", country: "England",  code: "ENG", color: "#CF091D", color2: "#00247D", online: 4904,  active: 420,  live: true,  vibe: "TENSE",    message: "Kane needs one more to equal the all-time record" },
  { id: "6", country: "Spain",    code: "ESP", color: "#C60B1E", color2: "#F1BF00", online: 5182,  active: 510,  live: true,  vibe: "SMOOTH",   message: "Pedri absolutely controlling midfield — poetry" },
  { id: "7", country: "Portugal", code: "POR", color: "#006600", color2: "#FF0000", online: 3671,  active: 180,  live: false, vibe: "DEBATE",   message: "Ronaldo dropped from starting XI — massive news" },
  { id: "8", country: "Germany",  code: "GER", color: "#DD0000", color2: "#FFCE00", online: 2887,  active: 270,  live: true,  vibe: "PRECISE",  message: "Tactical masterclass from Nagelsmann — total football" },
  { id: "9", country: "Morocco",  code: "MAR", color: "#C1272D", color2: "#006233", online: 2341,  active: 190,  live: false, vibe: "RISING",   message: "Atlas Lions ready for the next round — North Africa unites" },
];

const REACTIONS = [
  { id: "fire",  icon: "flame" },
  { id: "clap",  icon: "hand-right" },
  { id: "cry",   icon: "sad" },
  { id: "goat",  icon: "star" },
  { id: "heart", icon: "heart" },
];

const VIBE_COLORS: Record<string, string> = {
  ELECTRIC: "#FFD700",
  HYPE:     "#FF6B35",
  DOMINANT: "#4B9CD3",
  READY:    "#009C3B",
  TENSE:    "#FF4444",
  SMOOTH:   "#C60B1E",
  DEBATE:   "#9B59B6",
  PRECISE:  "#FFCE00",
  RISING:   "#C1272D",
};

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function RoomCard({
  room,
  isActive,
  liveCount,
  onPress,
}: {
  room: (typeof ROOMS)[0];
  isActive: boolean;
  liveCount: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.93, { damping: 14 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 14 }); }, 120);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const vibeColor = VIBE_COLORS[room.vibe] ?? "#888";
  const displayCount = liveCount > 0 ? liveCount : room.active;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          anim,
          {
            borderColor: isActive ? room.color : colors.border,
            borderWidth: isActive ? 2 : 1,
            backgroundColor: isActive ? room.color + "14" : colors.card,
          },
        ]}
      >
        {/* Live dot */}
        {room.live && (
          <View style={styles.liveDot}>
            <View style={[styles.liveDotInner, { backgroundColor: "#FF3B30" }]} />
          </View>
        )}

        {/* Gradient circle */}
        <LinearGradient
          colors={[room.color, room.color2]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.circle}
        >
          <Text style={styles.circleCode}>{room.code}</Text>
        </LinearGradient>

        {/* Country name */}
        <Text style={[styles.cardCountry, { color: isActive ? room.color : colors.foreground }]} numberOfLines={1}>
          {room.country}
        </Text>

        {/* Active count */}
        <View style={styles.cardActive}>
          <Ionicons name="flame" size={9} color={vibeColor} />
          <Text style={[styles.cardActiveText, { color: colors.mutedForeground }]}>
            {fmt(displayCount)}
          </Text>
        </View>

        {/* Fans total */}
        <Text style={[styles.cardFans, { color: colors.mutedForeground }]}>
          {fmt(room.online)} fans
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function RoomPanel({ room }: { room: (typeof ROOMS)[0] }) {
  const colors = useColors();
  const [reactions, setReactions] = useState<Record<string, number>>({
    fire: 247, clap: 89, cry: 12, goat: 334, heart: 156,
  });
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, [room.id]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const react = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const mine = new Set(myReactions);
    if (mine.has(id)) {
      mine.delete(id);
      setReactions((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) - 1) }));
    } else {
      mine.add(id);
      setReactions((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
    }
    setMyReactions(mine);
  };

  return (
    <Animated.View style={[styles.panel, anim, { backgroundColor: colors.card, borderColor: room.color + "55" }]}>
      <LinearGradient
        colors={[room.color + "18", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Trending trending section */}
      <View style={styles.trendingRow}>
        <Ionicons name="trending-up" size={14} color={VIBE_COLORS[room.vibe] ?? colors.primary} />
        <Text style={[styles.trendingLabel, { color: VIBE_COLORS[room.vibe] ?? colors.primary }]}>
          {room.vibe}
        </Text>
        {room.live && <LiveBadge size="sm" />}
      </View>

      {/* Message */}
      <Text style={[styles.panelMessage, { color: colors.foreground }]} numberOfLines={3}>
        {room.message}
      </Text>

      {/* Reactions */}
      <View style={styles.reactionRow}>
        {REACTIONS.map((r) => {
          const active = myReactions.has(r.id);
          return (
            <Pressable
              key={r.id}
              onPress={() => react(r.id)}
              style={[
                styles.reactionBtn,
                {
                  backgroundColor: active ? room.color + "33" : colors.secondary,
                  borderWidth: active ? 1 : 0,
                  borderColor: room.color,
                },
              ]}
            >
              <Ionicons name={r.icon as any} size={15} color={active ? room.color : colors.foreground} />
              <Text style={[styles.reactionCount, { color: active ? room.color : colors.mutedForeground }]}>
                {reactions[r.id] ?? 0}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Enter CTA */}
      <Pressable
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        style={[styles.enterBtn, { backgroundColor: room.color }]}
      >
        <Text style={styles.enterBtnText}>Enter Lounge</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [presenceCounts, setPresenceCounts] = useState<Record<string, number>>({});
  const unsubRefs = useRef<Record<string, () => void>>({});

  const { data: liveData } = useQuery({
    queryKey: ["football-live"],
    queryFn: footballApi.getLive,
    refetchInterval: 45_000,
    retry: 1,
  });

  // Subscribe to Firestore presence for all rooms
  useEffect(() => {
    ROOMS.forEach((room) => {
      if (unsubRefs.current[room.id]) return;
      try {
        const unsub = subscribeToRoomPresence(room.id, (p: RoomPresence) => {
          setPresenceCounts((prev) => ({ ...prev, [room.id]: p.activeCount }));
        });
        unsubRefs.current[room.id] = unsub;
      } catch {
        // Firebase not yet configured — fall through to static data
      }
    });
    return () => {
      Object.values(unsubRefs.current).forEach((u) => u());
      unsubRefs.current = {};
    };
  }, []);

  // Join/leave room presence when selection changes
  useEffect(() => {
    if (!user || !activeRoomId) return;
    joinRoom(activeRoomId, user.uid).catch(() => {});
    return () => {
      leaveRoom(activeRoomId, user.uid).catch(() => {});
    };
  }, [activeRoomId, user]);

  const liveMatch = liveData?.matches?.[0] ?? null;
  const activeRoom = ROOMS.find((r) => r.id === activeRoomId) ?? null;

  // 3-column grid rows
  const rows: (typeof ROOMS)[] = [];
  for (let i = 0; i < ROOMS.length; i += COL) rows.push(ROOMS.slice(i, i + COL));
  const activeRowIndex = activeRoomId
    ? Math.floor(ROOMS.findIndex((r) => r.id === activeRoomId) / COL)
    : -1;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Lounges</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Mundial 2026</Text>
          </View>
          {(liveData?.matches?.length ?? 0) > 0 && (
            <View style={styles.liveChip}>
              <View style={[styles.liveDotMini, { backgroundColor: colors.accent }]} />
              <Text style={[styles.liveChipText, { color: colors.mutedForeground }]}>
                {liveData!.matches.length} LIVE
              </Text>
            </View>
          )}
        </View>

        {/* Live score banner */}
        {liveMatch && (
          <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient
              colors={[liveMatch.homeColor + "30", "transparent", liveMatch.awayColor + "30"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
            <View style={styles.bannerTeam}>
              <View style={[styles.bannerBadge, { backgroundColor: liveMatch.homeColor }]}>
                <Text style={styles.bannerBadgeText}>{liveMatch.home}</Text>
              </View>
              <Text style={[styles.bannerTeamName, { color: colors.foreground }]}>{liveMatch.home}</Text>
            </View>
            <View style={styles.bannerCenter}>
              <LiveBadge minute={parseInt(liveMatch.minute) || undefined} />
              <Text style={[styles.bannerScore, { color: colors.foreground }]}>
                {liveMatch.homeScore} – {liveMatch.awayScore}
              </Text>
              <Text style={[styles.bannerStage, { color: colors.mutedForeground }]}>
                {liveMatch.stage}
              </Text>
            </View>
            <View style={[styles.bannerTeam, { alignItems: "flex-end" }]}>
              <View style={[styles.bannerBadge, { backgroundColor: liveMatch.awayColor }]}>
                <Text style={styles.bannerBadgeText}>{liveMatch.away}</Text>
              </View>
              <Text style={[styles.bannerTeamName, { color: colors.foreground }]}>{liveMatch.away}</Text>
            </View>
          </View>
        )}

        {/* 3-column card grid */}
        <View style={styles.grid}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALL LOUNGES</Text>
          {rows.map((row, rowIdx) => (
            <React.Fragment key={rowIdx}>
              <View style={styles.gridRow}>
                {row.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isActive={activeRoomId === room.id}
                    liveCount={presenceCounts[room.id] ?? 0}
                    onPress={() => setActiveRoomId(activeRoomId === room.id ? null : room.id)}
                  />
                ))}
                {row.length < COL &&
                  Array.from({ length: COL - row.length }).map((_, i) => (
                    <View key={i} style={{ width: CARD_W }} />
                  ))}
              </View>
              {activeRowIndex === rowIdx && activeRoom && (
                <RoomPanel room={activeRoom} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.5 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 4 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDotMini: { width: 6, height: 6, borderRadius: 3 },
  liveChipText: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.5 },

  banner: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, overflow: "hidden", padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  bannerTeam: { alignItems: "flex-start", gap: 6, width: 54 },
  bannerBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  bannerBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: "#FFFFFF", letterSpacing: 0.3 },
  bannerTeamName: { fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 0.3 },
  bannerCenter: { flex: 1, alignItems: "center", gap: 4 },
  bannerScore: { fontFamily: "Inter_700Bold", fontSize: 34, letterSpacing: -1 },
  bannerStage: { fontFamily: "Inter_400Regular", fontSize: 11 },

  grid: { paddingHorizontal: 20 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.5, marginBottom: 18 },
  gridRow: { flexDirection: "row", gap: CARD_GAP, marginBottom: 10 },

  card: { width: CARD_W, borderRadius: 16, padding: 10, alignItems: "center", gap: 5, position: "relative" },
  liveDot: { position: "absolute", top: 8, right: 8, width: 14, height: 14, borderRadius: 7, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center" },
  liveDotInner: { width: 7, height: 7, borderRadius: 4 },
  circle: { width: CARD_W * 0.62, height: CARD_W * 0.62, borderRadius: CARD_W * 0.31, justifyContent: "center", alignItems: "center" },
  circleCode: { fontFamily: "Inter_700Bold", fontSize: CARD_W * 0.19, color: "#FFFFFF", letterSpacing: 1 },
  cardCountry: { fontFamily: "Inter_600SemiBold", fontSize: 11, textAlign: "center", marginTop: 2 },
  cardActive: { flexDirection: "row", alignItems: "center", gap: 3 },
  cardActiveText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  cardFans: { fontFamily: "Inter_400Regular", fontSize: 9 },

  panel: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 14, overflow: "hidden" },
  trendingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  trendingLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.8, flex: 1 },
  panelMessage: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 22 },
  reactionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  reactionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  reactionCount: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  enterBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 12 },
  enterBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF", letterSpacing: 0.3 },
});
