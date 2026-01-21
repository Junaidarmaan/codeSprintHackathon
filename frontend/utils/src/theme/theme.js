import { createTheme } from "@mui/material/styles";

/**
 * ===============================
 * 🎨 COLOR PALETTES
 * ===============================
 * Switch theme by changing `ACTIVE_THEME`
 */

const THEMES = {
  // 1️⃣ Deep Indigo (Professional / SaaS / Hackathons)
  indigoDark: {
    name: "Indigo Dark",
    palette: {
      mode: "dark",

      primary: {
        main: "#5B5FC7", // buttons, links, highlights
      },
      secondary: {
        main: "#22C55E", // success, confirmations
      },

      background: {
        default: "#0B0F19", // app background
        paper: "#111827", // cards, modals
      },

      text: {
        primary: "#E5E7EB", // main text
        secondary: "#9CA3AF", // helper / muted text
      },
    },
  },

  // 2️⃣ Emerald Night (Fresh / Health / Finance / Clean UI)
  emeraldDark: {
    name: "Emerald Night",
    palette: {
      mode: "dark",

      primary: {
        main: "#10B981", // calm green actions
      },
      secondary: {
        main: "#38BDF8", // info / links
      },

      background: {
        default: "#020617", // very dark blue-black
        paper: "#020617", // flat, minimal cards
      },

      text: {
        primary: "#ECFEFF", // crisp white text
        secondary: "#94A3B8", // subtle guidance text
      },
    },
  },

  // 3️⃣ Rose Noir (Creative / AI / Portfolio / Bold products)
  roseDark: {
    name: "Rose Noir",
    palette: {
      mode: "dark",

      primary: {
        main: "#F43F5E", // bold CTA, warnings
      },
      secondary: {
        main: "#A855F7", // accents, tags
      },

      background: {
        default: "#09090B", // near-black
        paper: "#18181B", // elevated surfaces
      },

      text: {
        primary: "#FAFAFA", // strong contrast text
        secondary: "#A1A1AA", // muted descriptions
      },
    },
  },

  // 4️⃣ Ocean Slate (Enterprise / Dashboards / Serious tools)
  oceanDark: {
    name: "Ocean Slate",
    palette: {
      mode: "dark",

      primary: {
        main: "#6366F1", // subtle purple accents
      },
      secondary: {
        main: "#0EA5E9", // clean blue actions
      },

      background: {
        default: "#020617", // deep slate
        paper: "#0F172A", // card background
      },

      text: {
        primary: "#E2E8F0", // dashboard text
        secondary: "#94A3B8", // labels, metadata
      },
    },
  },
};

/**
 * ===============================
 * 🔁 ACTIVE THEME (CHANGE THIS)
 * ===============================
 * Options:
 * - "indigoDark"
 * - "emeraldDark"
 * - "roseDark"
 * - "oceanDark"
 */
const ACTIVE_THEME = "oceanDark";

/**
 * ===============================
 * 🧱 CREATE FINAL THEME
 * ===============================
 */

const theme = createTheme({
  ...THEMES[ACTIVE_THEME],

  shape: {
    borderRadius: 12, // consistent rounding across app
  },

  typography: {
    fontFamily:
      "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});

export default theme;
