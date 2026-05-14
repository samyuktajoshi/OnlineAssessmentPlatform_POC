import { useEffect, useState } from "react";
import assessmentApi from "../api/assessmentApi";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

import AssignmentIcon from "@mui/icons-material/Assignment";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

const STATUS_CONFIG = {
  Active:  { color: "success", bg: "#dcfce7", text: "#166534", border: "#86efac" },
  Draft:   { color: "default", bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
  Hidden:  { color: "warning", bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  Closed:  { color: "error",   bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

function ManageAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await assessmentApi.get("/assessments/my");
      setAssessments(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await assessmentApi.patch(`/assessments/${id}/status`, { status });
      fetchAssessments();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await assessmentApi.delete(`/assessments/${deleteId}`);
      setDeleteId(null);
      setDeleteTitle("");
      fetchAssessments();
    } catch (err) {
      console.error(err);
      alert("Error deleting assessment");
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">Loading assessments...</Typography>
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
        <Box maxWidth={1100} mx="auto">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                <AssignmentIcon sx={{ fontSize: 30, color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Manage Assessments
                </Typography>
                <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                  {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} in total
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate("/create")}
              sx={{
                bgcolor: "white",
                color: "#1e3c72",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.2,
                "&:hover": { bgcolor: "#f0f4ff" },
                boxShadow: "none",
              }}
            >
              New Assessment
            </Button>
          </Box>

          {/* Status summary chips */}
          {assessments.length > 0 && (
            <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
              {Object.keys(STATUS_CONFIG).map((s) => {
                const count = assessments.filter((a) => a.status === s).length;
                if (count === 0) return null;
                return (
                  <Chip
                    key={s}
                    label={`${s}: ${count}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 12,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* List */}
      <Box maxWidth={1100} mx="auto" px={3} pb={6}>
        {assessments.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, textAlign: "center", py: 10, border: "2px dashed #c5cae9" }}
          >
            <AssignmentIcon sx={{ fontSize: 56, color: "#c5cae9", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="text.secondary" mb={1}>
              No assessments yet
            </Typography>
            <Typography color="text.disabled" mb={3} fontSize={14}>
              Create your first assessment to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate("/create")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                px: 4,
              }}
            >
              Create Assessment
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {assessments.map((a, index) => {
              const statusCfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.Draft;
              const isUpdating = updatingId === a.id;

              return (
                <Paper
                  key={a.id}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${statusCfg.border}`,
                    overflow: "hidden",
                    transition: "all 0.2s",
                    opacity: isUpdating ? 0.7 : 1,
                    "&:hover": {
                      boxShadow: "0 8px 28px rgba(30,60,114,0.12)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* Colored left accent bar */}
                  <Box sx={{ display: "flex" }}>
                    <Box
                      sx={{
                        width: 5,
                        flexShrink: 0,
                        background: statusCfg.bg,
                        borderRight: `2px solid ${statusCfg.border}`,
                      }}
                    />

                    <Box sx={{ flex: 1, p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>

                        {/* Left — number + info */}
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: 2,
                              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Typography fontWeight={800} color="white" fontSize={15}>
                              {String(index + 1).padStart(2, "0")}
                            </Typography>
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Typography variant="h6" fontWeight={700} noWrap>
                                {a.title ?? a.assessmentName}
                              </Typography>
                              {/* Status badge */}
                              <Chip
                                label={a.status}
                                size="small"
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  height: 20,
                                  bgcolor: statusCfg.bg,
                                  color: statusCfg.text,
                                  border: `1px solid ${statusCfg.border}`,
                                }}
                              />
                            </Box>

                            {/* Meta row */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {a.description || "No description"}
                              </Typography>

                              {a.durationMinutes && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                  <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {a.durationMinutes} mins
                                  </Typography>
                                </Box>
                              )}

                              {a.questionCount !== undefined && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                  <HelpOutlineRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {a.questionCount} question{a.questionCount !== 1 ? "s" : ""}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Right — actions */}
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>

                          {/* Status dropdown */}
                          <FormControl size="small">
                            <Select
                              value={a.status}
                              onChange={(e) => handleStatusChange(a.id, e.target.value)}
                              disabled={isUpdating}
                              sx={{
                                minWidth: 115,
                                fontSize: 13,
                                fontWeight: 600,
                                borderRadius: 2,
                                color: statusCfg.text,
                                bgcolor: statusCfg.bg,
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: statusCfg.border,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: statusCfg.text,
                                },
                              }}
                            >
                              <MenuItem value="Draft">📝 Draft</MenuItem>
                              <MenuItem value="Active">✅ Active</MenuItem>
                              <MenuItem value="Hidden">🙈 Hidden</MenuItem>
                              <MenuItem value="Closed">🔒 Closed</MenuItem>
                            </Select>
                          </FormControl>

                          <Tooltip title="Manage Questions">
                            <Button
                              variant="contained"
                              startIcon={<QuizRoundedIcon />}
                              onClick={() => navigate(`/manage-questions/${a.id}`)}
                              size="small"
                              sx={{
                                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                boxShadow: "none",
                              }}
                            >
                              Questions
                            </Button>
                          </Tooltip>

                          <Tooltip title="View Analytics">
                            <Button
                              variant="outlined"
                              startIcon={<BarChartRoundedIcon />}
                              onClick={() => navigate(`/admin-analytics/${a.id}`)}
                              size="small"
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                borderColor: "#2a5298",
                                color: "#2a5298",
                                "&:hover": { bgcolor: "#eef2ff" },
                              }}
                            >
                              Analytics
                            </Button>
                          </Tooltip>

                          <Tooltip title="Delete Assessment">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleteId(a.id);
                                setDeleteTitle(a.title ?? a.assessmentName ?? "this assessment");
                              }}
                              sx={{
                                border: "1px solid #ffcdd2",
                                borderRadius: 2,
                                color: "error.main",
                                width: 36,
                                height: 36,
                                "&:hover": { bgcolor: "#fff5f5", borderColor: "#ef9a9a" },
                              }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Delete Assessment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to permanently delete <strong>"{deleteTitle}"</strong>.
            All questions associated with it will also be removed.
            This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteId(null)}
            sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineRoundedIcon />}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default ManageAssessments;