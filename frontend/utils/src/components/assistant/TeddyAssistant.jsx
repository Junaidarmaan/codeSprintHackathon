import React from "react";
import { Box, Typography, Fade, Slide } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useTeddy } from "../../context/TeddyContext";

// Teddy GIF imports
import happy from "../../assets/teddy/happy.gif";
import sad from "../../assets/teddy/sad.gif";
import angry from "../../assets/teddy/angry.gif";
import confused from "../../assets/teddy/confused.gif";
import idle from "../../assets/teddy/idle.gif";

// emotion → gif map
const teddyMap = {
  happy,
  sad,
  angry,
  confused,
  idle,
};

const TeddyAssistant = () => {
  const theme = useTheme();
  const { visible, emotion, message } = useTeddy();

  const teddySrc = teddyMap[emotion] || idle;

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: 40,
          left: 40,
          display: "flex",
          flexDirection: "row", // Teddy on left, text on right
          alignItems: "flex-end",
          gap: 1,
          zIndex: 1300,
          pointerEvents: "none",
          width: "auto",
        }}
      >
        {/* Teddy */}
        <Box
          component="img"
          src={teddySrc}
          alt="Cloud Teddy Assistant"
          sx={{
            width: { xs: 120, sm: 160, md: 180 },
            height: "auto",
            objectFit: "contain",
            filter: `drop-shadow(0px 8px 16px ${alpha(
              theme.palette.common.black,
              0.4
            )})`,
          }}
        />

        {/* Speech Bubble */}
        <Fade in={visible}>
          <Box
            sx={{
              position: "relative",
              padding: "12px 16px",
              borderRadius: 3,
              maxWidth: "320px",

              // 🌙 Theme-driven glass effect
              backgroundColor: alpha(
                theme.palette.background.paper,
                0.85
              ),
              backdropFilter: "blur(12px)",

              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[6],
            }}
          >
            {/* Bubble Tail */}
            <Box
              sx={{
                position: "absolute",
                left: -8,
                bottom: 24, // Tail at the bottom side to match flex-end alignment
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: `8px solid ${alpha(
                  theme.palette.background.paper,
                  0.85
                )}`,
              }}
            />

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                lineHeight: 1.4,
                color: theme.palette.text.primary,
              }}
            >
              {message}
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Slide>
  );
};

export default TeddyAssistant;
