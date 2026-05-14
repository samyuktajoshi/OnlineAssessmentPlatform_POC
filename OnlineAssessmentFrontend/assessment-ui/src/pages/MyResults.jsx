import { useEffect, useState, useRef } from "react";
import resultApi from "../api/resultApi";
import assessmentApi from "../api/assessmentApi";
import { useNavigate } from "react-router-dom";
import React from "react";import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Paper,
  Avatar,
} from "@mui/material";

import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

function MyResults() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState("All");

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAll();
  }, []);

  useEffect(() => {
    applyFilter(filter);
  }, [filter, results]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchResults(), fetchAssessments(), fetchAnalytics()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await resultApi.get("/results/my");
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setResults(sorted);
    } catch {
      setError("Failed to load results.");
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await assessmentApi.get("/assessments");
      const m = {};
      (res.data || []).forEach((a) => {
        m[a.assessmentId] = a.assessmentName || a.title;
      });
      setMap(m);
    } catch { }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await resultApi.get("/results/my/analytics");
      setAnalytics(res.data);
    } catch { }
  };

  const getPercentage = (score, total) =>
    total ? Math.round((score / total) * 100) : 0;

  // ✅ FIXED — Excellent is a subset of Passed (both ≥50%)
  const getStatus = (score, total) => {
    const pct = getPercentage(score, total);
    if (pct >= 80) return "Excellent";
    if (pct >= 50) return "Passed";
    return "Failed";
  };

  const getScoreStyle = (score, total) => {
    const pct = getPercentage(score, total);
    if (pct >= 80) return {
      color: "#166534",
      bg: "#f0fdf4",
      border: "#86efac",
      track: "#16a34a",
      chip: "success",
    };
    if (pct >= 50) return {
      color: "#854d0e",
      bg: "#fefce8",
      border: "#fde047",
      track: "#ca8a04",
      chip: "warning",
    };
    return {
      color: "#991b1b",
      bg: "#fef2f2",
      border: "#fca5a5",
      track: "#dc2626",
      chip: "error",
    };
  };

  const applyFilter = (type) => {
    if (type === "All") setFiltered(results);
    else if (type === "Passed")
      // ✅ Passed filter includes Excellent too
      setFiltered(results.filter((r) => getPercentage(r.score, r.totalQuestions) >= 50));
    else
      setFiltered(results.filter((r) => getStatus(r.score, r.totalQuestions) === type));
  };

  const filterCounts = {
    All: results.length,
    Excellent: results.filter((r) => getPercentage(r.score, r.totalQuestions) >= 80).length,
    // ✅ Passed count includes Excellent
    Passed: results.filter((r) => getPercentage(r.score, r.totalQuestions) >= 50).length,
    Failed: results.filter((r) => getPercentage(r.score, r.totalQuestions) < 50).length,
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "A";

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">Loading your results...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", px: 4, py: 5, color: "white", mb: 4 }}>
        <Box maxWidth={900} mx="auto">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/candidate-home")}
            sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", mb: 2, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "white" } }}
          >
            Back to Dashboard
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 30, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>My Results</Typography>
              <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                {results.length} submission{results.length !== 1 ? "s" : ""} total
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={900} mx="auto" px={3} pb={6}>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* Analytics cards */}
        {analytics && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 4 }}>
            {[
              { key: "totalTests", label: "Total Tests", icon: <AssignmentRoundedIcon />, color: "#1e3c72" },
              { key: "averageScore", label: "Average Score", icon: <TrendingUpRoundedIcon />, color: "#d97706" },
              { key: "bestScore", label: "Best Score", icon: <EmojiEventsRoundedIcon />, color: "#7c3aed" },
              { key: "latestScore", label: "Latest Score", icon: <StarRoundedIcon />, color: "#16a34a" },
            ].map((s) => (
              <Paper
                key={s.key}
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #e0e7ff", p: 2.5, bgcolor: "white", transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(30,60,114,0.1)" } }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {React.cloneElement(s.icon, { sx: { fontSize: 20, color: s.color } })}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                      {s.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color={s.color} lineHeight={1.1}>
                      {analytics[s.key] ?? "—"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* Filter chips */}
        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
          {[
            { key: "All", label: "All" },
            { key: "Excellent", label: "Excellent ≥80%" },
            { key: "Passed", label: "Passed ≥50%" },
            { key: "Failed", label: "Failed <50%" },
          ].map((f) => (
            <Chip
              key={f.key}
              label={`${f.label} · ${filterCounts[f.key]}`}
              clickable
              onClick={() => setFilter(f.key)}
              sx={{
                fontWeight: 600,
                fontSize: 12,
                height: 30,
                bgcolor: filter === f.key ? "#1e3c72" : "white",
                color: filter === f.key ? "white" : "text.secondary",
                border: "1px solid",
                borderColor: filter === f.key ? "#1e3c72" : "#e0e7ff",
                "&:hover": { bgcolor: filter === f.key ? "#1e3c72" : "#f0f2f8" },
              }}
            />
          ))}
        </Stack>

        {/* ✅ Note explaining Passed includes Excellent */}
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          * "Passed" filter includes Excellent scores. Excellent = ≥80%, Passed = ≥50%, Failed = &lt;50%.
        </Typography>

        {/* Results */}
        {filtered.length === 0 ? (
          <Paper variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 8, border: "2px dashed #c5cae9" }}>
            <AssignmentRoundedIcon sx={{ fontSize: 52, color: "#c5cae9", mb: 2 }} />
            <Typography color="text.secondary" mb={2}>
              {filter === "All" ? "No results yet." : `No "${filter}" results.`}
            </Typography>
            {filter !== "All"
              ? <Button size="small" sx={{ textTransform: "none" }} onClick={() => setFilter("All")}>Show all</Button>
              : <Button variant="contained" onClick={() => navigate("/assessments")} sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Take an Assessment</Button>
            }
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filtered.map((r, index) => {
              const pct = getPercentage(r.score, r.totalQuestions);
              const style = getScoreStyle(r.score, r.totalQuestions);
              const label = getStatus(r.score, r.totalQuestions);
              const assessmentName = map[r.assessmentId] || "Assessment";

              return (
                <Paper
                  key={r.id ?? index}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e0e7ff",
                    bgcolor: "white",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": { boxShadow: "0 6px 20px rgba(30,60,114,0.1)", transform: "translateY(-1px)" },
                  }}
                >
                  <Box sx={{ display: "flex" }}>

                    {/* Score sidebar */}
                    <Box
                      sx={{
                        width: 90,
                        flexShrink: 0,
                        bgcolor: style.bg,
                        borderRight: `1px solid ${style.border}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 3,
                        px: 1,
                      }}
                    >
                      <Typography
                        fontWeight={900}
                        fontSize={28}
                        color={style.color}
                        lineHeight={1}
                      >
                        {pct}%
                      </Typography>
                      <Typography fontSize={11} color={style.color} fontWeight={600} mt={0.5}>
                        {label}
                      </Typography>
                      <Typography fontSize={11} color={style.color} mt={0.3} opacity={0.8}>
                        {r.score}/{r.totalQuestions}
                      </Typography>
                    </Box>

                    {/* Main content */}
                    <Box sx={{ flex: 1, p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: 13,
                              fontWeight: 700,
                              bgcolor: "#eef2ff",
                              color: "#1e3c72",
                              border: "1px solid #e0e7ff",
                            }}
                          >
                            {getInitials(assessmentName)}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography fontWeight={700} fontSize={15}>
                                {assessmentName}
                              </Typography>
                              {index === 0 && filter === "All" && (
                                <Chip label="Latest" size="small" color="primary" sx={{ fontSize: 9, fontWeight: 700, height: 18 }} />
                              )}
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                              <AccessTimeRoundedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(r.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<PlayArrowRoundedIcon sx={{ fontSize: "14px !important" }} />}
                          onClick={() => navigate("/assessments")}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: 12,
                            borderColor: "#e0e7ff",
                            color: "#1e3c72",
                            "&:hover": { bgcolor: "#eef2ff", borderColor: "#2a5298" },
                          }}
                        >
                          Retry
                        </Button>
                      </Box>

                      {/* Progress bar */}
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#f0f2f8",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: style.track,
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">0%</Typography>
                        <Typography variant="caption" fontWeight={600} color={style.color}>{pct}%</Typography>
                        <Typography variant="caption" color="text.secondary">100%</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default MyResults;