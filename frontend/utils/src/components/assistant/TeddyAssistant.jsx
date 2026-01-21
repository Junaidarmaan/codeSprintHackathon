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
    <Slide direction="down" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          top: 20,
          left: "5%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          zIndex: 1300,
          pointerEvents: "none",
        }}
      >
        {/* Teddy */}
        <Box
          component="img"
          src={teddySrc}
          alt="Cloud Teddy Assistant"
          sx={{
            width: 200,
            height: 200,
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
                top: 24,
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
