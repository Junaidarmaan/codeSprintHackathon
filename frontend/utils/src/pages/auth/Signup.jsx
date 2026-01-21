import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import tokenStorage from "../../utils/storage";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// ✅ Teddy GIFs (keep them here: src/assets/teddy/)
import teddyIdle from "../../assets/teddy/idle.gif";
import teddyHappy from "../../assets/teddy/happy.gif";
import teddySad from "../../assets/teddy/sad.gif";
import teddyAngry from "../../assets/teddy/angry.gif";
import teddyConfused from "../../assets/teddy/confused.gif";

export default function Signup() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // 🧸 Teddy states
  const [teddyMood, setTeddyMood] = useState("idle");
  const [teddyText, setTeddyText] = useState(
    "Welcome 😄 Let’s create your account!"
  );

  // ✅ Validation
  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => password.length >= 6, [password]);

  const passwordMismatch = useMemo(() => {
    return confirmPassword.length > 0 && password !== confirmPassword;
  }, [password, confirmPassword]);

  // ✅ Teddy GIF pick
  const teddySrc = useMemo(() => {
    const map = {
      idle: teddyIdle,
      happy: teddyHappy,
      sad: teddySad,
      angry: teddyAngry,
      confused: teddyConfused,
    };
    return map[teddyMood] || teddyIdle;
  }, [teddyMood]);

  // ✅ Teddy brain
  useEffect(() => {
    // untouched state
    if (!fullName && !email && !password && !confirmPassword && !submitAttempted) {
      setTeddyMood("idle");
      setTeddyText("Welcome 😄 Let’s create your account!");
      return;
    }

    // if submit attempted and invalid -> angry
    if (submitAttempted) {
      if (!fullName.trim()) {
        setTeddyMood("angry");
        setTeddyText("Bro 😠 Tell me your name first!");
        return;
      }

      if (!email.trim() || !password || !confirmPassword) {
        setTeddyMood("angry");
        setTeddyText("Nope 😠 Fill all fields properly.");
        return;
      }

      if (!isEmailValid) {
        setTeddyMood("angry");
        setTeddyText("That email is wrong 😠 Fix it.");
        return;
      }

      if (!isPasswordValid) {
        setTeddyMood("angry");
        setTeddyText("Password too weak 😠 Make it stronger!");
        return;
      }

      if (passwordMismatch) {
        setTeddyMood("angry");
        setTeddyText("Passwords don’t match 😠");
        return;
      }
    }

    // invalid email -> confused
    if (email.length > 0 && !isEmailValid) {
      setTeddyMood("confused");
      setTeddyText("Hmm… this email looks suspicious 🤔");
      return;
    }

    // password too short -> sad
    if (password.length > 0 && !isPasswordValid) {
      setTeddyMood("sad");
      setTeddyText("Too short 😕 Use at least 6 characters.");
      return;
    }

    // mismatch -> angry (even before submit, it's a strong error)
    if (passwordMismatch) {
      setTeddyMood("angry");
      setTeddyText("Confirm password must match 😠");
      return;
    }

    // all good -> happy
    if (
      fullName.trim().length >= 2 &&
      isEmailValid &&
      isPasswordValid &&
      confirmPassword.length > 0 &&
      !passwordMismatch
    ) {
      setTeddyMood("happy");
      setTeddyText("Perfect 😄 Your account is ready!");
      return;
    }

    // typing fallback
    setTeddyMood("idle");
    setTeddyText("Keep going… ✍️");
  }, [
    fullName,
    email,
    password,
    confirmPassword,
    isEmailValid,
    isPasswordValid,
    passwordMismatch,
    submitAttempted,
  ]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!fullName.trim()) return;
    if (!email.trim() || !password || !confirmPassword) return;
    if (!isEmailValid) return;
    if (!isPasswordValid) return;
    if (passwordMismatch) return;
    try {

      const res = await authApi.signup({
        userName:fullName,
        email,
        password
      });
      console.log(JSON.stringify(res.data))

      if(res.data.success){
        setTeddyMood("happy");
        setTeddyText("Creating account… ✅");
        navigate("/login");
      }

    } catch (error) {
        setTeddyMood("sad");
        setTeddyText("login failed please try again");
    }

  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, sm: 6 },
        background:
          "radial-gradient(1200px circle at 10% 10%, rgba(91,95,199,0.25), transparent 60%), radial-gradient(900px circle at 90% 20%, rgba(34,197,94,0.18), transparent 55%)",
      }}
    >
      <Container maxWidth="md">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          alignItems="stretch"
        >
          {/* LEFT SIDE (Teddy Assistant) */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 1, sm: 2 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: { xs: 220, sm: 280, md: 320 },
                  height: { xs: 220, sm: 280, md: 320 },
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.03) inset",
                }}
              >
                <Box
                  component="img"
                  src={teddySrc}
                  alt="Teddy reaction"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              {/* Speech bubble */}
              <Box
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: "background.paper",
                  p: 2,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: 26,
                    width: 16,
                    height: 16,
                    transform: "rotate(45deg)",
                    backgroundColor: "background.paper",
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                />

                <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                  Teddy Assistant 🧸
                </Typography>

                <Typography color="text.secondary">{teddyText}</Typography>
              </Box>
            </Box>
          </Box>

          {/* RIGHT SIDE (Signup Card) */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Card
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: 460,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: "background.paper",
                boxShadow:
                  "0 8px 30px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.03) inset",
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={800}>
                  Sign up
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                  Enter your details to create an account.
                </Typography>

                <Box component="form" onSubmit={onSubmit}>
                  <Stack spacing={2.2}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setSubmitAttempted(false);
                      }}
                      autoComplete="name"
                      placeholder="Junaid"
                      error={submitAttempted && !fullName.trim()}
                      helperText={
                        submitAttempted && !fullName.trim()
                          ? "Name is required"
                          : " "
                      }
                    />

                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSubmitAttempted(false);
                      }}
                      autoComplete="email"
                      placeholder="junnu@example.com"
                      error={email.length > 0 && !isEmailValid}
                      helperText={
                        email.length > 0 && !isEmailValid
                          ? "Enter a valid email"
                          : " "
                      }
                    />

                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setSubmitAttempted(false);
                      }}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      error={password.length > 0 && password.length < 6}
                      helperText={
                        password.length > 0 && password.length < 6
                          ? "Password must be at least 6 characters"
                          : " "
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((s) => !s)}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? (
                                <VisibilityOffOutlinedIcon />
                              ) : (
                                <VisibilityOutlinedIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Confirm Password"
                      type={showConfirm ? "text" : "password"}
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setSubmitAttempted(false);
                      }}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      error={passwordMismatch}
                      helperText={
                        passwordMismatch ? "Passwords do not match" : " "
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirm((s) => !s)}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                            >
                              {showConfirm ? (
                                <VisibilityOffOutlinedIcon />
                              ) : (
                                <VisibilityOutlinedIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={
                        !fullName.trim() ||
                        !email.trim() ||
                        !password ||
                        !confirmPassword ||
                        !isEmailValid ||
                        !isPasswordValid ||
                        passwordMismatch
                      }
                      sx={{
                        py: 1.25,
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Create Account
                    </Button>

                    <Divider />

                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      sx={{ fontSize: "0.95rem" }}
                    >
                      Already have an account?{" "}
                      <Typography
                        component={Link}
                        to="/login"
                        sx={{
                          color: "primary.main",
                          fontWeight: 700,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Login
                      </Typography>
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
