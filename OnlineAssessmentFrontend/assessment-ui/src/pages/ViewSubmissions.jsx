import { useEffect, useState } from "react";
import resultApi from "../api/resultApi";
import assessmentApi from "../api/assessmentApi";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";

function ViewSubmissions() {
  const [results, setResults] = useState([]);
  const [assessmentMap, setAssessmentMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchResults(), fetchAssessments()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await resultApi.get("/results");
      const data = res.data || [];

      // Sort latest first
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setResults(sorted);

      // Build userId → userName map from results themselves
      const uMap = {};
      sorted.forEach((r) => {
        if (r.userId && r.userName) {
          uMap[r.userId] = r.userName;
        }
      });
      setUserMap(uMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await assessmentApi.get("/assessments");
      const map = {};
      res.data.forEach((a) => {
        map[a.assessmentId] = a.assessmentName || a.title;
      });
      setAssessmentMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return { bg: "#dcfce7", color: "#166534", chip: "success" };
    if (percentage >= 50) return { bg: "#fef9c3", color: "#854d0e", chip: "warning" };
    return { bg: "#fee2e2", color: "#991b1b", chip: "error" };
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 50) return "Passed";
    return "Failed";
  };

  // Filter by search
  const filtered = results.filter((r) => {
    const name = userMap[r.userId] || r.userName || "";
    const assessment = assessmentMap[r.assessmentId] || "";
    const q = search.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      assessment.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">Loading submissions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          px: 4,
          py: 5,
          color: "white",
          mb: 4,
        }}
      >
        <Box maxWidth={1000} mx="auto">
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
              <PeopleAltRoundedIcon sx={{ fontSize: 30, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                All Submissions
              </Typography>
              <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                {results.length} submission{results.length !== 1 ? "s" : ""} total
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={1000} mx="auto" px={3} pb={6}>

        {/* Search bar */}
        <TextField
          fullWidth
          placeholder="Search by candidate name or assessment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            mb: 3,
            backgroundColor: "white",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
        />

        {filtered.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, textAlign: "center", py: 8, border: "2px dashed #c5cae9" }}
          >
            <PeopleAltRoundedIcon sx={{ fontSize: 52, color: "#c5cae9", mb: 2 }} />
            <Typography color="text.secondary">
              {search ? "No results match your search." : "No submissions yet."}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filtered.map((r, index) => {
              const name = userMap[r.userId] || r.userName || `User #${r.userId}`;
              const assessment = assessmentMap[r.assessmentId] || "Assessment";
              const percentage = r.percentage ?? (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0);
              const scoreStyle = getScoreColor(percentage);
              const scoreLabel = getScoreLabel(percentage);

              return (
                <Paper
                  key={r.id ?? index}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e0e7ff",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(30,60,114,0.1)",
                      transform: "translateY(-1px)",
                      borderColor: "#b3c1f0",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>

                      {/* Left — Avatar + info */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            fontWeight: 700,
                            fontSize: 15,
                            background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(name)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} fontSize={15}>
                            {name}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
                            <AssignmentRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                            <Typography variant="body2" color="text.secondary">
                              {assessment}
                            </Typography>
                            <Typography color="text.disabled" fontSize={12}>•</Typography>
                            <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(r.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Right — score */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            px: 2.5,
                            py: 1,
                            borderRadius: 2,
                            backgroundColor: scoreStyle.bg,
                            textAlign: "center",
                          }}
                        >
                          <Typography fontWeight={800} fontSize={20} color={scoreStyle.color} lineHeight={1.1}>
                            {r.score}/{r.totalQuestions}
                          </Typography>
                          <Typography fontSize={11} color={scoreStyle.color} fontWeight={600}>
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Chip
                          label={scoreLabel}
                          size="small"
                          color={scoreStyle.chip}
                          sx={{ fontWeight: 700, fontSize: 12 }}
                        />
                      </Box>

                    </Box>
                  </CardContent>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default ViewSubmissions;