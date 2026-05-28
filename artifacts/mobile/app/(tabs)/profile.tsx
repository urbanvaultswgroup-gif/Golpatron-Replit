import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
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

const ACHIEVEMENTS = [
  { id: "1", icon: "football", label: "First Goal", description: "Made your first prediction", unlocked: true },
  { id: "2", icon: "flash", label: "On Fire", description: "3-prediction win streak", unlocked: true },
  { id: "3", icon: "trophy", label: "Top 100", description: "Ranked in global top 100", unlocked: true },
  { id: "4", icon: "star", label: "MVP Picker", description: "Predicted MVP correctly 5x", unlocked: false },
  { id: "5", icon: "heart", label: "Super Fan", description: "Joined 10 fan rooms", unlocked: false },
  { id: "6", icon: "ribbon", label: "Final Whistle", description: "Predict a perfect final score", unlocked: false },
];

const FAVORITE_TEAM_COLORS = ["#009C3B", "#74ACDF", "#002395", "#AA151B", "#C8102E", "#006600"];
const FAVORITE_TEAMS = ["BRA", "ARG", "FRA", "ESP", "ENG", "POR"];

const PROFILE_KEY = "golpatron_profile";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [favoriteIdx, setFavoriteIdx] = useState(0);
  const [stats] = useState({ predictions: 14, correct: 9, streak: 3, points: 420 });

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((data) => {
      if (data) {
        try {
          const p = JSON.parse(data);
          setFavoriteIdx(p.favoriteIdx ?? 0);
        } catch {}
      }
    });
  }, []);

  const selectTeam = async (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavoriteIdx(idx);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ favoriteIdx: idx }));
  };

  const accuracy = Math.round((stats.correct / stats.predictions) * 100);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={[FAVORITE_TEAM_COLORS[favoriteIdx] + "55", colors.background]}
          style={[styles.heroGradient, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: FAVORITE_TEAM_COLORS[favoriteIdx] },
              ]}
            >
              <Text style={styles.avatarLetter}>
                {FAVORITE_TEAMS[favoriteIdx][0]}
              </Text>
            </View>
            <View
              style={[
                styles.avatarBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="checkmark" size={10} color="#000" />
            </View>
          </View>
          <Text style={[styles.username, { color: colors.foreground }]}>
            FootballFan
          </Text>
          <Text style={[styles.userSince, { color: colors.mutedForeground }]}>
            Mundial 2026 • Fan since day 1
          </Text>
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: "PREDICTIONS", value: stats.predictions, icon: "analytics" },
            { label: "CORRECT", value: stats.correct, icon: "checkmark-circle" },
            { label: "ACCURACY", value: `${accuracy}%`, icon: "pie-chart" },
            { label: "POINTS", value: stats.points, icon: "trophy" },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name={s.icon as any}
                size={18}
                color={colors.primary}
              />
              <Text
                style={[styles.statCardVal, { color: colors.foreground }]}
              >
                {s.value}
              </Text>
              <Text
                style={[
                  styles.statCardLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Streak bar */}
        <View
          style={[
            styles.streakCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.streakLeft}>
            <Ionicons name="flash" size={22} color={colors.gold} />
            <View>
              <Text style={[styles.streakTitle, { color: colors.foreground }]}>
                {stats.streak}-prediction streak
              </Text>
              <Text
                style={[
                  styles.streakSub,
                  { color: colors.mutedForeground },
                ]}
              >
                Keep it up — top 15% this week
              </Text>
            </View>
          </View>
          <View style={styles.streakDots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.streakDot,
                  {
                    backgroundColor:
                      i < stats.streak ? colors.gold : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Favorite team */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            YOUR NATION
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamRow}
          >
            {FAVORITE_TEAMS.map((t, idx) => {
              const active = idx === favoriteIdx;
              return (
                <Pressable key={t} onPress={() => selectTeam(idx)}>
                  <View
                    style={[
                      styles.teamChip,
                      {
                        backgroundColor: active
                          ? FAVORITE_TEAM_COLORS[idx]
                          : colors.card,
                        borderColor: active
                          ? FAVORITE_TEAM_COLORS[idx]
                          : colors.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.teamChipText,
                        {
                          color: active ? "#FFF" : colors.mutedForeground,
                          fontFamily: active
                            ? "Inter_700Bold"
                            : "Inter_500Medium",
                        },
                      ]}
                    >
                      {t}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            ACHIEVEMENTS
          </Text>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.achievementCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: a.unlocked
                      ? colors.primary + "44"
                      : colors.border,
                    borderWidth: 1,
                    opacity: a.unlocked ? 1 : 0.45,
                  },
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: a.unlocked
                        ? colors.primary + "22"
                        : colors.secondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={a.icon as any}
                    size={20}
                    color={a.unlocked ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementLabel,
                    { color: colors.foreground },
                  ]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
                <Text
                  style={[
                    styles.achievementDesc,
                    { color: colors.mutedForeground },
                  ]}
                  numberOfLines={2}
                >
                  {a.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroGradient: {
    alignItems: "center",
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "#FFFFFF",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  userSince: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: "flex-start",
  },
  statCardVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statCardLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1,
  },
  streakCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  streakTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  streakSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  streakDots: {
    flexDirection: "row",
    gap: 6,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  teamRow: {
    gap: 10,
    paddingRight: 20,
  },
  teamChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  teamChipText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  achievementDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
});
