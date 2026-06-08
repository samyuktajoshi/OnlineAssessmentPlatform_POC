import { useEffect, useState, useRef } from "react";
import resultApi from "../api/resultApi";
import assessmentApi from "../api/assessmentApi";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";

function MyResults() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date_desc"); // date_desc | date_asc | score_desc | score_asc

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchAll();
  }, []);

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
      setResults(res.data || []);
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
    } catch {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await resultApi.get("/results/my/analytics");
      setAnalytics(res.data);
    } catch {}
  };

  const getPercentage = (score, total) =>
    total ? Math.round((score / total) * 100) : 0;

  const getStatus = (score, total) => {
    const pct = getPercentage(score, total);
    if (pct >= 80) return "Excellent";
    if (pct >= 50) return "Passed";
    return "Failed";
  };

  const getStatusStyle = (score, total) => {
    const pct = getPercentage(score, total);
    if (pct >= 80) return { color: "#166534", bg: "#dcfce7", chip: "success" };
    if (pct >= 50) return { color: "#854d0e", bg: "#fef9c3", chip: "warning" };
    return { color: "#991b1b", bg: "#fee2e2", chip: "error" };
  };

  // ── Compute filtered + sorted together so they never conflict ──
  const displayRows = results
    .filter((r) => {
      const pct = getPercentage(r.score, r.totalQuestions);
      if (filter === "All") return true;
      if (filter === "Passed") return pct >= 50;
      if (filter === "Excellent") return pct >= 80;
      if (filter === "Failed") return pct < 50;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "date_asc")  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "score_desc") return getPercentage(b.score, b.totalQuestions) - getPercentage(a.score, a.totalQuestions);
      if (sortBy === "score_asc")  return getPercentage(a.score, a.totalQuestions) - getPercentage(b.score, b.totalQuestions);
      return 0;
    });

  const sortOptions = [
    { key: "date_desc",  label: "Latest First",     icon: <SouthRoundedIcon sx={{ fontSize: 14 }} /> },
    { key: "date_asc",   label: "Oldest First",      icon: <NorthRoundedIcon sx={{ fontSize: 14 }} /> },
    { key: "score_desc", label: "Score: High → Low", icon: <SouthRoundedIcon sx={{ fontSize: 14 }} /> },
    { key: "score_asc",  label: "Score: Low → High", icon: <NorthRoundedIcon sx={{ fontSize: 14 }} /> },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", px: 4, py: 2, color: "white", mb: 4 }}>
        <Box maxWidth={900} mx="auto">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/candidate-home")}
            sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", mb: 2, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            Back
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 50, height: 50, borderRadius: 1, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>My Results</Typography>
              <Typography sx={{ opacity: 0.75, fontSize: 14 }}>
                {results.length} submission{results.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={900} mx="auto" px={3} pb={6}>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* Analytics */}
        {analytics && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 4 }}>
            {[
              { label: "Tests Taken", value: analytics.totalTests },
              { label: "Avg Score",   value: analytics.averageScore },
              { label: "Best Score",  value: analytics.bestScore },
              { label: "Latest",      value: analytics.latestScore },
            ].map((s) => (
              <Paper key={s.label} elevation={0} sx={{ borderRadius: 2, border: "1px solid #e0e7ff", p: 2, textAlign: "center", bgcolor: "white" }}>
                <Typography variant="h5" fontWeight={800} color="#1e3c72">{s.value ?? "—"}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Paper>
            ))}
          </Box>
        )}

        {/* Filter + Sort row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>

          {/* Filter chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {["All", "Excellent", "Passed", "Failed"].map((f) => (
              <Chip
                key={f}
                label={f}
                clickable
                onClick={() => setFilter(f)}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: filter === f ? "#1e3c72" : "white",
                  color: filter === f ? "white" : "text.secondary",
                  border: "1px solid",
                  borderColor: filter === f ? "#1e3c72" : "#e0e7ff",
                  "&:hover": { bgcolor: filter === f ? "#1e3c72" : "#f0f2f8" },
                }}
              />
            ))}
          </Stack>

          {/* Sort chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {sortOptions.map((s) => (
              <Chip
                key={s.key}
                label={s.label}
                clickable
                icon={sortBy === s.key ? s.icon : <SwapVertRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={() => setSortBy(s.key)}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: 11,
                  bgcolor: sortBy === s.key ? "#eef2ff" : "white",
                  color: sortBy === s.key ? "#1e3c72" : "text.secondary",
                  border: "1px solid",
                  borderColor: sortBy === s.key ? "#2a5298" : "#e0e7ff",
                  "&:hover": { bgcolor: "#eef2ff" },
                  "& .MuiChip-icon": {
                    color: sortBy === s.key ? "#1e3c72" : "#94a3b8",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Result count */}
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Showing {displayRows.length} of {results.length} result{results.length !== 1 ? "s" : ""}
          {filter !== "All" && ` · filtered by "${filter}"`}
          {" · "}{sortOptions.find(s => s.key === sortBy)?.label}
        </Typography>

        {/* Table */}
        {displayRows.length === 0 ? (
          <Paper variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6, border: "2px dashed #c5cae9" }}>
            <Typography color="text.secondary" mb={1}>No results match this filter.</Typography>
            <Button size="small" sx={{ textTransform: "none" }} onClick={() => setFilter("All")}>
              Clear filter
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9ff" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.5 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.5 }}>Assessment</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.5 }} align="center">Score</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.5 }} align="center">Percentage</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.5 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.5 }} align="right">Date </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayRows.map((r, index) => {
                  const pct = getPercentage(r.score || 0, r.totalQuestions || 1);
                  const label = getStatus(r.score, r.totalQuestions);
                  const style = getStatusStyle(r.score, r.totalQuestions);
                  const name = map[r.assessmentId] || "Assessment";
                  const isLatest = sortBy === "date_desc" && index === 0;

                  return (
                    <TableRow
                      key={r.id || index}
                      sx={{
                        bgcolor: isLatest ? "#fafbff" : "white",
                        "&:hover": { bgcolor: "#f0f4ff" },
                        "&:last-child td": { border: 0 },
                        transition: "background 0.15s",
                      }}
                    >
                      <TableCell sx={{ py: 2, color: "text.disabled", fontSize: 13 }}>
                        {index + 1}
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography fontWeight={600} fontSize={14}>{name}</Typography>
                          {isLatest && (
                            <Chip label="Latest" size="small" color="primary" sx={{ fontSize: 9, height: 18, fontWeight: 700 }} />
                          )}
                        </Box>
                        {/* <Typography variant="caption" color="text.secondary">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Typography> */}
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        <Typography fontWeight={700} fontSize={14} color={style.color}>
                          {r.score} / {r.totalQuestions}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box sx={{ display: "inline-block", px: 1.5, py: 0.4, borderRadius: 2, bgcolor: style.bg }}>
                          <Typography fontWeight={800} fontSize={14} color={style.color}>
                            {pct}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        <Chip label={label} color={style.chip} size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
                      </TableCell>

                      <TableCell align="right" sx={{ py: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Typography>
                        {/* <Typography variant="caption" color="text.disabled">
                          {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Typography> */}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}

export default MyResults;