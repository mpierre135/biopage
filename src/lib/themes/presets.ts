import type { ThemeConfig } from "./types";

export type ThemePreset = {
  slug: string;
  name: string;
  category: "minimal" | "bold" | "elegant" | "dark" | "creative" | "nature";
  isPremium: boolean;
  config: ThemeConfig;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    slug: "clean-white",
    name: "Clean White",
    category: "minimal",
    isPremium: false,
    config: {
      background: { color: "#ffffff" },
      colors: { text: "#1e293b", textMuted: "#64748b", primary: "#6366f1" },
      buttons: { style: "filled", radius: "lg", backgroundColor: "#6366f1", textColor: "#ffffff" },
      cards: { backgroundColor: "#f8fafc", borderColor: "#e2e8f0", borderRadius: "12px" },
      layout: { containerMaxWidth: "28rem", blockGap: "12px" },
    },
  },
  {
    slug: "soft-gray",
    name: "Soft Gray",
    category: "minimal",
    isPremium: false,
    config: {
      background: { color: "#f1f5f9" },
      colors: { text: "#0f172a", textMuted: "#475569", primary: "#6366f1" },
      buttons: { style: "filled", radius: "md", backgroundColor: "#334155", textColor: "#ffffff" },
      cards: { backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" },
    },
  },
  {
    slug: "midnight",
    name: "Midnight",
    category: "dark",
    isPremium: false,
    config: {
      background: { color: "#0f172a" },
      colors: { text: "#f8fafc", textMuted: "#94a3b8", primary: "#818cf8" },
      buttons: { style: "filled", radius: "lg", backgroundColor: "#818cf8", textColor: "#0f172a" },
      cards: { backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px" },
    },
  },
  {
    slug: "dark-indigo",
    name: "Dark Indigo",
    category: "dark",
    isPremium: false,
    config: {
      background: { gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" },
      colors: { text: "#e0e7ff", textMuted: "#a5b4fc", primary: "#c7d2fe" },
      buttons: { style: "outlined", radius: "full", borderColor: "#a5b4fc", textColor: "#e0e7ff" },
      cards: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", borderRadius: "16px" },
    },
  },
  {
    slug: "ocean-breeze",
    name: "Ocean Breeze",
    category: "nature",
    isPremium: false,
    config: {
      background: { gradient: "linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)" },
      colors: { text: "#0c4a6e", textMuted: "#0369a1", primary: "#0284c7" },
      buttons: { style: "filled", radius: "full", backgroundColor: "#0284c7", textColor: "#ffffff" },
      cards: { backgroundColor: "#ffffff", borderColor: "#bae6fd", borderRadius: "16px", shadow: "0 1px 3px rgba(0,0,0,0.06)" },
    },
  },
  {
    slug: "sunset-glow",
    name: "Sunset Glow",
    category: "bold",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #fff7ed 100%)" },
      colors: { text: "#831843", textMuted: "#be185d", primary: "#e11d48" },
      buttons: { style: "filled", radius: "lg", backgroundColor: "#e11d48", textColor: "#ffffff" },
      cards: { backgroundColor: "rgba(255,255,255,0.7)", borderColor: "#fecdd3", borderRadius: "12px" },
    },
  },
  {
    slug: "forest",
    name: "Forest",
    category: "nature",
    isPremium: true,
    config: {
      background: { color: "#14532d" },
      colors: { text: "#dcfce7", textMuted: "#86efac", primary: "#4ade80" },
      buttons: { style: "filled", radius: "md", backgroundColor: "#22c55e", textColor: "#052e16" },
      cards: { backgroundColor: "#166534", borderColor: "#22c55e33", borderRadius: "8px" },
    },
  },
  {
    slug: "lavender-dream",
    name: "Lavender Dream",
    category: "elegant",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(180deg, #ede9fe 0%, #f5f3ff 100%)" },
      colors: { text: "#3b0764", textMuted: "#7c3aed", primary: "#8b5cf6" },
      buttons: { style: "soft", radius: "xl", backgroundColor: "#8b5cf620", textColor: "#7c3aed" },
      cards: { backgroundColor: "#ffffff", borderColor: "#ddd6fe", borderRadius: "16px" },
      typography: { family: "'Georgia', serif", headingWeight: 600 },
    },
  },
  {
    slug: "neon-nights",
    name: "Neon Nights",
    category: "bold",
    isPremium: true,
    config: {
      background: { color: "#09090b" },
      colors: { text: "#fafafa", textMuted: "#a1a1aa", primary: "#22d3ee" },
      buttons: { style: "outlined", radius: "md", borderColor: "#22d3ee", textColor: "#22d3ee" },
      cards: { backgroundColor: "#18181b", borderColor: "#22d3ee33", borderRadius: "8px", shadow: "0 0 20px rgba(34,211,238,0.1)" },
    },
  },
  {
    slug: "coral-reef",
    name: "Coral Reef",
    category: "creative",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fef3c7 100%)" },
      colors: { text: "#9f1239", textMuted: "#e11d48", primary: "#f43f5e" },
      buttons: { style: "filled", radius: "full", backgroundColor: "#f43f5e", textColor: "#ffffff" },
      cards: { backgroundColor: "rgba(255,255,255,0.8)", borderColor: "#fda4af", borderRadius: "24px" },
    },
  },
  {
    slug: "monochrome",
    name: "Monochrome",
    category: "minimal",
    isPremium: false,
    config: {
      background: { color: "#fafafa" },
      colors: { text: "#171717", textMuted: "#525252", primary: "#171717" },
      buttons: { style: "filled", radius: "none", backgroundColor: "#171717", textColor: "#fafafa" },
      cards: { backgroundColor: "#ffffff", borderColor: "#d4d4d4", borderRadius: "0px" },
    },
  },
  {
    slug: "rose-gold",
    name: "Rose Gold",
    category: "elegant",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(180deg, #fdf2f8 0%, #ffffff 100%)" },
      colors: { text: "#1c1917", textMuted: "#78716c", primary: "#be185d" },
      buttons: { style: "filled", radius: "lg", backgroundColor: "#be185d", textColor: "#ffffff" },
      cards: { backgroundColor: "#ffffff", borderColor: "#fecdd3", borderRadius: "12px" },
      typography: { family: "'Georgia', serif", headingWeight: 700 },
    },
  },
  {
    slug: "arctic",
    name: "Arctic",
    category: "minimal",
    isPremium: false,
    config: {
      background: { color: "#f0f9ff" },
      colors: { text: "#0c4a6e", textMuted: "#0369a1", primary: "#0ea5e9" },
      buttons: { style: "filled", radius: "lg", backgroundColor: "#0ea5e9", textColor: "#ffffff" },
      cards: { backgroundColor: "#ffffff", borderColor: "#bae6fd", borderRadius: "12px" },
    },
  },
  {
    slug: "cyber-punk",
    name: "Cyberpunk",
    category: "bold",
    isPremium: true,
    config: {
      background: { color: "#0a0a0a" },
      colors: { text: "#facc15", textMuted: "#a3a3a3", primary: "#facc15" },
      buttons: { style: "outlined", radius: "none", borderColor: "#facc15", textColor: "#facc15" },
      cards: { backgroundColor: "#171717", borderColor: "#facc1533", borderRadius: "0px" },
    },
  },
  {
    slug: "cherry-blossom",
    name: "Cherry Blossom",
    category: "creative",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(180deg, #fce7f3 0%, #fbcfe8 50%, #fdf2f8 100%)" },
      colors: { text: "#831843", textMuted: "#9d174d", primary: "#db2777" },
      buttons: { style: "filled", radius: "full", backgroundColor: "#db2777", textColor: "#ffffff" },
      cards: { backgroundColor: "rgba(255,255,255,0.6)", borderColor: "#f9a8d4", borderRadius: "20px" },
    },
  },
  {
    slug: "earth-tone",
    name: "Earth Tone",
    category: "nature",
    isPremium: true,
    config: {
      background: { color: "#fef3c7" },
      colors: { text: "#451a03", textMuted: "#92400e", primary: "#d97706" },
      buttons: { style: "filled", radius: "md", backgroundColor: "#d97706", textColor: "#ffffff" },
      cards: { backgroundColor: "#fffbeb", borderColor: "#fde68a", borderRadius: "8px" },
    },
  },
  {
    slug: "glass-dark",
    name: "Glass Dark",
    category: "dark",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" },
      colors: { text: "#f1f5f9", textMuted: "#94a3b8", primary: "#38bdf8" },
      buttons: { style: "ghost", radius: "lg", textColor: "#38bdf8" },
      cards: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "16px", shadow: "0 8px 32px rgba(0,0,0,0.3)" },
    },
  },
  {
    slug: "studio-minimal",
    name: "Studio Minimal",
    category: "elegant",
    isPremium: false,
    config: {
      background: { color: "#fafaf9" },
      colors: { text: "#1c1917", textMuted: "#57534e", primary: "#1c1917" },
      buttons: { style: "outlined", radius: "sm", borderColor: "#1c1917", textColor: "#1c1917" },
      cards: { backgroundColor: "#ffffff", borderColor: "#e7e5e4", borderRadius: "4px" },
      typography: { family: "'Georgia', serif", headingWeight: 400, baseSize: "15px" },
    },
  },
  {
    slug: "electric-violet",
    name: "Electric Violet",
    category: "bold",
    isPremium: true,
    config: {
      background: { gradient: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)" },
      colors: { text: "#f5f3ff", textMuted: "#c4b5fd", primary: "#a78bfa" },
      buttons: { style: "filled", radius: "full", backgroundColor: "#a78bfa", textColor: "#1e1b4b" },
      cards: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(167,139,250,0.3)", borderRadius: "20px" },
    },
  },
  {
    slug: "warm-sand",
    name: "Warm Sand",
    category: "nature",
    isPremium: false,
    config: {
      background: { color: "#faf5ef" },
      colors: { text: "#292524", textMuted: "#78716c", primary: "#a16207" },
      buttons: { style: "filled", radius: "lg", backgroundColor: "#a16207", textColor: "#ffffff" },
      cards: { backgroundColor: "#ffffff", borderColor: "#e7e5e4", borderRadius: "12px" },
    },
  },
];
