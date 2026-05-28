import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Player {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  teamColor: string;
  goals: number;
  assists: number;
  rating: number;
  avatar: string;
}

const PLAYERS: Player[] = [
  { id: "1", name: "Kylian Mbappe", country: "France", countryCode: "FRA", teamColor: "#002395", goals: 8, assists: 3, rating: 9.4, avatar: "K" },
  { id: "2", name: "Cristiano Ronaldo", country: "Portugal", countryCode: "POR", teamColor: "#006600", goals: 6, assists: 1, rating: 8.8, avatar: "C" },
  { id: "3", name: "Lionel Messi", country: "Argentina", countryCode: "ARG", teamColor: "#74ACDF", goals: 6, assists: 5, rating: 9.2, avatar: "L" },
  { id: "4", name: "Vinicius Jr", country: "Brazil", countryCode: "BRA", teamColor: "#009C3B", goals: 5, assists: 4, rating: 8.7, avatar: "V" },
  { id: "5", name: "Harry Kane", country: "England", countryCode: "ENG", teamColor: "#C8102E", goals: 4, assists: 2, rating: 8.1, avatar: "H" },
  { id: "6", name: "Alvaro Morata", country: "Spain", countryCode: "ESP", teamColor: "#AA151B", goals: 4, assists: 1, rating: 7.9, avatar: "A" },
  { id: "7", name: "Lautaro Martinez", country: "Argentina", countryCode: "ARG", teamColor: "#74ACDF", goals: 3, assists: 2, rating: 8.0, avatar: "L" },
  { id: "8", name: "Richarlison", country: "Brazil", countryCode: "BRA", teamColor: "#009C3B", goals: 3, assists: 1, rating: 7.7, avatar: "R" },
  { id: "9", name: "Antoine Griezmann", country: "France", countryCode: "FRA", teamColor: "#002395", goals: 2, assists: 6, rating: 8.3, avatar: "A" },
  { id: "10", name: "Jude Bellingham", country: "England", countryCode: "ENG", teamColor: "#C8102E", goals: 2, assists: 3, rating: 8.5, avatar: "J" },
];

type Metric = "goals" | "assists" | "rating";

const METRICS: { key: Metric; label: string; icon: string }[] = [
  { key: "goals", label: "Goals", icon: "football" },
  { key: "assists", label: "Assists", icon: "git-branch" },
  { key: "rating", label: "Rating", icon: "star" },
];

function getRankColor(rank: number, colors: ReturnType<typeof useColors>) {
  if (rank === 1) return colors.gold;
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return colors.mutedForeground;
}

export default function RankingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const [metric, setMetric] = useState<Metric>("goals");

  const sorted = [...PLAYERS].sort((a, b) => b[metric] - a[metric]);

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const getValue = (p: Player) => {
    if (metric === "goals") return `${p.goals} G`;
    if (metric === "assists") return `${p.assists} A`;
    return p.rating.toFixed(1);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Rankings
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Mundial 2026
          </Text>
        </View>

        {/* Metric selector */}
        <View
          style={[
            styles.metricRow,
            { backgroundColor: colors.card },
          ]}
        >
          {METRICS.map((m) => {
            const active = metric === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMetric(m.key)}
                style={[
                  styles.metricBtn,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={m.icon as any}
                  size={14}
                  color={active ? "#000" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color: active ? "#000" : colors.mutedForeground,
                      fontFamily: active
                        ? "Inter_700Bold"
                        : "Inter_400Regular",
                    },
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Podium */}
        <View style={styles.podium}>
          {[topThree[1], topThree[0], topThree[2]].map((p, podiumIdx) => {
            if (!p) return null;
            const realRank =
              podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = [120, 148, 104];
            const podHeight = heights[podiumIdx];
            const rankColor = getRankColor(realRank, colors);
            return (
              <View key={p.id} style={styles.podiumSlot}>
                <View
                  style={[
                    styles.podiumAvatar,
                    {
                      backgroundColor: p.teamColor,
                      borderColor: rankColor,
                      borderWidth: realRank === 1 ? 2 : 1,
                    },
                  ]}
                >
                  <Text style={styles.podiumAvatarLetter}>{p.avatar}</Text>
                </View>
                <Text
                  style={[
                    styles.podiumName,
                    { color: colors.foreground },
                  ]}
                  numberOfLines={1}
                >
                  {p.name.split(" ").slice(-1)[0]}
                </Text>
                <Text
                  style={[
                    styles.podiumVal,
                    { color: rankColor },
                  ]}
                >
                  {getValue(p)}
                </Text>
                <View
                  style={[
                    styles.podiumBlock,
                    {
                      height: podHeight,
                      backgroundColor:
                        realRank === 1
                          ? colors.gold + "33"
                          : colors.card,
                      borderTopColor: rankColor,
                      borderTopWidth: 2,
                    },
                  ]}
                >
                  <Text style={[styles.podiumRank, { color: rankColor }]}>
                    {realRank}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Rest of the list */}
        <View style={styles.list}>
          {rest.map((p, idx) => {
            const rank = idx + 4;
            const rankColor = getRankColor(rank, colors);
            return (
              <View
                key={p.id}
                style={[
                  styles.listRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx < rest.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[styles.listRank, { color: rankColor, width: 28 }]}
                >
                  {rank}
                </Text>
                <View
                  style={[
                    styles.listAvatar,
                    { backgroundColor: p.teamColor },
                  ]}
                >
                  <Text style={styles.listAvatarLetter}>{p.avatar}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text
                    style={[styles.listName, { color: colors.foreground }]}
                  >
                    {p.name}
                  </Text>
                  <Text
                    style={[
                      styles.listCountry,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {p.countryCode}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.listVal,
                    { color: colors.primary },
                  ]}
                >
                  {getValue(p)}
                </Text>
              </View>
            );
          })}
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
  metricRow: {
    marginHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    padding: 4,
    marginBottom: 28,
  },
  metricBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  metricLabel: {
    fontSize: 13,
  },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 4,
  },
  podiumSlot: {
    flex: 1,
    alignItems: "center",
  },
  podiumAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  podiumAvatarLetter: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  podiumName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    marginBottom: 2,
    textAlign: "center",
  },
  podiumVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginBottom: 6,
  },
  podiumBlock: {
    width: "100%",
    borderRadius: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
  },
  podiumRank: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  listRank: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  listAvatarLetter: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  listInfo: { flex: 1 },
  listName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  listCountry: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  listVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
