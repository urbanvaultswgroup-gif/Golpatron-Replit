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

const { width } = Dimensions.get("window");

const LIVE_MATCHES = [
  {
    id: "1",
    home: "BRA",
    away: "ARG",
    homeScore: 1,
    awayScore: 0,
    minute: 67,
    stage: "Quarter-Final",
    homeFlagColor: "#009C3B",
    awayFlagColor: "#74ACDF",
  },
  {
    id: "2",
    home: "FRA",
    away: "ENG",
    homeScore: 2,
    awayScore: 1,
    minute: 45,
    stage: "Semi-Final",
    homeFlagColor: "#002395",
    awayFlagColor: "#C8102E",
  },
  {
    id: "3",
    home: "ESP",
    away: "GER",
    homeScore: 0,
    awayScore: 0,
    minute: 23,
    stage: "Quarter-Final",
    homeFlagColor: "#AA151B",
    awayFlagColor: "#000000",
  },
  {
    id: "4",
    home: "POR",
    away: "MAR",
    homeScore: 1,
    awayScore: 1,
    minute: 78,
    stage: "Quarter-Final",
    homeFlagColor: "#006600",
    awayFlagColor: "#C1272D",
  },
];

const NEWS = [
  {
    id: "1",
    headline: "Mbappe scores hat-trick in historic comeback",
    time: "2m ago",
    tag: "GOAL",
  },
  {
    id: "2",
    headline: "VAR overturns penalty decision in France clash",
    time: "8m ago",
    tag: "VAR",
  },
  {
    id: "3",
    headline: "Vinicius Jr ruled out of next match with injury",
    time: "15m ago",
    tag: "INJURY",
  },
  {
    id: "4",
    headline: "Record 3.2 billion viewers for tonight's semi-final",
    time: "22m ago",
    tag: "NEWS",
  },
];

const NEXT_MATCH = {
  home: "ITA",
  away: "NED",
  stage: "Quarter-Final",
  hoursLeft: 2,
  minutesLeft: 34,
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
        styles.flagCircle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.flagCode, { fontSize: size * 0.28 }]}>{code}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedMatch, setSelectedMatch] = useState(LIVE_MATCHES[0]);
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const tagColor = (tag: string) => {
    if (tag === "GOAL") return "#00E676";
    if (tag === "VAR") return "#FFB800";
    if (tag === "INJURY") return "#FF4500";
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
          <Text style={[styles.logoText, { color: colors.foreground }]}>
            Gol<Text style={{ color: colors.primary }}>Patrón</Text>
          </Text>
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
              <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
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
            colors={["transparent", "rgba(8,12,20,0.7)", "#080C14"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroStageRow}>
              <LiveBadge minute={selectedMatch.minute} />
              <Text style={[styles.heroStage, { color: colors.mutedForeground }]}>
                {selectedMatch.stage}
              </Text>
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
                      borderColor: isSelected
                        ? colors.primary
                        : colors.border,
                      borderWidth: isSelected ? 1 : 0,
                    },
                  ]}
                >
                  <LiveBadge minute={m.minute} size="sm" />
                  <View style={styles.miniScoreRow}>
                    <TeamFlag code={m.home} color={m.homeFlagColor} size={28} />
                    <Text
                      style={[styles.miniScore, { color: colors.foreground }]}
                    >
                      {m.homeScore} - {m.awayScore}
                    </Text>
                    <TeamFlag code={m.away} color={m.awayFlagColor} size={28} />
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
              <Text
                style={[styles.countdownTeam, { color: colors.foreground }]}
              >
                {NEXT_MATCH.home}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                {" "}vs{" "}
              </Text>
              <Text
                style={[styles.countdownTeam, { color: colors.foreground }]}
              >
                {NEXT_MATCH.away}
              </Text>
            </View>
            <Text
              style={[styles.countdownStage, { color: colors.mutedForeground }]}
            >
              {NEXT_MATCH.stage}
            </Text>
          </View>
          <View style={styles.countdownTimer}>
            <Text style={[styles.countdownTime, { color: colors.primary }]}>
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
                      style={[styles.newsTagText, { color: tagColor(n.tag) }]}
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
  iconBtn: {
    padding: 4,
  },
  heroContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
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
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamBlock: {
    alignItems: "flex-start",
    gap: 6,
  },
  scoreCenterBlock: {
    alignItems: "center",
  },
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
  flagCircle: {
    justifyContent: "center",
    alignItems: "center",
  },
  flagCode: {
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
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
  ribbonContent: {
    gap: 12,
    paddingRight: 20,
  },
  miniCard: {
    borderRadius: 14,
    padding: 14,
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
    fontSize: 16,
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
    marginBottom: 4,
  },
  countdownTeams: {
    flexDirection: "row",
    alignItems: "center",
  },
  countdownTeam: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  countdownStage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  countdownTimer: {
    alignItems: "flex-end",
  },
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
  newsLeft: {
    flex: 1,
    gap: 6,
  },
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
});
