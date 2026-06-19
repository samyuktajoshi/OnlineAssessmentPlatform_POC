import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import resultApi from "../api/resultApi";

import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Stack,
  Alert,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

function CandidateAnalytics() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await resultApi.get(`/results/user/${userId}/analytics`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (pct) => {
    if (pct >= 80) return { color: "#166534", bg: "#dcfce7", chip: "success" };
    if (pct >= 50) return { color: "#854d0e", bg: "#fef9c3", chip: "warning" };
    return { color: "#991b1b", bg: "#fee2e2", chip: "error" };
  };

  const getLabel = (pct) => {
    if (pct >= 80) return "Excellent";
    if (pct >= 50) return "Passed";
    return "Failed";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "60vh", gap: 2 }}>
        <CircularProgress size={36} />
        <Typography color="text.secondary">Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const statCards = [
    {
      label: "Total Tests",
      value: data?.totalTests ?? 0,
      icon: <AssignmentRoundedIcon sx={{ fontSize: 22, color: "white" }} />,
      gradient: "linear-gradient(135deg, #1e3c72, #2a5298)",
    },
    {
      label: "Average Score",
      value: data?.averageScore ? `${data.averageScore.toFixed(1)}` : "0",
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 22, color: "white" }} />,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      label: "Best Score",
      value: data?.bestScore ?? 0,
      icon: <EmojiEventsRoundedIcon sx={{ fontSize: 22, color: "white" }} />,
      gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    },
    // {
    //   label: "Latest Score",
    //   value: data?.latestScore ?? 0,
    //   icon: <AccessTimeRoundedIcon sx={{ fontSize: 22, color: "white" }} />,
    //   gradient: "linear-gradient(135deg, #16a34a, #22c55e)",
    // },
  ];

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", px: 3, py: 3, color: "white", mb: 2 }}>
        <Box maxWidth={900} mx="auto">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", mb: 2, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "white" } }}
          >
            Back
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1}}>
            {/* <Avatar sx={{ width: 52, height: 52, bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: 20 }}>
              {userId}
            </Avatar> */}
            <Box>
              <Typography variant="h4" fontWeight={700}>Candidate Performance</Typography>
              <Typography sx={{ opacity: 0.75, fontSize: 14, mt: 0.5 }}>
                {data?.totalTests ?? 0} test{data?.totalTests !== 1 ? "s" : ""} taken
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={900} mx="auto" px={3} pb={6}>

        {/* Stat Cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 2, mb: 4 }}>
          {statCards.map((s) => (
            <Paper key={s.label} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden", transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(30,60,114,0.1)" } }}>
              <Box sx={{ height: 3, background: s.gradient }} />
              <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, background: s.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">{s.label}</Typography>
                  <Typography variant="h5" fontWeight={800} lineHeight={1.1}>{s.value}</Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Improvement banner */}
        {data?.improvement !== undefined && data.totalTests > 1 && (
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${data.improvement >= 0 ? "#86efac" : "#fca5a5"}`, bgcolor: data.improvement >= 0 ? "#f0fdf4" : "#fef2f2", p: 2.5, mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
            <TrendingUpRoundedIcon sx={{ color: data.improvement >= 0 ? "#16a34a" : "#dc2626", fontSize: 26, flexShrink: 0 }} />
            <Box>
              <Typography fontWeight={700} color={data.improvement >= 0 ? "#166534" : "#991b1b"} fontSize={14}>
                Score Improvement
              </Typography>
              <Typography fontWeight={800} fontSize={20} color={data.improvement >= 0 ? "#16a34a" : "#dc2626"}>
                {data.improvement >= 0 ? "+" : ""}{data.improvement} points
              </Typography>
              <Typography variant="caption" color="text.secondary">from first to latest attempt</Typography>
            </Box>
          </Paper>
        )}

        {/* Test History */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}>
          {/* Section header */}
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f0f2f8", bgcolor: "#f8f9ff", display: "flex", alignItems: "center", gap: 1.5 }}>
            <AssignmentRoundedIcon sx={{ color: "#1e3c72", fontSize: 20 }} />
            <Typography fontWeight={700} color="#1e3c72">Test History</Typography>
            <Chip label={`${data?.results?.length ?? 0} records`} size="small" sx={{ ml: "auto", fontSize: 11, fontWeight: 600 }} />
          </Box>

          {!data?.results || data.results.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <AssignmentRoundedIcon sx={{ fontSize: 48, color: "#c5cae9", mb: 1 }} />
              <Typography color="text.secondary">No tests attempted yet.</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {data.results.map((r, i) => {
                const pct = r.percentage ?? (r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0);
                const style = getScoreColor(pct);
                const label = getLabel(pct);

                return (
                  <Box key={i} sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, transition: "background 0.15s", "&:hover": { bgcolor: "#f8f9ff" } }}>

                    {/* Left */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Typography fontWeight={800} color="white" fontSize={12}>
                          {String(i + 1).padStart(2, "0")}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} fontSize={14} noWrap>
                          {r.assessmentName || `Assessment ${r.assessmentId}`}
                        </Typography>
                        {r.createdAt && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(r.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Right */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                      <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: style.bg, textAlign: "center" }}>
                        <Typography fontWeight={800} fontSize={15} color={style.color}>{pct}%</Typography>
                        {r.score !== undefined && r.totalQuestions !== undefined && (
                          <Typography fontSize={10} color={style.color}>{r.score}/{r.totalQuestions}</Typography>
                        )}
                      </Box>
                      <Chip label={label} color={style.chip} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default CandidateAnalytics;