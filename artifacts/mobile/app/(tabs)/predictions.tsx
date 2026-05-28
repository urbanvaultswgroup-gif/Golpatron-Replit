import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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

const LIVE_MATCH = {
  home: "BRA",
  away: "ARG",
  homeScore: 1,
  awayScore: 0,
  minute: 67,
  stage: "Quarter-Final",
};

interface Question {
  id: string;
  question: string;
  icon: string;
  options: { id: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "next_goal",
    question: "Who scores next?",
    icon: "football",
    options: [
      { id: "mbappe", label: "Mbappe" },
      { id: "neymar", label: "Neymar Jr" },
      { id: "messi", label: "Messi" },
      { id: "vinicius", label: "Vinicius Jr" },
    ],
  },
  {
    id: "final_score",
    question: "Final score?",
    icon: "timer",
    options: [
      { id: "2-0", label: "2 - 0" },
      { id: "1-1", label: "1 - 1" },
      { id: "2-1", label: "2 - 1" },
      { id: "3-0", label: "3 - 0" },
    ],
  },
  {
    id: "mvp",
    question: "Match MVP?",
    icon: "star",
    options: [
      { id: "mbappe", label: "Mbappe" },
      { id: "vinicius", label: "Vinicius Jr" },
      { id: "bellingham", label: "Bellingham" },
      { id: "modric", label: "Modric" },
    ],
  },
  {
    id: "next_card",
    question: "Next yellow card?",
    icon: "card",
    options: [
      { id: "lt10", label: "< 10 min" },
      { id: "10-20", label: "10–20 min" },
      { id: "gt20", label: "20+ min" },
      { id: "none", label: "None" },
    ],
  },
];

const STORAGE_KEY = "golpatron_predictions";

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.optionPressable}>
      <Animated.View
        style={[
          styles.option,
          animStyle,
          {
            backgroundColor: selected ? colors.primary + "22" : colors.card,
            borderColor: selected ? colors.primary : colors.border,
            borderWidth: selected ? 1.5 : 1,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.optionCheck,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="checkmark" size={10} color="#000" />
          </View>
        )}
        <Text
          style={[
            styles.optionLabel,
            {
              color: selected ? colors.primary : colors.foreground,
              fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular",
            },
          ]}
        >
          {label}
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
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(3);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setAnswers(parsed.answers ?? {});
          setPoints(parsed.points ?? 0);
          setStreak(parsed.streak ?? 3);
        } catch {}
      }
    });
  }, []);

  const select = async (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers: next, points, streak })
    );
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 120 : 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Predictions
            </Text>
            <Text
              style={[styles.headerSub, { color: colors.mutedForeground }]}
            >
              Stay in it all match long
            </Text>
          </View>
          {/* Points + Streak */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons name="flash" size={14} color={colors.gold} />
              <Text style={[styles.statVal, { color: colors.gold }]}>
                {streak}
              </Text>
            </View>
            <View
              style={[
                styles.statChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons name="trophy" size={14} color={colors.primary} />
              <Text style={[styles.statVal, { color: colors.primary }]}>
                {points}
              </Text>
            </View>
          </View>
        </View>

        {/* Live match context */}
        <View
          style={[
            styles.matchContext,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <LiveBadge minute={LIVE_MATCH.minute} />
          <View style={styles.matchContextCenter}>
            <Text
              style={[styles.matchContextTeams, { color: colors.foreground }]}
            >
              {LIVE_MATCH.home}{" "}
              <Text style={{ color: colors.primary }}>
                {LIVE_MATCH.homeScore} – {LIVE_MATCH.awayScore}
              </Text>{" "}
              {LIVE_MATCH.away}
            </Text>
            <Text
              style={[
                styles.matchContextStage,
                { color: colors.mutedForeground },
              ]}
            >
              {LIVE_MATCH.stage}
            </Text>
          </View>
          <Text
            style={[
              styles.matchContextAnswered,
              { color: colors.mutedForeground },
            ]}
          >
            {answeredCount}/{QUESTIONS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.secondary },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${(answeredCount / QUESTIONS.length) * 100}%` as any,
              },
            ]}
          />
        </View>

        {/* Questions */}
        <View style={styles.questions}>
          {QUESTIONS.map((q) => (
            <View
              key={q.id}
              style={[
                styles.questionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: answers[q.id]
                    ? colors.primary + "44"
                    : colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.questionHeader}>
                <Ionicons
                  name={q.icon as any}
                  size={18}
                  color={answers[q.id] ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.questionText,
                    { color: colors.foreground },
                  ]}
                >
                  {q.question}
                </Text>
              </View>
              <View style={styles.optionsGrid}>
                {q.options.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    label={opt.label}
                    selected={answers[q.id] === opt.id}
                    onPress={() => select(q.id, opt.id)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Nudge */}
        {answeredCount === QUESTIONS.length && (
          <View
            style={[
              styles.allDoneCard,
              { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" },
            ]}
          >
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            <Text style={[styles.allDoneText, { color: colors.primary }]}>
              All predictions locked in. Good luck!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  matchContext: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  matchContextCenter: { flex: 1 },
  matchContextTeams: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  matchContextStage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  matchContextAnswered: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  progressBar: {
    marginHorizontal: 20,
    height: 3,
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  questions: {
    paddingHorizontal: 20,
    gap: 16,
  },
  questionCard: {
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  questionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionPressable: {
    width: "47%",
  },
  option: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 48,
  },
  optionCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  allDoneCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  allDoneText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
});
