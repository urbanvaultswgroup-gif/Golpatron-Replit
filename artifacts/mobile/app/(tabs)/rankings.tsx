import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { footballApi, type TopScorer } from "@/services/footballApi";

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

function getValue(p: TopScorer, metric: Metric): string {
  if (metric === "goals") return `${p.goals}`;
  if (metric === "assists") return `${p.assists}`;
  return p.rating.toFixed(1);
}

function getInitial(name: string): string {
  const parts = name.split(" ");
  return parts[parts.length - 1]?.[0] ?? name[0] ?? "?";
}

export default function RankingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const [metric, setMetric] = useState<Metric>("goals");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["football-topscorers"],
    queryFn: footballApi.getTopScorers,
    refetchInterval: 120_000,
    retry: 1,
  });

  const players: TopScorer[] = data?.topscorers ?? [];
  const isLive = data?.source === "live";

  const sorted = [...players].sort((a, b) => {
    if (metric === "goals") return b.goals - a.goals;
    if (metric === "assists") return b.assists - a.assists;
    return b.rating - a.rating;
  }).map((p, i) => ({ ...p, rank: i + 1 }));

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Rankings</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Mundial 2026{!isLive ? " · Demo" : ""}
            </Text>
          </View>
          {isLoading && <ActivityIndicator color={colors.primary} />}
        </View>

        {/* Metric selector */}
        <View style={[styles.metricRow, { backgroundColor: colors.card }]}>
          {METRICS.map((m) => {
            const active = metric === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMetric(m.key)}
                style={[styles.metricBtn, { backgroundColor: active ? colors.primary : "transparent" }]}
              >
                <Ionicons name={m.icon as any} size={14} color={active ? colors.primaryForeground : colors.mutedForeground} />
                <Text style={[styles.metricLabel, { color: active ? colors.primaryForeground : colors.mutedForeground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Podium */}
        {topThree.length >= 3 && (
          <View style={styles.podium}>
            {[topThree[1], topThree[0], topThree[2]].map((p, podiumIdx) => {
              if (!p) return null;
              const realRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              const heights = [120, 148, 104];
              const podHeight = heights[podiumIdx];
              const rankColor = getRankColor(realRank, colors);
              const initial = getInitial(p.name);
              return (
                <View key={p.name} style={styles.podiumSlot}>
                  <View style={[styles.podiumAvatar, { backgroundColor: p.teamColor, borderColor: rankColor, borderWidth: realRank === 1 ? 2 : 1 }]}>
                    <Text style={styles.podiumAvatarLetter}>{initial}</Text>
                  </View>
                  <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>
                    {p.name.split(" ").slice(-1)[0]}
                  </Text>
                  <Text style={[styles.podiumVal, { color: rankColor }]}>
                    {getValue(p, metric)} {metric === "goals" ? "G" : metric === "assists" ? "A" : ""}
                  </Text>
                  <View style={[styles.podiumBlock, { height: podHeight, backgroundColor: realRank === 1 ? colors.gold + "22" : colors.card, borderTopColor: rankColor, borderTopWidth: 2 }]}>
                    <Text style={[styles.podiumRank, { color: rankColor }]}>{realRank}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Rest of list */}
        <View style={styles.list}>
          {rest.map((p, idx) => {
            const rankColor = getRankColor(p.rank, colors);
            const initial = getInitial(p.name);
            return (
              <View
                key={p.name + idx}
                style={[styles.listRow, { borderBottomColor: colors.border, borderBottomWidth: idx < rest.length - 1 ? 1 : 0 }]}
              >
                <Text style={[styles.listRank, { color: rankColor, width: 28 }]}>{p.rank}</Text>
                <View style={[styles.listAvatar, { backgroundColor: p.teamColor }]}>
                  <Text style={styles.listAvatarLetter}>{initial}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={[styles.listName, { color: colors.foreground }]}>{p.name}</Text>
                  <Text style={[styles.listCountry, { color: colors.mutedForeground }]}>{p.country}</Text>
                </View>
                <Text style={[styles.listVal, { color: colors.primary }]}>
                  {getValue(p, metric)}{" "}
                  <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                    {metric === "goals" ? "G" : metric === "assists" ? "A" : ""}
                  </Text>
                </Text>
              </View>
            );
          })}
        </View>

        {isLoading && players.length === 0 && (
          <View style={styles.loadingCenter}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading rankings…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.5 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 14, marginTop: 4 },
  metricRow: { marginHorizontal: 20, borderRadius: 12, flexDirection: "row", padding: 4, marginBottom: 28 },
  metricBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 9 },
  metricLabel: { fontSize: 13 },
  podium: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, marginBottom: 28, gap: 4 },
  podiumSlot: { flex: 1, alignItems: "center" },
  podiumAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  podiumAvatarLetter: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  podiumName: { fontFamily: "Inter_600SemiBold", fontSize: 11, marginBottom: 2, textAlign: "center" },
  podiumVal: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 6 },
  podiumBlock: { width: "100%", borderRadius: 8, justifyContent: "flex-start", alignItems: "center", paddingTop: 10 },
  podiumRank: { fontFamily: "Inter_700Bold", fontSize: 20 },
  list: { paddingHorizontal: 20 },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  listRank: { fontFamily: "Inter_700Bold", fontSize: 14 },
  listAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  listAvatarLetter: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  listInfo: { flex: 1 },
  listName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  listCountry: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  listVal: { fontFamily: "Inter_700Bold", fontSize: 16 },
  loadingCenter: { alignItems: "center", paddingVertical: 60, gap: 12 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14 },
});
