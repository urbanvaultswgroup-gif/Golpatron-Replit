import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { TEAM_THEMES, TeamCode, useTheme } from "@/contexts/ThemeContext";

const ALL_TEAMS = Object.entries(TEAM_THEMES).map(([code, t]) => ({
  code: code as TeamCode,
  ...t,
}));

interface Props {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: Props) {
  const colors = useColors();
  const { teamCode, theme, setTeam } = useTheme();
  const [step, setStep] = useState(0);

  const handleSelectTeam = (code: TeamCode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTeam(code);
  };

  const handleContinue = () => {
    if (step === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {step === 0 ? (
          <>
            <LinearGradient
              colors={[theme.gradientColors[0] + "55", colors.background]}
              style={styles.heroGrad}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + "22" }]}>
                <Ionicons name="football" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.headline, { color: colors.foreground }]}>Choose Your Nation</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Your nation sets your lounge, theme, and prediction squad for the whole tournament.
              </Text>
            </LinearGradient>

            <ScrollView
              contentContainerStyle={styles.teamGrid}
              showsVerticalScrollIndicator={false}
            >
              {ALL_TEAMS.map((t) => {
                const active = t.code === teamCode;
                return (
                  <Pressable key={t.code} onPress={() => handleSelectTeam(t.code)}>
                    <View
                      style={[
                        styles.teamCard,
                        {
                          borderColor: active ? t.primary : colors.border,
                          borderWidth: active ? 2 : 1,
                          backgroundColor: active ? t.primary + "18" : colors.card,
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={t.gradientColors}
                        style={styles.teamGrad}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 0.8, y: 1 }}
                      >
                        <Text style={styles.teamCode}>{t.code}</Text>
                      </LinearGradient>
                      <Text
                        style={[
                          styles.teamName,
                          { color: active ? t.primary : colors.foreground, fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular" },
                        ]}
                        numberOfLines={1}
                      >
                        {t.name}
                      </Text>
                      {active && (
                        <View style={[styles.activePin, { backgroundColor: t.primary }]}>
                          <Ionicons name="checkmark" size={8} color="#FFF" />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={handleContinue}
                style={[styles.ctaBtn, { backgroundColor: theme.teamColor }]}
              >
                <Text style={styles.ctaText}>Continue with {theme.name}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.confirmWrap}>
            <LinearGradient
              colors={[theme.gradientColors[0] + "77", theme.gradientColors[1] + "33", colors.background]}
              style={styles.confirmGrad}
            >
              <LinearGradient
                colors={theme.gradientColors}
                style={styles.bigBubble}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
              >
                <Text style={styles.bigBubbleCode}>{teamCode}</Text>
              </LinearGradient>
              <Text style={[styles.headline, { color: colors.foreground }]}>
                {theme.name} Lounge Unlocked
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                You're now part of the {theme.name} supporter community. Make predictions, earn XP, and celebrate every goal together.
              </Text>
            </LinearGradient>

            <View style={styles.perksRow}>
              {[
                { icon: "flash", label: "Live Predictions", sub: "Earn XP every match" },
                { icon: "people", label: "Fan Lounge", sub: "React with your nation" },
                { icon: "trophy", label: "Rankings", sub: "Climb the leaderboard" },
              ].map((p) => (
                <View
                  key={p.icon}
                  style={[styles.perkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Ionicons name={p.icon as any} size={22} color={colors.primary} />
                  <Text style={[styles.perkLabel, { color: colors.foreground }]}>{p.label}</Text>
                  <Text style={[styles.perkSub, { color: colors.mutedForeground }]}>{p.sub}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={handleContinue}
                style={[styles.ctaBtn, { backgroundColor: theme.teamColor }]}
              >
                <Text style={styles.ctaText}>Let's Go</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const IOS_TOP = Platform.OS === "ios" ? 80 : 56;

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroGrad: {
    paddingTop: IOS_TOP,
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
  headline: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.4, textAlign: "center", marginTop: 4 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
  teamGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, paddingBottom: 20 },
  teamCard: { width: 86, borderRadius: 14, padding: 10, alignItems: "center", gap: 6, position: "relative" },
  teamGrad: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  teamCode: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FFF", letterSpacing: 0.5 },
  teamName: { fontSize: 10, textAlign: "center" },
  activePin: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  footer: { paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 44 : 24, paddingTop: 14, borderTopWidth: 1 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, gap: 8 },
  ctaText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFF" },
  confirmWrap: { flex: 1 },
  confirmGrad: { alignItems: "center", paddingTop: IOS_TOP + 20, paddingHorizontal: 28, paddingBottom: 36, gap: 16 },
  bigBubble: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  bigBubbleCode: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFF", letterSpacing: 1.5 },
  perksRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, flex: 1, alignItems: "flex-start", paddingTop: 8 },
  perkCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 8, alignItems: "center" },
  perkLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, textAlign: "center" },
  perkSub: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center", lineHeight: 14 },
});
