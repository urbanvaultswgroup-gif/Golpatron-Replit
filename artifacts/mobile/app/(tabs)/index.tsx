import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiveBadge } from "@/components/LiveBadge";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

const LIVE_MATCHES = [
  {
    id: "1",
    home: "MEX",
    away: "ARG",
    homeScore: 1,
    awayScore: 1,
    minute: 72,
    stage: "Quarter-Final",
    homeFlagColor: "#006847",
    awayFlagColor: "#4B9CD3",
    featured: true,
  },
  {
    id: "2",
    home: "FRA",
    away: "ENG",
    homeScore: 2,
    awayScore: 1,
    minute: 45,
    stage: "Semi-Final",
    homeFlagColor: "#0055A4",
    awayFlagColor: "#CF091D",
  },
  {
    id: "3",
    home: "ESP",
    away: "GER",
    homeScore: 0,
    awayScore: 0,
    minute: 23,
    stage: "Quarter-Final",
    homeFlagColor: "#C60B1E",
    awayFlagColor: "#DD0000",
  },
  {
    id: "4",
    home: "BRA",
    away: "POR",
    homeScore: 3,
    awayScore: 2,
    minute: 89,
    stage: "Quarter-Final",
    homeFlagColor: "#009C3B",
    awayFlagColor: "#006600",
  },
];

const NEWS = [
  {
    id: "1",
    headline: "Chucky Lozano silences the crowd with a thunderous strike",
    time: "3m ago",
    tag: "GOAL",
    team: "MEX",
  },
  {
    id: "2",
    headline: "Mexico advances to QF for first time since 1986",
    time: "11m ago",
    tag: "MUNDIAL",
    team: "MEX",
  },
  {
    id: "3",
    headline: "VAR overturns penalty decision in France clash",
    time: "18m ago",
    tag: "VAR",
    team: null,
  },
  {
    id: "4",
    headline: "Vinicius Jr ruled out of next match with injury",
    time: "25m ago",
    tag: "INJURY",
    team: "BRA",
  },
];

const HIGHLIGHTS = [
  {
    id: "1",
    title: "Lozano's screamer vs Argentina",
    duration: "1:24",
    views: "2.1M",
    team: "MEX",
    teamColor: "#006847",
  },
  {
    id: "2",
    title: "Mbappe hat-trick highlights",
    duration: "3:07",
    views: "5.8M",
    team: "FRA",
    teamColor: "#0055A4",
  },
  {
    id: "3",
    title: "Best saves of the tournament",
    duration: "4:12",
    views: "1.4M",
    team: null,
    teamColor: "#333A4D",
  },
  {
    id: "4",
    title: "Messi magical dribble vs Spain",
    duration: "0:47",
    views: "9.2M",
    team: "ARG",
    teamColor: "#4B9CD3",
  },
];

const NEXT_MATCH = {
  home: "MEX",
  away: "BRA",
  stage: "Semi-Final",
  hoursLeft: 1,
  minutesLeft: 48,
  homeColor: "#006847",
  awayColor: "#009C3B",
};

function TeamFlag({
  code,
  color,
  size = 40,
}: {
  code: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          color: "#FFFFFF",
          fontSize: size * 0.28,
          letterSpacing: 0.5,
        }}
      >
        {code}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedMatch, setSelectedMatch] = useState(LIVE_MATCHES[0]);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const tagColor = (tag: string) => {
    if (tag === "GOAL") return colors.primary;
    if (tag === "MUNDIAL") return colors.gold;
    if (tag === "VAR") return "#FFB800";
    if (tag === "INJURY") return colors.accent;
    return colors.mutedForeground;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View>
            <Text style={[styles.logoText, { color: colors.foreground }]}>
              Gol<Text style={{ color: colors.primary }}>Patrón</Text>
            </Text>
            <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>
              Mundial 2026
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.liveCount}>
              <View
                style={[styles.liveCountDot, { backgroundColor: colors.accent }]}
              />
              <Text
                style={[styles.liveCountText, { color: colors.mutedForeground }]}
              >
                4 LIVE
              </Text>
            </View>
            <Pressable style={styles.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.foreground}
              />
            </Pressable>
          </View>
        </View>

        {/* Hero Live Match */}
        <View style={styles.heroContainer}>
          <Image
            source={require("@/assets/images/hero_stadium.png")}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(8,12,20,0.6)", "#080C14"]}
            style={StyleSheet.absoluteFill}
          />
          {/* Team color accent strips */}
          <View style={styles.heroAccents}>
            <View
              style={[
                styles.heroAccentLeft,
                { backgroundColor: selectedMatch.homeFlagColor + "44" },
              ]}
            />
            <View
              style={[
                styles.heroAccentRight,
                { backgroundColor: selectedMatch.awayFlagColor + "44" },
              ]}
            />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroStageRow}>
              <LiveBadge minute={selectedMatch.minute} />
              <Text style={[styles.heroStage, { color: colors.mutedForeground }]}>
                {selectedMatch.stage}
              </Text>
              {selectedMatch.featured && (
                <View
                  style={[
                    styles.featuredBadge,
                    { backgroundColor: colors.primary + "33" },
                  ]}
                >
                  <Text style={[styles.featuredText, { color: colors.primary }]}>
                    FEATURED
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.scoreRow}>
              <View style={styles.teamBlock}>
                <TeamFlag
                  code={selectedMatch.home}
                  color={selectedMatch.homeFlagColor}
                  size={52}
                />
                <Text style={[styles.teamCode, { color: colors.foreground }]}>
                  {selectedMatch.home}
                </Text>
              </View>
              <View style={styles.scoreCenterBlock}>
                <Text style={[styles.heroScore, { color: colors.foreground }]}>
                  {selectedMatch.homeScore}
                  <Text style={{ color: colors.mutedForeground }}> : </Text>
                  {selectedMatch.awayScore}
                </Text>
              </View>
              <View style={[styles.teamBlock, { alignItems: "flex-end" }]}>
                <TeamFlag
                  code={selectedMatch.away}
                  color={selectedMatch.awayFlagColor}
                  size={52}
                />
                <Text style={[styles.teamCode, { color: colors.foreground }]}>
                  {selectedMatch.away}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Live Match Ribbon */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            LIVE NOW
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ribbonContent}
          >
            {LIVE_MATCHES.map((m) => {
              const isSelected = selectedMatch.id === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setSelectedMatch(m)}
                  style={[
                    styles.miniCard,
                    {
                      backgroundColor: isSelected
                        ? colors.secondary
                        : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <LiveBadge minute={m.minute} size="sm" />
                  <View style={styles.miniScoreRow}>
                    <TeamFlag code={m.home} color={m.homeFlagColor} size={26} />
                    <Text
                      style={[styles.miniScore, { color: colors.foreground }]}
                    >
                      {m.homeScore} - {m.awayScore}
                    </Text>
                    <TeamFlag code={m.away} color={m.awayFlagColor} size={26} />
                  </View>
                  <Text
                    style={[
                      styles.miniStage,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {m.stage}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Countdown */}
        <View
          style={[
            styles.countdownCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View>
            <Text
              style={[
                styles.countdownLabel,
                { color: colors.mutedForeground },
              ]}
            >
              NEXT MATCH
            </Text>
            <View style={styles.countdownTeams}>
              <View
                style={[
                  styles.countdownFlagSmall,
                  { backgroundColor: NEXT_MATCH.homeColor },
                ]}
              >
                <Text style={styles.countdownFlagText}>{NEXT_MATCH.home}</Text>
              </View>
              <Text style={[{ color: colors.mutedForeground, fontSize: 13 }]}>
                {" "}vs{" "}
              </Text>
              <View
                style={[
                  styles.countdownFlagSmall,
                  { backgroundColor: NEXT_MATCH.awayColor },
                ]}
              >
                <Text style={styles.countdownFlagText}>{NEXT_MATCH.away}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.countdownStage,
                { color: colors.mutedForeground },
              ]}
            >
              {NEXT_MATCH.stage}
            </Text>
          </View>
          <View style={styles.countdownTimer}>
            <Text
              style={[styles.countdownTime, { color: colors.primary }]}
            >
              {NEXT_MATCH.hoursLeft}h {NEXT_MATCH.minutesLeft}m
            </Text>
            <Text
              style={[
                styles.countdownSublabel,
                { color: colors.mutedForeground },
              ]}
            >
              KICKOFF
            </Text>
          </View>
        </View>

        {/* Flash News */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            FLASH NEWS
          </Text>
          {NEWS.map((n, i) => (
            <Pressable key={n.id}>
              <View
                style={[
                  styles.newsItem,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: i < NEWS.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.newsLeft}>
                  <View
                    style={[
                      styles.newsTag,
                      { backgroundColor: tagColor(n.tag) + "22" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.newsTagText,
                        { color: tagColor(n.tag) },
                      ]}
                    >
                      {n.tag}
                    </Text>
                  </View>
                  <Text
                    style={[styles.newsHeadline, { color: colors.foreground }]}
                    numberOfLines={2}
                  >
                    {n.headline}
                  </Text>
                </View>
                <Text
                  style={[styles.newsTime, { color: colors.mutedForeground }]}
                >
                  {n.time}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* HIGHLIGHTS section */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              HIGHLIGHTS
            </Text>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightContent}
          >
            {HIGHLIGHTS.map((h) => (
              <Pressable key={h.id} style={styles.highlightCard}>
                <View
                  style={[
                    styles.highlightThumb,
                    { backgroundColor: h.teamColor },
                  ]}
                >
                  <Image
                    source={require("@/assets/images/match_action.png")}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.playBtn}>
                    <Ionicons name="play" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.highlightDuration}>
                    <Text style={styles.highlightDurationText}>
                      {h.duration}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.highlightTitle,
                    { color: colors.foreground },
                  ]}
                  numberOfLines={2}
                >
                  {h.title}
                </Text>
                <Text
                  style={[
                    styles.highlightViews,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {h.views} views
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Mundial 2026 Sponsor Strip */}
        <View
          style={[
            styles.sponsorStrip,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <LinearGradient
            colors={[theme.gradientColors[0] + "33", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="trophy" size={20} color={colors.gold} />
          <Text style={[styles.sponsorText, { color: colors.foreground }]}>
            Mundial 2026{" "}
            <Text style={{ color: colors.mutedForeground }}>
              USA · MEX · CAN
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveCountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveCountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  iconBtn: { padding: 4 },
  heroContainer: {
    width: "100%",
    height: 240,
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroAccents: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  heroAccentLeft: {
    flex: 1,
  },
  heroAccentRight: {
    flex: 1,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroStageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  heroStage: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  featuredBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamBlock: {
    alignItems: "flex-start",
    gap: 6,
  },
  scoreCenterBlock: { alignItems: "center" },
  heroScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 48,
    letterSpacing: -1,
  },
  teamCode: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  seeAll: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  ribbonContent: {
    gap: 12,
    paddingRight: 20,
  },
  miniCard: {
    borderRadius: 14,
    padding: 12,
    gap: 8,
    minWidth: 140,
  },
  miniScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  miniScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  miniStage: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.3,
  },
  countdownCard: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  countdownLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  countdownTeams: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countdownFlagSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownFlagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 8,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  countdownStage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  countdownTimer: { alignItems: "flex-end" },
  countdownTime: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  countdownSublabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  newsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    gap: 12,
  },
  newsLeft: { flex: 1, gap: 6 },
  newsTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  newsTagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
  },
  newsHeadline: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  newsTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  highlightContent: {
    gap: 14,
    paddingRight: 20,
  },
  highlightCard: {
    width: 170,
    gap: 8,
  },
  highlightThumb: {
    width: 170,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  highlightDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  highlightDurationText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  highlightTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  highlightViews: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  sponsorStrip: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  sponsorText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
