import { useEffect, useState } from "react";
import resultApi from "../api/resultApi";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Button,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const MEDAL_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];
const PIE_COLORS = ["#16a34a", "#dc2626"];

function AdminAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aRes, lRes] = await Promise.all([
        resultApi.get(`/results/analytics/${id}`),
        resultApi.get(`/results/leaderboard/${id}`),
      ]);
      setAnalytics(aRes.data);
      setLeaderboard(lRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">Loading analytics...</Typography>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="text.secondary">No analytics found for this assessment.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const statsData = [
    { name: "Attempts", value: analytics.totalAttempts },
    { name: "Avg Score", value: analytics.averageScore },
    { name: "Highest", value: analytics.highestScore },
  ];

  const pieData = [
    { name: "Pass", value: analytics.passPercentage },
    { name: "Fail", value: 100 - analytics.passPercentage },
  ];

  const statCards = [
    {
      label: "Total Attempts",
      value: analytics.totalAttempts,
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 24, color: "white" }} />,
      gradient: "linear-gradient(135deg, #1e3c72, #2a5298)",
    },
    {
      label: "Average Score",
      value: analytics.averageScore,
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 24, color: "white" }} />,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      label: "Highest Score",
      value: analytics.highestScore,
      icon: <StarRoundedIcon sx={{ fontSize: 24, color: "white" }} />,
      gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    },
    {
      label: "Pass Rate",
      value: `${analytics.passPercentage}%`,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 24, color: "white" }} />,
      gradient: "linear-gradient(135deg, #16a34a, #22c55e)",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          px: 2,
          py: 3,
          color: "white",
          mb: 4,
        }}
      >
        <Box maxWidth={1100} mx="auto">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: "rgba(255,255,255,0.8)",
              textTransform: "none",
              mb: 2,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
              borderRadius: 2,
            }}
          >
            Back
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <BarChartRoundedIcon sx={{ fontSize: 30, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Assessment Analytics
              </Typography>
              <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                Performance insights and leaderboard overview
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={1100} mx="auto" px={3} pb={6}>

        {/* Stat Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2.5,
            mb: 4,
          }}
        >
          {statCards.map((s) => (
            <Paper
              key={s.label}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e0e7ff",
                overflow: "hidden",
                transition: "all 0.2s",
                "&:hover": { boxShadow: "0 8px 24px rgba(30,60,114,0.12)", transform: "translateY(-2px)" },
              }}
            >
              <Box sx={{ height: 4, background: s.gradient }} />
              <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: s.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {s.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
                    {s.value}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Charts */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={4}>

          {/* Bar Chart */}
          <Paper
            elevation={0}
            sx={{ flex: 1, borderRadius: 3, border: "1px solid #e0e7ff", p: 3 }}
          >
            <Typography fontWeight={700} fontSize={16} mb={3}>
              Statistics Overview
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statsData} barSize={48}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a5298" />
                    <stop offset="100%" stopColor="#1e3c72" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Pie Chart */}
          <Paper
            elevation={0}
            sx={{ flex: 1, borderRadius: 3, border: "1px solid #e0e7ff", p: 3 }}
          >
            <Typography fontWeight={700} fontSize={16} mb={3}>
              Pass vs Fail Rate
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>

        </Stack>

        {/* Leaderboard */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}
        >
          {/* Leaderboard Header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <EmojiEventsRoundedIcon sx={{ color: "#f59e0b", fontSize: 26 }} />
            <Typography variant="h6" fontWeight={700} color="white">
              Leaderboard
            </Typography>
            <Chip
              label={`${leaderboard.length} candidates`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: 11, fontWeight: 600 }}
            />
          </Box>

          {leaderboard.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography color="text.secondary">No submissions yet.</Typography>
            </Box>
          ) : (
            <Stack divider={<Box sx={{ borderBottom: "1px solid #f0f2f8" }} />}>
              {leaderboard.map((r, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 3,
                    py: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "background 0.15s",
                    backgroundColor: index === 0 ? "#fffbeb" : "white",
                    "&:hover": { backgroundColor: "#f8f9ff" },
                  }}
                >
                  {/* Rank + Name */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        fontWeight: 800,
                        fontSize: 14,
                        bgcolor: index < 3 ? MEDAL_COLORS[index] : "#e0e7ff",
                        color: index < 3 ? "white" : "#1e3c72",
                      }}
                    >
                      {index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700} fontSize={15}>
                        {r.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rank #{index + 1}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Score */}
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{
                        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {r.score}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      points
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

      </Box>
    </Box>
  );
}

export default AdminAnalytics;