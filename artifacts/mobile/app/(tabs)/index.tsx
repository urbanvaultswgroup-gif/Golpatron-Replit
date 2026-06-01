import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiveBadge } from "@/components/LiveBadge";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { footballApi, type LiveMatch, type NewsItem } from "@/services/footballApi";

const { width } = Dimensions.get("window");

const HIGHLIGHTS = [
  { id: "1", title: "Lozano's screamer vs Argentina", duration: "1:24", views: "2.1M", teamColor: "#006847" },
  { id: "2", title: "Mbappe hat-trick highlights", duration: "3:07", views: "5.8M", teamColor: "#0055A4" },
  { id: "3", title: "Best saves of the tournament", duration: "4:12", views: "1.4M", teamColor: "#333A4D" },
  { id: "4", title: "Messi magical dribble vs Spain", duration: "0:47", views: "9.2M", teamColor: "#4B9CD3" },
];

function TeamFlag({ code, color, size = 40 }: { code: string; color: string; size?: number }) {
  return (
    <View style={{ backgroundColor: color, width: size, height: size, borderRadius: size / 2, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontFamily: "Inter_700Bold", color: "#FFFFFF", fontSize: size * 0.28, letterSpacing: 0.5 }}>
        {code.substring(0, 3)}
      </Text>
    </View>
  );
}

function tagColor(tag: string, colors: ReturnType<typeof useColors>) {
  if (tag === "GOAL") return colors.primary;
  if (tag === "MUNDIAL") return colors.gold;
  if (tag === "VAR") return "#FFB800";
  if (tag === "INJURY") return colors.accent;
  return colors.mutedForeground;
}

export default function HomeScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const { data: liveData, isLoading: loadingLive, refetch: refetchLive } = useQuery({
    queryKey: ["football-live"],
    queryFn: footballApi.getLive,
    refetchInterval: 45_000,
    retry: 1,
  });

  const { data: newsData, refetch: refetchNews } = useQuery({
    queryKey: ["football-news"],
    queryFn: footballApi.getNews,
    refetchInterval: 2 * 3_600_000,
    retry: 1,
  });

  const { data: fixturesData } = useQuery({
    queryKey: ["football-fixtures"],
    queryFn: footballApi.getFixtures,
    refetchInterval: 30 * 60_000,
    retry: 1,
  });

  const matches: LiveMatch[] = liveData?.matches ?? [];
  const news: NewsItem[] = newsData?.news ?? [];
  const nextMatch = fixturesData?.fixtures?.[0] ?? null;

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId) ?? matches[0]
    : matches[0];

  const isLive = liveData?.source === "live";

  const refreshAll = () => {
    refetchLive();
    refetchNews();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingLive}
            onRefresh={refreshAll}
            tintColor={colors.primary}
          />
        }
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
            {matches.length > 0 && (
              <View style={styles.liveCount}>
                <View style={[styles.liveCountDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.liveCountText, { color: colors.mutedForeground }]}>
                  {matches.length} LIVE
                </Text>
              </View>
            )}
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Hero Live Match */}
        {loadingLive && !selectedMatch ? (
          <View style={[styles.heroContainer, { justifyContent: "center", alignItems: "center", backgroundColor: colors.card }]}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : selectedMatch ? (
          <View style={styles.heroContainer}>
            <Image
              source={require("@/assets/images/hero_stadium.png")}
              style={styles.heroImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(8,12,20,0.65)", "#080C14"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroAccents}>
              <View style={[styles.heroAccentLeft, { backgroundColor: selectedMatch.homeColor + "44" }]} />
              <View style={[styles.heroAccentRight, { backgroundColor: selectedMatch.awayColor + "44" }]} />
            </View>
            <View style={styles.heroContent}>
              <View style={styles.heroStageRow}>
                <LiveBadge minute={parseInt(selectedMatch.minute) || undefined} />
                <Text style={[styles.heroStage, { color: colors.mutedForeground }]}>
                  {selectedMatch.stage}
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <View style={styles.teamBlock}>
                  <TeamFlag code={selectedMatch.home} color={selectedMatch.homeColor} size={52} />
                  <Text style={[styles.teamCode, { color: colors.foreground }]}>{selectedMatch.home}</Text>
                </View>
                <View style={styles.scoreCenterBlock}>
                  <Text style={[styles.heroScore, { color: colors.foreground }]}>
                    {selectedMatch.homeScore}
                    <Text style={{ color: colors.mutedForeground }}> : </Text>
                    {selectedMatch.awayScore}
                  </Text>
                </View>
                <View style={[styles.teamBlock, { alignItems: "flex-end" }]}>
                  <TeamFlag code={selectedMatch.away} color={selectedMatch.awayColor} size={52} />
                  <Text style={[styles.teamCode, { color: colors.foreground }]}>{selectedMatch.away}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Live Match Ribbon */}
        {matches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LIVE NOW</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ribbonContent} snapToInterval={152} decelerationRate="fast">
              {matches.map((m) => {
                const isSelected = selectedMatch?.id === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setSelectedMatchId(m.id)}
                    style={[
                      styles.miniCard,
                      {
                        backgroundColor: isSelected ? colors.secondary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <LiveBadge minute={parseInt(m.minute) || undefined} size="sm" />
                    <View style={styles.miniScoreRow}>
                      <TeamFlag code={m.home} color={m.homeColor} size={26} />
                      <Text style={[styles.miniScore, { color: colors.foreground }]}>
                        {m.homeScore} - {m.awayScore}
                      </Text>
                      <TeamFlag code={m.away} color={m.awayColor} size={26} />
                    </View>
                    <Text style={[styles.miniStage, { color: colors.mutedForeground }]}>{m.stage}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Next Match Countdown */}
        {nextMatch && (
          <View style={[styles.countdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>NEXT MATCH</Text>
              <View style={styles.countdownTeams}>
                <TeamFlag code={nextMatch.home} color={nextMatch.homeColor} size={30} />
                <Text style={{ color: colors.mutedForeground, fontSize: 13, marginHorizontal: 4 }}>vs</Text>
                <TeamFlag code={nextMatch.away} color={nextMatch.awayColor} size={30} />
              </View>
              <Text style={[styles.countdownStage, { color: colors.mutedForeground }]}>{nextMatch.stage}</Text>
            </View>
            <View style={styles.countdownTimer}>
              {nextMatch.kickoff ? (
                <KickoffCountdown kickoff={nextMatch.kickoff} primaryColor={colors.primary} />
              ) : (
                <Text style={[styles.countdownTime, { color: colors.primary }]}>SOON</Text>
              )}
              <Text style={[styles.countdownSublabel, { color: colors.mutedForeground }]}>KICKOFF</Text>
            </View>
          </View>
        )}

        {/* Flash News */}
        {news.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FLASH NEWS</Text>
            {news.map((n, i) => (
              <Pressable key={n.id}>
                <View style={[styles.newsItem, { borderBottomColor: colors.border, borderBottomWidth: i < news.length - 1 ? 1 : 0 }]}>
                  <View style={styles.newsLeft}>
                    <View style={[styles.newsTag, { backgroundColor: tagColor(n.tag, colors) + "22" }]}>
                      <Text style={[styles.newsTagText, { color: tagColor(n.tag, colors) }]}>{n.tag}</Text>
                    </View>
                    <Text style={[styles.newsHeadline, { color: colors.foreground }]} numberOfLines={2}>
                      {n.headline}
                    </Text>
                  </View>
                  <Text style={[styles.newsTime, { color: colors.mutedForeground }]}>{n.time}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Highlights */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>HIGHLIGHTS</Text>
            <Pressable>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightContent}>
            {HIGHLIGHTS.map((h) => (
              <Pressable key={h.id} style={styles.highlightCard}>
                <View style={[styles.highlightThumb, { backgroundColor: h.teamColor }]}>
                  <Image
                    source={require("@/assets/images/match_action.png")}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
                  <View style={styles.playBtn}>
                    <Ionicons name="play" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.highlightDuration}>
                    <Text style={styles.highlightDurationText}>{h.duration}</Text>
                  </View>
                </View>
                <Text style={[styles.highlightTitle, { color: colors.foreground }]} numberOfLines={2}>{h.title}</Text>
                <Text style={[styles.highlightViews, { color: colors.mutedForeground }]}>{h.views} views</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Mundial strip */}
        <View style={[styles.sponsorStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient
            colors={[theme.gradientColors[0] + "33", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="trophy" size={20} color={colors.gold} />
          <Text style={[styles.sponsorText, { color: colors.foreground }]}>
            Mundial 2026{" "}
            <Text style={{ color: colors.mutedForeground }}>USA · MEX · CAN</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function KickoffCountdown({ kickoff, primaryColor }: { kickoff: string; primaryColor: string }) {
  const diff = new Date(kickoff).getTime() - Date.now();
  if (diff <= 0) return <Text style={[styles.countdownTime, { color: primaryColor }]}>NOW</Text>;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return <Text style={[styles.countdownTime, { color: primaryColor }]}>{h}h {m}m</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16 },
  logoText: { fontFamily: "Inter_700Bold", fontSize: 24, letterSpacing: -0.5 },
  logoSub: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 1, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  liveCount: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveCountDot: { width: 6, height: 6, borderRadius: 3 },
  liveCountText: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.5 },
  iconBtn: { padding: 4 },
  heroContainer: { width: "100%", height: 190, position: "relative", overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  heroAccents: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  heroAccentLeft: { flex: 1 },
  heroAccentRight: { flex: 1 },
  heroContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 },
  heroStageRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  heroStage: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.5 },
  demoBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  demoText: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 0.8 },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamBlock: { alignItems: "flex-start", gap: 6 },
  scoreCenterBlock: { alignItems: "center" },
  heroScore: { fontFamily: "Inter_700Bold", fontSize: 48, letterSpacing: -1 },
  teamCode: { fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.5, marginBottom: 14 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  seeAll: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  ribbonContent: { gap: 12, paddingRight: 20 },
  miniCard: { borderRadius: 14, padding: 12, gap: 8, minWidth: 140 },
  miniScoreRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "space-between" },
  miniScore: { fontFamily: "Inter_700Bold", fontSize: 15 },
  miniStage: { fontFamily: "Inter_400Regular", fontSize: 10, letterSpacing: 0.3 },
  countdownCard: { marginHorizontal: 20, marginTop: 28, borderRadius: 16, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1 },
  countdownLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },
  countdownTeams: { flexDirection: "row", alignItems: "center", gap: 6 },
  countdownStage: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  countdownTimer: { alignItems: "flex-end" },
  countdownTime: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.5 },
  countdownSublabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
  newsItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 14, gap: 12 },
  newsLeft: { flex: 1, gap: 6 },
  newsTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start" },
  newsTagText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  newsHeadline: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  newsTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },
  highlightContent: { gap: 14, paddingRight: 20 },
  highlightCard: { width: 170, gap: 8 },
  highlightThumb: { width: 170, height: 110, borderRadius: 12, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  playBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)" },
  highlightDuration: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  highlightDurationText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#FFFFFF" },
  highlightTitle: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
  highlightViews: { fontFamily: "Inter_400Regular", fontSize: 11 },
  sponsorStrip: { marginHorizontal: 20, marginTop: 28, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 10, overflow: "hidden" },
  sponsorText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
