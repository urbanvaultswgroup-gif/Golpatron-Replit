import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export const TEAM_THEMES = {
  MEX: {
    name: "Mexico",
    primary: "#006847",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#006847", "#CE1126"] as [string, string],
    teamColor: "#006847",
  },
  BRA: {
    name: "Brazil",
    primary: "#009C3B",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#009C3B", "#FEDF00"] as [string, string],
    teamColor: "#009C3B",
  },
  ARG: {
    name: "Argentina",
    primary: "#4B9CD3",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#4B9CD3", "#FFFFFF"] as [string, string],
    teamColor: "#4B9CD3",
  },
  FRA: {
    name: "France",
    primary: "#0055A4",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#0055A4", "#ED2939"] as [string, string],
    teamColor: "#0055A4",
  },
  ESP: {
    name: "Spain",
    primary: "#C60B1E",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#C60B1E", "#F1BF00"] as [string, string],
    teamColor: "#C60B1E",
  },
  ENG: {
    name: "England",
    primary: "#CF091D",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#CF091D", "#00247D"] as [string, string],
    teamColor: "#CF091D",
  },
  POR: {
    name: "Portugal",
    primary: "#006600",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#006600", "#FF0000"] as [string, string],
    teamColor: "#006600",
  },
  GER: {
    name: "Germany",
    primary: "#DD0000",
    primaryForeground: "#FFFFFF",
    gradientColors: ["#DD0000", "#FFCE00"] as [string, string],
    teamColor: "#DD0000",
  },
} as const;

export type TeamCode = keyof typeof TEAM_THEMES;

interface ThemeContextType {
  teamCode: TeamCode;
  theme: (typeof TEAM_THEMES)[TeamCode];
  setTeam: (code: TeamCode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  teamCode: "MEX",
  theme: TEAM_THEMES.MEX,
  setTeam: async () => {},
});

const STORAGE_KEY = "golpatron_team";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [teamCode, setTeamCode] = useState<TeamCode>("MEX");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in TEAM_THEMES) {
        setTeamCode(stored as TeamCode);
      }
    });
  }, []);

  const setTeam = async (code: TeamCode) => {
    setTeamCode(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
  };

  return (
    <ThemeContext.Provider
      value={{ teamCode, theme: TEAM_THEMES[teamCode], setTeam }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
