import { useEffect, useState } from "react";
import assessmentApi from "../api/assessmentApi";
import resultApi from "../api/resultApi";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      await Promise.all([fetchAssessments(), fetchResults()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await assessmentApi.get("/assessments");
      setAssessments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await resultApi.get("/results/my");
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Filter + Search logic ──
  const filtered = assessments.filter((a) => {
    const name = (a.assessmentName ?? a.title ?? "").toLowerCase();
    const desc = (a.description ?? "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = name.includes(q) || desc.includes(q);

    const assessmentResults = results.filter(
      (r) => Number(r.assessmentId) === Number(a.assessmentId)
    );
    const attempts = assessmentResults.length;

    const now = new Date();
    const notStartedYet = a.availableFrom && now < new Date(a.availableFrom);
    const isExpired = a.availableUntil && now > new Date(a.availableUntil);

    // ✅ Closed = admin manually closed OR expired by date
    const isClosed = a.status === "Closed" || isExpired;

    const matchesFilter =
      filter === "All" ? true
      : filter === "Available" ? !notStartedYet && !isClosed && attempts === 0
      : filter === "Attempted" ? attempts > 0 && !isClosed
      : filter === "Closed" ? isClosed
      : filter === "Coming Soon" ? notStartedYet && !isClosed
      : true;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", px: 4, py: 5, color: "white", mb: 4 }}>
        <Box maxWidth={900} mx="auto">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AssignmentIcon sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Available Assessments
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 0.5 }}>
                {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} available
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={900} mx="auto" px={3} pb={6}>

        {/* Search + Filter */}
        <Box sx={{ mb: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { sm: "center" } }}>
          <TextField
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => { if (val) setFilter(val); }}
            size="small"
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                px: 1.5,
                border: "1px solid #e0e7ff",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  color: "white",
                  "&:hover": { background: "linear-gradient(135deg, #1e3c72, #2a5298)" },
                },
              },
            }}
          >
            {["All", "Available", "Attempted", "Coming Soon", "Closed"].map((f) => (
              <ToggleButton key={f} value={f}>{f}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Result count */}
        {(search || filter !== "All") && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            Showing {filtered.length} of {assessments.length} assessments
            {search && ` for "${search}"`}
          </Typography>
        )}

        {/* Cards */}
        {filtered.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary">
              {search || filter !== "All"
                ? "No assessments match your search."
                : "No assessments available right now."}
            </Typography>
            {(search || filter !== "All") && (
              <Button
                size="small"
                sx={{ mt: 2, textTransform: "none" }}
                onClick={() => { setSearch(""); setFilter("All"); }}
              >
                Clear filters
              </Button>
            )}
          </Card>
        ) : (
          <Stack spacing={2.5}>
            {filtered.map((a, index) => {
              const assessmentResults = results.filter(
                (r) => Number(r.assessmentId) === Number(a.assessmentId)
              );
              const attempts = assessmentResults.length;
              const bestScore = attempts > 0
                ? Math.max(...assessmentResults.map((r) => r.score))
                : null;
              const totalQuestions = attempts > 0
                ? assessmentResults[0].totalQuestions
                : null;

              const now = new Date();
              const availableFrom = a.availableFrom ? new Date(a.availableFrom) : null;
              const availableUntil = a.availableUntil ? new Date(a.availableUntil) : null;
              const notStartedYet = availableFrom && now < availableFrom;
              const isExpired = availableUntil && now > availableUntil;

              // ✅ isClosed covers both admin-closed and date-expired
              const isClosed = a.status === "Closed" || isExpired;
              const canStartTest = !notStartedYet && !isClosed;

              return (
                <Card
                  key={a.assessmentId}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${isClosed ? "#e2e8f0" : "#e0e7ff"}`,
                    transition: "all 0.2s",
                    opacity: isClosed ? 0.85 : 1,
                    "&:hover": {
                      boxShadow: isClosed
                        ? "none"
                        : "0 8px 24px rgba(30,60,114,0.12)",
                      transform: isClosed ? "none" : "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, pb: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: isClosed
                              ? "linear-gradient(135deg, #94a3b8, #64748b)"
                              : "linear-gradient(135deg, #1e3c72, #2a5298)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isClosed
                            ? <LockRoundedIcon sx={{ fontSize: 18, color: "white" }} />
                            : <Typography color="white" fontWeight={700} fontSize={14}>
                                {String(index + 1).padStart(2, "0")}
                              </Typography>
                          }
                        </Box>
                        <Typography variant="h6" fontWeight={700} color={isClosed ? "text.secondary" : "text.primary"}>
                          {a.assessmentName ?? a.title}
                        </Typography>
                      </Box>

                      <Chip
                        label={
                          notStartedYet ? "Coming Soon"
                          : isClosed ? "Closed"
                          : attempts > 0 ? "Attempted"
                          : "Available"
                        }
                        size="small"
                        color={
                          isClosed ? "default"
                          : notStartedYet ? "default"
                          : attempts > 0 ? "warning"
                          : "success"
                        }
                        variant="outlined"
                        sx={{ fontSize: 11, fontWeight: 600 }}
                      />
                    </Box>

                    <Stack direction="row" spacing={1} mb={1.5} ml={0.5}>
                      <DescriptionRoundedIcon fontSize="small" sx={{ color: "text.disabled", mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        {a.description || "No description provided."}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" ml={0.5}>
                      <AccessTimeRoundedIcon fontSize="small" sx={{ color: isClosed ? "text.disabled" : "#1e3c72" }} />
                      <Typography variant="body2" fontWeight={500} color={isClosed ? "text.disabled" : "#1e3c72"}>
                        {a.durationMinutes ?? a.duration} mins
                      </Typography>
                    </Stack>

                    {/* Open/close dates */}
                    {(a.availableFrom || a.availableUntil) && (
                      <Stack direction="row" spacing={2} mt={1} ml={0.5}>
                        {a.availableFrom && (
                          <Typography variant="caption" color="text.disabled">
                            Opens: {new Date(a.availableFrom).toLocaleDateString()}
                          </Typography>
                        )}
                        {a.availableUntil && (
                          <Typography variant="caption" color={isExpired ? "error" : "text.disabled"}>
                            {isExpired ? "Closed" : "Closes"}: {new Date(a.availableUntil).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {attempts > 0 && (
                      <Box mt={2} ml={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Attempts: {attempts}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#0d447c">
                          Best Score: {bestScore}/{totalQuestions}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Divider sx={{ mx: 3, mt: 2 }} />

                  <CardActions sx={{ px: 3, py: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      endIcon={isClosed
                        ? <LockRoundedIcon sx={{ fontSize: "16px !important" }} />
                        : <PlayArrowRoundedIcon />
                      }
                      disabled={!canStartTest}
                      onClick={() => canStartTest && navigate(`/test/${a.assessmentId}`)}
                      sx={{
                        background: isClosed
                          ? "#94a3b8"
                          : "linear-gradient(135deg, #1e3c72, #2a5298)",
                        borderRadius: 2,
                        px: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:disabled": {
                          background: "#94a3b8",
                          color: "white",
                          opacity: 1,
                        },
                      }}
                    >
                      {isClosed ? "Closed"
                        : notStartedYet ? "Coming Soon"
                        : attempts > 0 ? "Retry Test"
                        : "Start Test"}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default Assessments;