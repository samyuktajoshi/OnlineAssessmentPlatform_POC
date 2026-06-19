import { useState } from "react";
import userApi from "../api/authApi";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  LinearProgress,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Candidate",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 20, label: "Weak", color: "#dc2626" };
    if (score <= 2) return { score: 40, label: "Fair", color: "#d97706" };
    if (score <= 3) return { score: 65, label: "Good", color: "#2563eb" };
    if (score <= 4) return { score: 85, label: "Strong", color: "#16a34a" };
    return { score: 100, label: "Very Strong", color: "#15803d" };
  };

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const temp = {};
    if (!form.username.trim()) temp.username = "Username is required";
    if (!form.email.trim()) temp.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) temp.email = "Enter a valid email";
    if (!form.password) temp.password = "Password is required";
    else if (form.password.length < 6) temp.password = "Min 6 characters";
    if (!form.confirmPassword) temp.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) temp.confirmPassword = "Passwords do not match";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await userApi.post("/auth/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setApiError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };

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
          background: "linear-gradient(160deg, #1454a7 0%, #1e5aa8 60%, #2a6fc4 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />

        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
            <MenuBookRoundedIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography fontWeight={700} fontSize={30} letterSpacing={0.3}>
            Online Assessment Platform
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight={1000} lineHeight={1.2} mb={1.5}>
          Join the Platform
        </Typography>

        <Box sx={{ width: 40, height: 3, bgcolor: "#93c5fd", borderRadius: 2, mb: 2 }} />

        <Typography sx={{ color: "#bfdbfe", fontSize: 13, mb: 3, maxWidth: 340, lineHeight: 1.6 }}>
          Create your account to take assessments, track progress, and manage evaluations.
        </Typography>

        <Stack spacing={2}>
          {[
            "Take timed assessments with auto-submit",
            "View detailed results with correct answers",
            "Track performance history and scores",
          ].map((text, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 17, color: "#86efac", flexShrink: 0 }} />
              <Typography sx={{ color: "#dbeafe", fontSize: 13 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* RIGHT — Register form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 3,
          py: 2,
          backgroundColor: "#f0f2f8",
          overflowY: "auto",
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 3 }}>
          <MenuBookRoundedIcon sx={{ color: "#0d447c", fontSize: 24 }} />
          <Typography fontWeight={700} fontSize={19} color="#0d447c">
            Assessment Platform
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 3,
            borderRadius: 3,
            border: "1px solid #e0e7ff",
            bgcolor: "white",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800} mb={0.3}>
              Create Account
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Fill in your details to get started
            </Typography>
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontSize: 12, py: 0.5 }}>
              {apiError}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 1.5, borderRadius: 2, fontSize: 12, py: 0.5 }}>
              Account created! Redirecting to login...
            </Alert>
          )}

          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            name="username"
            margin="dense"
            size="small"
            value={form.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            margin="dense"
            size="small"
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            margin="dense"
            size="small"
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword
                      ? <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />
                      : <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                    }
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Password strength */}
          {form.password && (
            <Box sx={{ mb: 0.5, mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={strength.score}
                sx={{
                  height: 3,
                  borderRadius: 2,
                  bgcolor: "#f0f2f8",
                  "& .MuiLinearProgress-bar": { bgcolor: strength.color, borderRadius: 2 },
                }}
              />
              <Typography fontSize={10} fontWeight={600} sx={{ color: strength.color, mt: 0.3 }}>
                {strength.label}
              </Typography>
            </Box>
          )}

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            margin="dense"
            size="small"
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} edge="end">
                    {showConfirm
                      ? <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />
                      : <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                    }
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Submit */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleRegister}
            disabled={loading || success}
            sx={{
              mt: 2,
              py: 1,
              background: "linear-gradient(135deg, #0d447c, #1e5aa8)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #0d447c, #1e5aa8)",
                boxShadow: "0 6px 20px rgba(13,68,124,0.3)",
              },
              "&:disabled": { opacity: 0.7 },
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Divider */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e7ff" }} />
            <Typography fontSize={11} color="text.disabled">OR</Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e7ff" }} />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/login")}
            sx={{
              py: 0.9,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              borderColor: "#e0e7ff",
              color: "#0d447c",
              "&:hover": { bgcolor: "#eef2ff", borderColor: "#2a5298" },
            }}
          >
            Already have an account? Sign In
          </Button>
        </Paper>

        <Typography fontSize={11} color="text.disabled" mt={2} textAlign="center">
          By registering, you agree to our Terms of Service
        </Typography>
      </Box>
    </Box>
  );
}

export default Register;