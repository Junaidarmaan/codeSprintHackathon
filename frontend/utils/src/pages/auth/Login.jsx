import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useTeddy } from "../../context/TeddyContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
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






export default function Login() {
  const { isAuthenticated, login, loading } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  console.log("Authenticated?", isAuthenticated);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showTeddy, hideTeddy } = useTeddy()
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ✅ Validation helpers
  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => password.length >= 6, [password]);

  useEffect(() => {
    showTeddy({
      message: "ready to log you in ......",
      emotion: "idle",
    });

    return () => hideTeddy(); // cleanup when leaving page
  }, []);
  useEffect(() => {
    // 1. If we just started or everything is empty -> Idle
    if (!email && !password && !submitAttempted) {
      showTeddy({
        message: "ready to log you in ......",
        emotion: "idle",
      });
      return;
    }

    // 2. Handle submissions errors (Highest priority)
    if (submitAttempted) {
      if (!email || !password) {
        showTeddy({
          message: "hmm.. you need to fill all mandatory entries",
          emotion: "angry"
        });
        return;
      }
      if (!isEmailValid || !isPasswordValid) {
        showTeddy({
          message: "kindly please correct the errors above",
          emotion: "sad"
        });
        return;
      }
    }

    // 3. Typing state feedback
    if (email.length > 0 && !isEmailValid) {
      showTeddy({
        message: "hmmm... that doesn't look like a valid email yet",
        emotion: "confused"
      });
    } else if (password.length > 0 && !isPasswordValid) {
      showTeddy({
        message: "your password is a bit too short",
        emotion: "sad"
      });
    } else if (isEmailValid && isPasswordValid) {
      showTeddy({
        message: "looking good! ready to submit?",
        emotion: "happy"
      });
    } else {
      showTeddy({
        message: "great, keep going...",
        emotion: "idle"
      });
    }
  }, [email, password, isEmailValid, isPasswordValid, submitAttempted, showTeddy]);
  if (loading) {
    return null;
  }
  if (isAuthenticated) {
    // return <Navigate to="/dashboard" replace />;
    window.location.href = "https://panpsychistic-fae-irrepressibly.ngrok-free.dev/";

  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // ✅ basic frontend validation
    if (!email || !password) return;
    if (!isEmailValid) return;
    if (!isPasswordValid) return;
    const res = await authApi.login({
      email, password
    })

    if (res.data.success) {
      showTeddy({
        message: res.data.message || "successfully verified your credentials",
        emotion: "happy"
      })
      login(res.data.token)
      setTimeout(() => {
        // navigate("/dashboard")
        window.location.href = "https://panpsychistic-fae-irrepressibly.ngrok-free.dev/";

        hideTeddy()
      }, 1500) // Give user time to see the success message
    } else {
      showTeddy({
        message: res.data.message || "failed to verify your credentials please check again",
        emotion: "angry"
      })
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

          {/* RIGHT SIDE (Login Form) */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Card
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: 430,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: "background.paper",
                boxShadow:
                  "0 8px 30px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.03) inset",
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={800}>
                  Sign in
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                  Enter your email and password to continue.
                </Typography>

                <Box component="form" onSubmit={onSubmit}>
                  <Stack spacing={2.2}>
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
                      autoComplete="current-password"
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

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                      sx={{ flexWrap: "wrap" }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                        }
                        label="Remember me"
                      />

                      <Typography
                        component="button"
                        type="button"
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: "pointer",
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                        onClick={() => alert("Forgot password - add later")}
                      >
                        Forgot password?
                      </Typography>
                    </Stack>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        py: 1.25,
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Login
                    </Button>

                    <Divider />

                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      sx={{ fontSize: "0.95rem" }}
                    >
                      New here?{" "}
                      <Typography
                        component={Link}
                        to="/signup"
                        sx={{
                          color: "primary.main",
                          fontWeight: 700,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Create account
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
