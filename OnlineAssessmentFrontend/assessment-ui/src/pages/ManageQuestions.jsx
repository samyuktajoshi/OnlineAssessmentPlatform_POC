import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assessmentApi from "../api/assessmentApi";
import { FormControlLabel, Checkbox } from "@mui/material";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const TYPE_LABELS = { 1: "Single Choice", 2: "Multiple Choice", 3: "True / False" };
const TYPE_COLORS = { 1: "primary", 2: "secondary", 3: "warning" };

function ManageQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await assessmentApi.get(`/questions/assessment/${id}`);
      setQuestions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await assessmentApi.delete(`/questions/${deleteId}`);
      toast.success("Question deleted");
      setDeleteId(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
      setDeleteId(null);
    }
  };

  const handleEdit = (q) => {
    setEditingQuestion({
      id: q.id,
      text: q.text || "",
      type: Number(q.type),
      optionA: q.optionA || "",
      optionB: q.optionB || "",
      optionC: q.optionC || "",
      optionD: q.optionD || "",
      correctAnswers: q.correctAnswers || "",
    });
    setOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        text: editingQuestion.text.trim(),
        type: Number(editingQuestion.type),
        optionA: Number(editingQuestion.type) === 3 ? "True" : editingQuestion.optionA,
        optionB: Number(editingQuestion.type) === 3 ? "False" : editingQuestion.optionB,
        optionC: Number(editingQuestion.type) === 3 ? "" : editingQuestion.optionC,
        optionD: Number(editingQuestion.type) === 3 ? "" : editingQuestion.optionD,
        correctAnswers: editingQuestion.correctAnswers.toUpperCase(),
      };

      await assessmentApi.put(`/questions/${editingQuestion.id}`, payload);
      toast.success("Question updated!");
      setOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.text?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 2 }}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">Loading questions...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={2500} />

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
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/manage-assessments")}
            sx={{
              color: "rgba(255,255,255,0.8)",
              textTransform: "none",
              mb: 2,
              borderRadius: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "white" },
            }}
          >
            Back to Assessments
          </Button>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
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
                <QuizRoundedIcon sx={{ fontSize: 30, color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Manage Questions
                </Typography>
                <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                  Total: {questions.length} question{questions.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>

            {/* Add Questions button always visible */}
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate(`/add-questions/${id}`)}
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
              Add Questions
            </Button>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={1000} mx="auto" px={3} pb={6}>

        {questions.length === 0 ? (
          /* ── EMPTY STATE ── */
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              textAlign: "center",
              py: 10,
              border: "2px dashed #c5cae9",
            }}
          >
            <QuizRoundedIcon sx={{ fontSize: 60, color: "#c5cae9", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="text.secondary" mb={1}>
              No questions yet
            </Typography>
            <Typography color="text.disabled" mb={4} fontSize={14}>
              This assessment doesn't have any questions. Add some to get started.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate(`/add-questions/${id}`)}
              sx={{
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 5,
                py: 1.5,
              }}
            >
              Add Questions Now
            </Button>
          </Paper>
        ) : (
          <>
            {/* Search bar */}
            <TextField
              fullWidth
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                mb: 2,
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

            <Typography variant="body2" color="text.secondary" mb={2}>
              {filteredQuestions.length} of {questions.length} question{questions.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </Typography>

            {filteredQuestions.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ borderRadius: 3, textAlign: "center", py: 6, border: "2px dashed #c5cae9" }}
              >
                <Typography color="text.secondary">No questions match your search.</Typography>
                <Button size="small" sx={{ mt: 1.5, textTransform: "none" }} onClick={() => setSearch("")}>
                  Clear search
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2.5}>
                {filteredQuestions.map((q, index) => (
                  <Paper
                    key={q.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #e0e7ff",
                      overflow: "hidden",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(30,60,114,0.1)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex" }}>
                      {/* Left accent */}
                      <Box
                        sx={{
                          width: 5,
                          flexShrink: 0,
                          background: "linear-gradient(180deg, #1e3c72, #2a5298)",
                        }}
                      />

                      <Box sx={{ flex: 1, p: 2.5 }}>
                        {/* Question header */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1 }}>
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 1.5,
                                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Typography fontWeight={800} color="white" fontSize={13}>
                                {String(index + 1).padStart(2, "0")}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography fontWeight={700} fontSize={15} mb={0.5}>
                                {q.text}
                              </Typography>
                              <Chip
                                label={TYPE_LABELS[q.type] || "Question"}
                                size="small"
                                color={TYPE_COLORS[q.type] || "default"}
                                variant="outlined"
                                sx={{ fontSize: 10, fontWeight: 600, height: 20 }}
                              />
                            </Box>
                          </Box>

                          {/* Action buttons */}
                          <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: 1 }}>
                            <Tooltip title="Edit Question">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(q)}
                                sx={{
                                  border: "1px solid #e0e7ff",
                                  borderRadius: 2,
                                  color: "#1e3c72",
                                  "&:hover": { bgcolor: "#eef2ff", borderColor: "#2a5298" },
                                  width: 34,
                                  height: 34,
                                }}
                              >
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Question">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteId(q.id)}
                                sx={{
                                  border: "1px solid #ffcdd2",
                                  borderRadius: 2,
                                  color: "error.main",
                                  "&:hover": { bgcolor: "#fff5f5", borderColor: "#ef9a9a" },
                                  width: 34,
                                  height: 34,
                                }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Options */}
                        <Grid container spacing={1} mb={2}>
                          {["A", "B", "C", "D"]
                            .filter((opt) => q.type === 3 ? ["A", "B"].includes(opt) : true)
                            .map((opt) => {
                              const val = q[`option${opt}`];
                              if (!val) return null;
                              const isCorrect = q.correctAnswers?.toUpperCase().includes(opt);
                              return (
                                <Grid item xs={6} key={opt}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      px: 1.5,
                                      py: 0.8,
                                      borderRadius: 2,
                                      border: "1px solid",
                                      borderColor: isCorrect ? "#86efac" : "#e0e7ff",
                                      bgcolor: isCorrect ? "#f0fdf4" : "#f8f9ff",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 1,
                                        bgcolor: isCorrect ? "#16a34a" : "#1e3c72",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Typography fontSize={11} fontWeight={700} color="white">
                                        {opt}
                                      </Typography>
                                    </Box>
                                    <Typography fontSize={13} fontWeight={isCorrect ? 600 : 400}>
                                      {val}
                                    </Typography>
                                    {isCorrect && (
                                      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "#16a34a", ml: "auto" }} />
                                    )}
                                  </Box>
                                </Grid>
                              );
                            })}
                        </Grid>

                        {/* Correct answer */}
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 2,
                            py: 0.6,
                            borderRadius: 2,
                            bgcolor: "#f0fdf4",
                            border: "1px solid #86efac",
                          }}
                        >
                          <CheckCircleRoundedIcon sx={{ fontSize: 15, color: "#16a34a" }} />
                          <Typography fontSize={13} fontWeight={700} color="#166534">
                            Correct: {q.correctAnswers}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog
  open={open}
  onClose={() => setOpen(false)}
  maxWidth="md"
  fullWidth
  PaperProps={{ sx: { borderRadius: 3 } }}
>
  <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
    Edit Question
  </DialogTitle>

  <Divider />

  <DialogContent sx={{ pt: 3 }}>
    {editingQuestion && (
      <Stack spacing={3}>

        {/* ✅ QUESTION TEXT */}
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Question Text"
          value={editingQuestion.text}
          onChange={(e) =>
            setEditingQuestion({
              ...editingQuestion,
              text: e.target.value
            })
          }
        />

        {/* ✅ TYPE */}
        <TextField
          select
          fullWidth
          label="Question Type"
          value={editingQuestion.type}
          onChange={(e) =>
            setEditingQuestion({
              ...editingQuestion,
              type: Number(e.target.value)
            })
          }
        >
          <MenuItem value={1}>📝 Single Choice</MenuItem>
          <MenuItem value={2}>☑️ Multi Select</MenuItem>
          <MenuItem value={3}>✅ True / False</MenuItem>
          <MenuItem value={4}>💻 Coding</MenuItem>
        </TextField>

        {/* ✅ CODING UI */}
        {editingQuestion.type === 4 ? (

          <Stack spacing={2}>

            {/* Starter Code */}
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Starter Code"
              value={editingQuestion.starterCode || ""}
              onChange={(e) =>
                setEditingQuestion({
                  ...editingQuestion,
                  starterCode: e.target.value
                })
              }
            />

            {/* Test Cases */}
            <Typography fontWeight={600}>Test Cases</Typography>

            {(editingQuestion.testCases || []).map((tc, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #eee",
                  borderRadius: 2,
                  p: 2
                }}
              >
                <Stack spacing={2}>

                  <TextField
                    label="Input"
                    fullWidth
                    value={tc.input}
                    onChange={(e) => {
                      const updated = [...editingQuestion.testCases];
                      updated[index].input = e.target.value;
                      setEditingQuestion({
                        ...editingQuestion,
                        testCases: updated
                      });
                    }}
                  />

                  <TextField
                    label="Expected Output"
                    fullWidth
                    value={tc.expectedOutput}
                    onChange={(e) => {
                      const updated = [...editingQuestion.testCases];
                      updated[index].expectedOutput = e.target.value;
                      setEditingQuestion({
                        ...editingQuestion,
                        testCases: updated
                      });
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tc.isHidden}
                        onChange={(e) => {
                          const updated = [...editingQuestion.testCases];
                          updated[index].isHidden = e.target.checked;
                          setEditingQuestion({
                            ...editingQuestion,
                            testCases: updated
                          });
                        }}
                      />
                    }
                    label="Hidden Test Case"
                  />

                  <Button
                    color="error"
                    onClick={() => {
                      const updated = editingQuestion.testCases.filter((_, i) => i !== index);
                      setEditingQuestion({
                        ...editingQuestion,
                        testCases: updated
                      });
                    }}
                  >
                    Remove
                  </Button>

                </Stack>
              </Box>
            ))}

            {/* Add Test Case */}
            <Button
              variant="outlined"
              onClick={() =>
                setEditingQuestion({
                  ...editingQuestion,
                  testCases: [
                    ...(editingQuestion.testCases || []),
                    { input: "", expectedOutput: "", isHidden: false }
                  ]
                })
              }
            >
              Add Test Case
            </Button>

          </Stack>

        ) : editingQuestion.type === 3 ? (

          /* ✅ TRUE/FALSE */
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth value="True" disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth value="False" disabled />
            </Grid>
          </Grid>

        ) : (

          /* ✅ OPTIONS */
          <Grid container spacing={2}>
            {["A", "B", "C", "D"].map((opt) => (
              <Grid item xs={6} key={opt}>
                <TextField
                  fullWidth
                  label={`Option ${opt}`}
                  value={editingQuestion[`option${opt}`] || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      [`option${opt}`]: e.target.value
                    })
                  }
                />
              </Grid>
            ))}
          </Grid>

        )}

        {/* ✅ CORRECT ANSWER (ONLY NON-CODING) */}
        {editingQuestion.type !== 4 && (
          <TextField
            fullWidth
            label={
              editingQuestion.type === 2
                ? "Correct Answers (e.g. A,C)"
                : "Correct Answer (e.g. A)"
            }
            value={editingQuestion.correctAnswers || ""}
            onChange={(e) =>
              setEditingQuestion({
                ...editingQuestion,
                correctAnswers: e.target.value.toUpperCase()
              })
            }
            helperText={
              editingQuestion.type === 2
                ? "Separate multiple answers with comma"
                : ""
            }
          />
        )}

      </Stack>
    )}
  </DialogContent>

  <Divider />

  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button onClick={() => setOpen(false)}>
      Cancel
    </Button>

    <Button variant="contained" onClick={handleUpdate}>
      Save Changes
    </Button>
  </DialogActions>
</Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Question?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently remove this question from the assessment. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ borderRadius: 2, textTransform: "none", color: "text.secondary" }}>
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

export default ManageQuestions;