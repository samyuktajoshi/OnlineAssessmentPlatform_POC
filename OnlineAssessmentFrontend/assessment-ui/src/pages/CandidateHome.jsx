import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
  Fab,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";

import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimerIcon from "@mui/icons-material/Timer";
import SchoolIcon from "@mui/icons-material/School";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

// ✅ Update this to your ChatBotService port
const CHATBOT_URL = "https://localhost:7296/api/chat";

function CandidateHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your AI assistant. Ask me anything about coding or assessments 👋" }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?";

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setThinking(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        CHATBOT_URL,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reply = res.data?.reply || res.data?.response || res.data || "No response";
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: "Sorry, I couldn't reach the AI right now." }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Typography>Please login</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f2f8" }}>

      {/* HERO */}
      <Box sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", px: 3, py: 3, color: "white" }}>
        <Box maxWidth={1000} mx="auto" display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(255,255,255,0.2)", fontWeight: 700, border: "2px solid rgba(255,255,255,0.4)" }}>
            {getInitials(user.username)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome back, {user.username}
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Ready to continue learning?
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* CONTENT */}
      <Box maxWidth={1000} mx="auto" px={3} py={4}>

        {/* HIGHLIGHTS */}
        <Typography fontWeight={600} mb={2}>Highlights</Typography>
        <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1, mb: 4, "&::-webkit-scrollbar": { display: "none" } }}>
          {[
            { icon: <TrendingUpIcon />, text: "Track your performance growth" },
            { icon: <TimerIcon />, text: "Timed assessments simulate real exams" },
            { icon: <SchoolIcon />, text: "Improve skills with every attempt" },
          ].map((item, index) => (
            <Card key={index} sx={{ minWidth: 220, borderRadius: 3, flexShrink: 0 }}>
              <CardContent>
                <Avatar sx={{ bgcolor: "#1e3c72", mb: 1, width: 40, height: 40 }}>{item.icon}</Avatar>
                <Typography fontSize={14}>{item.text}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Typography variant="h6" fontWeight={600} mb={3}>What would you like to do?</Typography>

        <Stack spacing={3}>
          {/* Take Assessment */}
          <Card sx={{ borderRadius: 3, transition: "0.2s", "&:hover": { boxShadow: "0 8px 24px rgba(30,60,114,0.12)", transform: "translateY(-2px)" } }}>
            <CardContent sx={{ p: 3, display: "flex", gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: "#1e3c72", width: 52, height: 52 }}>
                <AssignmentIcon />
              </Avatar>
              <Box flex={1}>
                <Typography fontWeight={700}>Take Assessment</Typography>
                <Typography fontSize={14} color="text.secondary" mb={2}>
                  Browse available assessments and start a timed test.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/assessments")} sx={{ textTransform: "none", fontWeight: 600 }}>
                  Browse Assessments →
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* My Results */}
          <Card sx={{ borderRadius: 3, transition: "0.2s", "&:hover": { boxShadow: "0 8px 24px rgba(46,125,50,0.1)", transform: "translateY(-2px)" } }}>
            <CardContent sx={{ p: 3, display: "flex", gap: 2 }}>
              <Avatar variant="rounded" sx={{ bgcolor: "#2e7d32", width: 52, height: 52 }}>
                <BarChartIcon />
              </Avatar>
              <Box flex={1}>
                <Typography fontWeight={700}>My Results</Typography>
                <Typography fontSize={14} color="text.secondary" mb={2}>
                  Review your scores and performance history.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/my-results")} sx={{ backgroundColor: "#2e7d32", textTransform: "none", fontWeight: 600 }}>
                  View Results →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Divider sx={{ my: 4 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, borderRadius: 2, backgroundColor: "#fff8e1", border: "1px solid #ffe082" }}>
          <EmojiEventsIcon sx={{ color: "#f9a825" }} />
          <Typography fontSize={14}>
            <strong>Tip:</strong> Regular practice leads to better assessment performance.
          </Typography>
        </Box>
      </Box>

      {/* ── FLOATING CHAT BUTTON ── */}
      <Fab
        onClick={() => setChatOpen((prev) => !prev)}
        sx={{
          position: "fixed",
          bottom: 28,
          right: 28,
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "white",
          width: 56,
          height: 56,
          boxShadow: "0 4px 20px rgba(30,60,114,0.4)",
          "&:hover": { background: "linear-gradient(135deg, #1e3c72, #2a5298)", opacity: 0.9 },
          zIndex: 1300,
        }}
      >
        {chatOpen
          ? <CloseRoundedIcon />
          : <SmartToyRoundedIcon />
        }
      </Fab>

      {/* ── CHAT WINDOW ── */}
      {chatOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 96,
            right: 28,
            width: 360,
            height: 480,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1300,
            border: "1px solid #e0e7ff",
          }}
        >
          {/* Chat header */}
          <Box sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", px: 2.5, py: 1.8, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(255,255,255,0.2)" }}>
              <SmartToyRoundedIcon sx={{ fontSize: 18, color: "white" }} />
            </Avatar>
            <Box flex={1}>
              <Typography color="white" fontWeight={700} fontSize={14}>AI Assistant</Typography>
              <Typography color="rgba(255,255,255,0.7)" fontSize={11}>Powered by Gemini</Typography>
            </Box>
            <IconButton size="small" onClick={() => setChatOpen(false)} sx={{ color: "rgba(255,255,255,0.8)" }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f8f9ff", display: "flex", flexDirection: "column", gap: 1.5 }}
            ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                  gap: 1,
                  alignItems: "flex-end",
                }}
              >
                {msg.from === "bot" && (
                  <Avatar sx={{ width: 26, height: 26, bgcolor: "#1e3c72", flexShrink: 0 }}>
                    <SmartToyRoundedIcon sx={{ fontSize: 14, color: "white" }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "78%",
                    px: 1.8,
                    py: 1,
                    borderRadius: msg.from === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    bgcolor: msg.from === "user" ? "#1e3c72" : "white",
                    color: msg.from === "user" ? "white" : "text.primary",
                    fontSize: 13,
                    lineHeight: 1.6,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    border: msg.from === "bot" ? "1px solid #e0e7ff" : "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}

            {/* Thinking indicator */}
            {thinking && (
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Avatar sx={{ width: 26, height: 26, bgcolor: "#1e3c72" }}>
                  <SmartToyRoundedIcon sx={{ fontSize: 14, color: "white" }} />
                </Avatar>
                <Box sx={{ px: 1.8, py: 1, borderRadius: "16px 16px 16px 4px", bgcolor: "white", border: "1px solid #e0e7ff", display: "flex", gap: 0.5, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 6, height: 6, borderRadius: "50%", bgcolor: "#94a3b8",
                        animation: "bounce 1.2s infinite",
                        animationDelay: `${i * 0.2}s`,
                        "@keyframes bounce": {
                          "0%, 60%, 100%": { transform: "translateY(0)" },
                          "30%": { transform: "translateY(-6px)" },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, borderTop: "1px solid #e0e7ff", bgcolor: "white", display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              size="small"
              multiline
              maxRows={3}
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  fontSize: 13,
                  bgcolor: "#f8f9ff",
                },
              }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              sx={{
                width: 38,
                height: 38,
                bgcolor: input.trim() && !thinking ? "#1e3c72" : "#e0e7ff",
                color: input.trim() && !thinking ? "white" : "#94a3b8",
                borderRadius: 2,
                flexShrink: 0,
                "&:hover": { bgcolor: input.trim() ? "#2a5298" : "#e0e7ff" },
                transition: "all 0.2s",
              }}
            >
              {thinking
                ? <CircularProgress size={16} sx={{ color: "#94a3b8" }} />
                : <SendRoundedIcon sx={{ fontSize: 17 }} />
              }
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default CandidateHome;