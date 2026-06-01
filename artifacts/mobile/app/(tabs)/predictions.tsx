import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
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
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LiveBadge } from "@/components/LiveBadge";
import { footballApi } from "@/services/footballApi";

const STORAGE_KEY = "golpatron_predictions_v2";

const LEADERBOARD = [
  { rank: 1, name: "el_patrón_mx", points: 1840, streak: 7 },
  { rank: 2, name: "vamos_arg99", points: 1620, streak: 5 },
  { rank: 3, name: "bleuet_paris", points: 1440, streak: 4 },
];

interface Question {
  id: string;
  question: string;
  icon: string;
  options: { id: string; label: string; pct: number }[];
  xp: number;
}

function buildQuestions(home: string, away: string): Question[] {
  return [
    {
      id: "next_goal",
      question: "Who scores next?",
      icon: "football",
      xp: 100,
      options: [
        { id: "home_star", label: `${home} #10`, pct: 34 },
        { id: "away_star", label: `${away} #10`, pct: 41 },
        { id: "home_sub", label: `${home} sub`, pct: 14 },
        { id: "away_sub", label: `${away} sub`, pct: 11 },
      ],
    },
    {
      id: "final_result",
      question: "How does it end?",
      icon: "timer",
      xp: 150,
      options: [
        { id: "home_win_90", label: `${home} wins`, pct: 38 },
        { id: "away_win_90", label: `${away} wins`, pct: 29 },
        { id: "draw_et", label: "Draw \u2192 ET", pct: 20 },
        { id: "penalties", label: "Penalties", pct: 13 },
      ],
    },
    {
      id: "mvp",
      question: "Match MVP?",
      icon: "star",
      xp: 75,
      options: [
        { id: "home_gk", label: `${home} GK`, pct: 12 },
        { id: "home_10", label: `${home} #10`, pct: 54 },
        { id: "away_10", label: `${away} #10`, pct: 27 },
        { id: "away_9", label: `${away} #9`, pct: 7 },
      ],
    },
    {
      id: "next_card",
      question: "Next booking?",
      icon: "card",
      xp: 75,
      options: [
        { id: "lt10", label: "< 10 min", pct: 22 },
        { id: "bt1020", label: "10\u201320 min", pct: 35 },
        { id: "gt20", label: "20+ min", pct: 29 },
        { id: "none", label: "None", pct: 14 },
      ],
    },
  ];
}

function XpFlash({ xp, visible }: { xp: number; visible: boolean }) {
  const colors = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0, { duration: 600 }));
      translateY.value = withSequence(withTiming(-20, { duration: 150 }), withTiming(-40, { duration: 600 }));
    } else {
      opacity.value = 0;
      translateY.value = 0;
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    position: "absolute",
    right: 14,
    top: 14,
  }));

  return (
    <Animated.View style={style}>
      <Text style={[styles.xpFlash, { color: colors.gold }]}>+{xp} XP</Text>
    </Animated.View>
  );
}

function OptionBtn({
  label,
  selected,
  locked,
  pct,
  onPress,
}: {
  label: string;
  selected: boolean;
  locked: boolean;
  pct: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (locked) return;
    scale.value = withSpring(0.94, { damping: 14 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 14 }); }, 110);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.optionPressable}>
      <Animated.View
        style={[
          styles.option,
          anim,
          {
            backgroundColor: selected ? colors.primary + "1A" : colors.card,
            borderColor: selected ? colors.primary : colors.border,
            borderWidth: selected ? 1.5 : 1,
            opacity: locked && !selected ? 0.45 : 1,
          },
        ]}
      >
        <View style={styles.optionTop}>
          {selected && (
            <View style={[styles.check, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={9} color={colors.primaryForeground} />
            </View>
          )}
          <Text
            style={[
              styles.optionLabel,
              { color: selected ? colors.primary : colors.foreground, fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular" },
            ]}
          >
            {label}
          </Text>
        </View>
        <View style={[styles.pctTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.pctFill,
              { width: `${pct}%` as any, backgroundColor: selected ? colors.primary : colors.mutedForeground + "55" },
            ]}
          />
        </View>
        <Text style={[styles.pctText, { color: selected ? colors.primary : colors.mutedForeground }]}>
          {pct}% of fans
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function PredictionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [points, setPoints] = useState(420);
  const [streak] = useState(3);
  const [xpFlash, setXpFlash] = useState<{ qId: string; visible: boolean } | null>(null);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: liveData } = useQuery({
    queryKey: ["football-live"],
    queryFn: footballApi.getLive,
    refetchInterval: 45_000,
    retry: 1,
  });

  const liveMatch = liveData?.matches?.[0] ?? null;
  const home = liveMatch?.home ?? "HOME";
  const away = liveMatch?.away ?? "AWAY";
  const minute = liveMatch ? parseInt(liveMatch.minute) || 0 : 72;

  const QUESTIONS = buildQuestions(home, away);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const matchMinute = minute;
  const timeRemaining = matchMinute > 0 ? Math.max(0, 90 - matchMinute) : null;
  const isLocked = allAnswered;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.points) setPoints(parsed.points);
        } catch {}
      }
    });
  }, []);

  const select = async (qId: string, optId: string, xp: number) => {
    if (answers[qId]) return;
    const next = { ...answers, [qId]: optId };
    const newPoints = points + xp;
    setAnswers(next);
    setPoints(newPoints);

    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    setXpFlash({ qId, visible: true });
    xpTimerRef.current = setTimeout(() => setXpFlash(null), 900);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: next, points: newPoints }));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Predictions</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Stay in it all match long
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="flash" size={14} color={colors.gold} />
              <Text style={[styles.statVal, { color: colors.gold }]}>{streak}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="trophy" size={14} color={colors.primary} />
              <Text style={[styles.statVal, { color: colors.primary }]}>{points}</Text>
            </View>
          </View>
        </View>

        {/* Live match context */}
        {liveMatch && (
          <View style={[styles.matchBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient
              colors={[liveMatch.homeColor + "22", "transparent", liveMatch.awayColor + "22"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
            <LiveBadge minute={matchMinute || undefined} />
            <View style={styles.matchBannerCenter}>
              <Text style={[styles.matchTeams, { color: colors.foreground }]}>
                <Text style={{ color: liveMatch.homeColor, fontFamily: "Inter_700Bold" }}>{home}</Text>
                {"  "}
                <Text style={{ color: colors.primary }}>{liveMatch.homeScore} – {liveMatch.awayScore}</Text>
                {"  "}
                <Text style={{ color: liveMatch.awayColor, fontFamily: "Inter_700Bold" }}>{away}</Text>
              </Text>
              <Text style={[styles.matchStage, { color: colors.mutedForeground }]}>{liveMatch.stage}</Text>
            </View>
            <View style={styles.timerBlock}>
              {timeRemaining !== null && timeRemaining > 0 ? (
                <>
                  <Text style={[styles.timerVal, { color: colors.foreground }]}>{timeRemaining}'</Text>
                  <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>LEFT</Text>
                </>
              ) : (
                <Text style={[styles.statVal, { color: colors.mutedForeground }]}>{answeredCount}/{QUESTIONS.length}</Text>
              )}
            </View>
          </View>
        )}

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <View
            style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(answeredCount / QUESTIONS.length) * 100}%` as any }]}
          />
        </View>

        {/* Questions */}
        <View style={styles.questions}>
          {QUESTIONS.map((q) => {
            const answered = !!answers[q.id];
            const flashVisible = xpFlash?.qId === q.id && xpFlash?.visible;
            return (
              <View
                key={q.id}
                style={[
                  styles.qCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: answered ? colors.primary + "55" : colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <XpFlash xp={q.xp} visible={!!flashVisible} />
                <View style={styles.qHeader}>
                  <View style={[styles.qIconWrap, { backgroundColor: (answered ? colors.primary : colors.mutedForeground) + "22" }]}>
                    <Ionicons name={q.icon as any} size={16} color={answered ? colors.primary : colors.mutedForeground} />
                  </View>
                  <Text style={[styles.qText, { color: colors.foreground }]}>{q.question}</Text>
                  {answered && (
                    <View style={[styles.xpBadge, { backgroundColor: colors.gold + "22" }]}>
                      <Text style={[styles.xpBadgeText, { color: colors.gold }]}>+{q.xp}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.optionsGrid}>
                  {q.options.map((opt) => (
                    <OptionBtn
                      key={opt.id}
                      label={opt.label}
                      selected={answers[q.id] === opt.id}
                      locked={answered && answers[q.id] !== opt.id}
                      pct={opt.pct}
                      onPress={() => select(q.id, opt.id, q.xp)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* All locked in */}
        {isLocked && (
          <View style={[styles.lockedCard, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
            <Ionicons name="lock-closed" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.lockedTitle, { color: colors.primary }]}>Predictions locked in</Text>
              <Text style={[styles.lockedSub, { color: colors.mutedForeground }]}>
                Results confirmed at final whistle
              </Text>
            </View>
            <Text style={[styles.lockedPoints, { color: colors.gold }]}>{points} XP</Text>
          </View>
        )}

        {/* Mini leaderboard */}
        <View style={styles.leaderSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LEADERBOARD</Text>
          {LEADERBOARD.map((p) => (
            <View key={p.rank} style={[styles.leaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.leaderRank, { color: p.rank === 1 ? colors.gold : colors.mutedForeground }]}>
                {p.rank}
              </Text>
              <Text style={[styles.leaderName, { color: colors.foreground }]}>{p.name}</Text>
              <View style={styles.leaderRight}>
                <Ionicons name="flash" size={11} color={colors.gold} />
                <Text style={[styles.leaderStreak, { color: colors.gold }]}>{p.streak}</Text>
                <Text style={[styles.leaderPts, { color: colors.primary }]}>{p.points.toLocaleString()} XP</Text>
              </View>
            </View>
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
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 15 },
  matchBanner: { marginHorizontal: 20, borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12, overflow: "hidden" },
  matchBannerCenter: { flex: 1 },
  matchTeams: { fontFamily: "Inter_500Medium", fontSize: 15 },
  matchStage: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  timerBlock: { alignItems: "center" },
  timerVal: { fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 24 },
  timerLabel: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 1 },
  progressTrack: { marginHorizontal: 20, height: 3, borderRadius: 2, marginBottom: 24, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  questions: { paddingHorizontal: 20, gap: 16 },
  qCard: { borderRadius: 16, padding: 18, gap: 14, overflow: "visible" },
  qHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  qIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  qText: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 16 },
  xpBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  xpBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10 },
  xpFlash: { fontFamily: "Inter_700Bold", fontSize: 16 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionPressable: { width: "47%" },
  option: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, gap: 8 },
  optionTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  check: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  optionLabel: { flex: 1, fontSize: 13 },
  pctTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  pctFill: { height: 3, borderRadius: 2 },
  pctText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  lockedCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  lockedTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  lockedSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  lockedPoints: { fontFamily: "Inter_700Bold", fontSize: 20 },
  leaderSection: { paddingHorizontal: 20, marginTop: 32 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.5, marginBottom: 14 },
  leaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, gap: 10 },
  leaderRank: { fontFamily: "Inter_700Bold", fontSize: 15, width: 22 },
  leaderName: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  leaderRight: { flexDirection: "row", alignItems: "center", gap: 5 },
  leaderStreak: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginRight: 6 },
  leaderPts: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
