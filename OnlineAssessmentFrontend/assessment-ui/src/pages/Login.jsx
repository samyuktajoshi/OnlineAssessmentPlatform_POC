import { useState } from "react";
import userApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import { Box, TextField, Button, Typography, Paper, Alert, InputAdornment, IconButton, Stack } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!user.username.trim() || !user.password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await userApi.post("/auth/login", user);
      const token = res.data.token;
      const userData = getUserFromToken(token);
      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.role === "Admin") navigate("/admin");
      else navigate("/candidate-home");

    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const features = [
    { icon: <AssignmentRoundedIcon sx={{ fontSize: 20 }} />, text: "Take timed assessments" },
    { icon: <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />, text: "Track your scores and rankings" },
    { icon: <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />, text: "Monitor your performance" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      {/* LEFT — Brand panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          px: 7,
          background: "linear-gradient(160deg, #0d447c 0%, #1e5aa8 60%, #2a6fc4 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />

        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 6 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
            <MenuBookRoundedIcon sx={{ fontSize: 22, color: "white" }} />
          </Box>
          <Typography fontWeight={700} fontSize={18} letterSpacing={0.3}>
            Assessment Platform
          </Typography>
        </Box>

        <Typography variant="h3" fontWeight={800} lineHeight={1.2} mb={2}>
          WelcomeBack
        </Typography>

        <Box sx={{ width: 48, height: 4, bgcolor: "#93c5fd", borderRadius: 2, mb: 3 }} />

        <Typography sx={{ color: "#bfdbfe", fontSize: 16, mb: 5, maxWidth: 380, lineHeight: 1.7 }}>
          Login to continue your assessments and track your performance across all topics.
        </Typography>

        {/* Feature list */}
        <Stack spacing={2}>
          {features.map((f, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {f.icon}
              </Box>
              <Typography sx={{ color: "#dbeafe", fontSize: 14, fontWeight: 500 }}>
                {f.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* RIGHT — Login form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 3,
          backgroundColor: "#f0f2f8",
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
          <MenuBookRoundedIcon sx={{ color: "#0d447c", fontSize: 28 }} />
          <Typography fontWeight={700} fontSize={18} color="#0d447c">
            Assessment Platform
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: 3,
            border: "1px solid #e0e7ff",
            bgcolor: "white",
          }}
        >
          {/* Form header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={800} mb={0.5}>
              Sign In
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              Enter your credentials to access your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>
              {error}
            </Alert>
          )}

          {/* Username */}
          <TextField
            fullWidth
            label="Username / Email"
            name="username"
            margin="normal"
            value={user.username}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            margin="normal"
            value={user.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword
                      ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                      : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                    }
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Login button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.4,
              background: "linear-gradient(135deg, #0d447c, #1e5aa8)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #0d447c, #1e5aa8)",
                boxShadow: "0 6px 20px rgba(13,68,124,0.35)",
              },
              "&:disabled": { opacity: 0.7 },
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Divider */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e7ff" }} />
            <Typography fontSize={12} color="text.disabled">OR</Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e7ff" }} />
          </Box>

          {/* Register link */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/register")}
            sx={{
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              borderColor: "#e0e7ff",
              color: "#0d447c",
              "&:hover": { bgcolor: "#eef2ff", borderColor: "#2a5298" },
            }}
          >
            Create New Account
          </Button>
        </Paper>

        <Typography fontSize={12} color="text.disabled" mt={3} textAlign="center">
          By signing in, you agree to our Terms of Service
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;