import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { TEAM_THEMES, TeamCode, useTheme } from "@/contexts/ThemeContext";

const ACHIEVEMENTS = [
  { id: "1", icon: "football", label: "First Call", unlocked: true },
  { id: "2", icon: "flame", label: "On Fire", unlocked: true },
  { id: "3", icon: "trophy", label: "Top 100", unlocked: true },
  { id: "4", icon: "star", label: "MVP Eye", unlocked: false },
  { id: "5", icon: "heart", label: "Super Fan", unlocked: false },
  { id: "6", icon: "ribbon", label: "Final Call", unlocked: false },
];

const ALL_TEAMS = Object.entries(TEAM_THEMES).map(([code, t]) => ({
  code: code as TeamCode,
  ...t,
}));

const STREAK_LEN = 5;

function TeamBubble({
  t,
  active,
  onPress,
}: {
  t: { code: TeamCode; name: string; primary: string; gradientColors: [string, string]; primaryForeground: string };
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 12 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 12 }); }, 120);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.teamBubble, anim, { borderColor: active ? t.primary : "transparent", borderWidth: active ? 2.5 : 0 }]}>
        <LinearGradient
          colors={t.gradientColors}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.teamBubbleGrad, { borderRadius: 30 }]}
        >
          <Text style={styles.teamBubbleCode}>{t.code}</Text>
        </LinearGradient>
        <Text
          style={[styles.teamBubbleName, { color: active ? t.primary : "#888", fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}
          numberOfLines={1}
        >
          {t.name}
        </Text>
        {active && (
          <View style={[styles.activePin, { backgroundColor: t.primary }]}>
            <Ionicons name="checkmark" size={8} color="#FFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { teamCode, theme, setTeam } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const stats = { xp: 420, streak: 3, totalPredictions: 14, correct: 9 };
  const winRate = Math.round((stats.correct / stats.totalPredictions) * 100);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={[theme.gradientColors[0] + "88", theme.gradientColors[1] + "33", colors.background]}
          style={[styles.hero, { paddingTop: topPad + 20 }]}
        >
          <View style={[styles.avatarRing, { borderColor: theme.teamColor + "55" }]}>
            <View style={[styles.avatar, { backgroundColor: theme.teamColor }]}>
              <Text style={styles.avatarLetter}>{teamCode[0]}</Text>
            </View>
          </View>
          <Text style={[styles.username, { color: colors.foreground }]}>FootballFan</Text>
          <View style={styles.heroBadge}>
            <View style={[styles.heroBadgeDot, { backgroundColor: theme.teamColor }]} />
            <Text style={[styles.heroBadgeText, { color: colors.mutedForeground }]}>
              {theme.name} · Mundial 2026
            </Text>
          </View>
        </LinearGradient>

        {/* ── Fan Card ── */}
        <View style={styles.fanCard}>
          {[
            { value: stats.xp, label: "XP", icon: "trophy", color: colors.gold },
            { value: stats.streak, label: "STREAK", icon: "flame", color: colors.primary },
            { value: `${winRate}%`, label: "CORRECT", icon: "checkmark-circle", color: colors.accent },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.fanCardDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.fanCardStat}>
                <Ionicons name={s.icon as any} size={16} color={s.color} />
                <Text style={[styles.fanCardVal, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.fanCardLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── Streak bar ── */}
        <View style={[styles.streakRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.streakLeft}>
            <Ionicons name="flame" size={20} color={colors.gold} />
            <View>
              <Text style={[styles.streakTitle, { color: colors.foreground }]}>{stats.streak}-match streak</Text>
              <Text style={[styles.streakSub, { color: colors.mutedForeground }]}>Top 15% this week</Text>
            </View>
          </View>
          <View style={styles.streakDots}>
            {Array.from({ length: STREAK_LEN }).map((_, i) => (
              <View
                key={i}
                style={[styles.streakDot, { backgroundColor: i < stats.streak ? colors.gold : colors.border }]}
              />
            ))}
          </View>
        </View>

        {/* ── Your Nation ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR NATION</Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>Changes app theme</Text>
          </View>
          <View style={styles.teamGrid}>
            {ALL_TEAMS.map((t) => (
              <TeamBubble
                key={t.code}
                t={t}
                active={t.code === teamCode}
                onPress={() => setTeam(t.code)}
              />
            ))}
          </View>
        </View>

        {/* ── Achievements ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACHIEVEMENTS</Text>
          <View style={styles.achievementGrid}>
            {ACHIEVEMENTS.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.achievement,
                  {
                    backgroundColor: a.unlocked ? colors.primary + "18" : colors.card,
                    borderColor: a.unlocked ? colors.primary + "44" : colors.border,
                    opacity: a.unlocked ? 1 : 0.35,
                  },
                ]}
              >
                <View style={[styles.achievementBadge, { backgroundColor: a.unlocked ? colors.primary + "22" : colors.secondary }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.unlocked ? colors.primary : colors.mutedForeground} />
                </View>
                <Text style={[styles.achievementLabel, { color: a.unlocked ? colors.foreground : colors.mutedForeground }]}>
                  {a.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer actions ── */}
        <View style={[styles.footerActions, { borderTopColor: colors.border }]}>
          {[
            { icon: "share-social-outline", label: "Share GolPatrón" },
            { icon: "notifications-outline", label: "Notification settings" },
            { icon: "information-circle-outline", label: "About Mundial 2026" },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[styles.footerRow, { borderBottomColor: colors.border }]}>
                <Ionicons name={item.icon as any} size={20} color={colors.mutedForeground} />
                <Text style={[styles.footerLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: "center", paddingBottom: 28, paddingHorizontal: 20 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  avatar: { width: 86, height: 86, borderRadius: 43, justifyContent: "center", alignItems: "center" },
  avatarLetter: { fontFamily: "Inter_700Bold", fontSize: 38, color: "#FFFFFF" },
  username: { fontFamily: "Inter_700Bold", fontSize: 24, letterSpacing: -0.3 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 5 },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4 },
  heroBadgeText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  fanCard: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  fanCardStat: { flex: 1, alignItems: "center", paddingVertical: 18, gap: 4 },
  fanCardDivider: { width: 1, marginVertical: 16 },
  fanCardVal: { fontFamily: "Inter_700Bold", fontSize: 24, letterSpacing: -0.5 },
  fanCardLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 1 },
  streakRow: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  streakTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  streakSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  streakDots: { flexDirection: "row", gap: 6 },
  streakDot: { width: 9, height: 9, borderRadius: 5 },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.5 },
  sectionCaption: { fontFamily: "Inter_400Regular", fontSize: 11 },
  teamGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  teamBubble: { width: 72, alignItems: "center", gap: 5, borderRadius: 38, padding: 4, position: "relative" },
  teamBubbleGrad: { width: 52, height: 52, justifyContent: "center", alignItems: "center" },
  teamBubbleCode: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#FFFFFF", letterSpacing: 0.5 },
  teamBubbleName: { fontSize: 9, textAlign: "center", letterSpacing: 0.2 },
  activePin: { position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  achievementGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  achievement: { width: "30%", borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 8 },
  achievementBadge: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  achievementLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, textAlign: "center" },
  footerActions: { paddingHorizontal: 20, borderTopWidth: 1, paddingTop: 8 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15, borderBottomWidth: 1 },
  footerLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
});
