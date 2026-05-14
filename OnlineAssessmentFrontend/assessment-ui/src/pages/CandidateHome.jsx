import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";

import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimerIcon from "@mui/icons-material/Timer";
import SchoolIcon from "@mui/icons-material/School";

function CandidateHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  if (!user) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Typography>Please login</Typography>
      </Box>
    );
  }

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f2f8" }}>

      {/* HERO (Reduced Height) */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          px: 3,
          py: 3,
          color: "white",
        }}
      >
        <Box maxWidth={1000} mx="auto" display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(255,255,255,0.2)",
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
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

        {/* HIGHLIGHTS / CAROUSEL */}
        <Typography fontWeight={600} mb={2}>
          Highlights
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            mb: 4,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {[
            { icon: <TrendingUpIcon />, text: "Track your performance growth" },
            { icon: <TimerIcon />, text: "Timed assessments simulate real exams" },
            { icon: <SchoolIcon />, text: "Improve skills with every attempt" },
          ].map((item, index) => (
            <Card
              key={index}
              sx={{
                minWidth: 220,
                borderRadius: 3,
                flexShrink: 0,
              }}
            >
              <CardContent>
                <Avatar
                  sx={{
                    bgcolor: "#1e3c72",
                    mb: 1,
                    width: 40,
                    height: 40,
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography fontSize={14}>{item.text}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Typography variant="h6" fontWeight={600} mb={3}>
          What would you like to do?
        </Typography>

        <Stack spacing={3}>
          {/* Take Assessment */}
          <Card
            sx={{
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(30,60,114,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3, display: "flex", gap: 2 }}>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: "#1e3c72",
                  width: 52,
                  height: 52,
                }}
              >
                <AssignmentIcon />
              </Avatar>

              <Box flex={1}>
                <Typography fontWeight={700}>Take Assessment</Typography>
                <Typography fontSize={14} color="text.secondary" mb={2}>
                  Browse available assessments and start a timed test.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/assessments")}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Browse Assessments →
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* My Results */}
          <Card
            sx={{
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(46,125,50,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3, display: "flex", gap: 2 }}>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: "#2e7d32",
                  width: 52,
                  height: 52,
                }}
              >
                <BarChartIcon />
              </Avatar>

              <Box flex={1}>
                <Typography fontWeight={700}>My Results</Typography>
                <Typography fontSize={14} color="text.secondary" mb={2}>
                  Review your scores and performance history.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/my-results")}
                  sx={{
                    backgroundColor: "#2e7d32",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  View Results →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* TIP */}
        <Divider sx={{ my: 4 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#fff8e1",
            border: "1px solid #ffe082",
          }}
        >
          <EmojiEventsIcon sx={{ color: "#f9a825" }} />
          <Typography fontSize={14}>
            <strong>Tip:</strong> Regular practice leads to better assessment performance.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default CandidateHome;