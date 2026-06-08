import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assessmentApi from "../api/assessmentApi";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";

function AddQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialQuestion = {
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    type: 1,
    starterCode: "",
    // ✅ Multiple test cases instead of single input/expectedOutput
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  };

  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };

  /* ---------------- TEST CASE HANDLERS ---------------- */
  const addTestCase = () => {
    setQuestion((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", expectedOutput: "", isHidden: false }],
    }));
  };

  const removeTestCase = (index) => {
    setQuestion((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const updateTestCase = (index, field, value) => {
    setQuestion((prev) => {
      const updated = [...prev.testCases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testCases: updated };
    });
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (!question.questionText.trim()) {
      toast.error("Question text required");
      return false;
    }

    if (question.type !== 3 && question.type !== 4) {
      if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
        toast.error("All options required");
        return false;
      }
    }

    if (question.type === 4) {
      if (!question.starterCode.trim()) {
        toast.error("Starter code is required");
        return false;
      }
      if (question.testCases.length === 0) {
        toast.error("At least one test case is required");
        return false;
      }
      for (let i = 0; i < question.testCases.length; i++) {
        const tc = question.testCases[i];
        if (!tc.expectedOutput.trim()) {
          toast.error(`Test case ${i + 1}: Expected output is required`);
          return false;
        }
      }
      return true;
    }

    if (question.type === 1 && !["A", "B", "C", "D"].includes(question.correctAnswer)) {
      toast.error("Answer must be A/B/C/D");
      return false;
    }
    if (question.type === 2 && !question.correctAnswer.includes(",")) {
      toast.error("Use comma for multiple answers (A,B)");
      return false;
    }
    if (question.type === 3 && !["A", "B"].includes(question.correctAnswer)) {
      toast.error("A=True, B=False");
      return false;
    }

    return true;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        text: question.questionText,
        type: Number(question.type),
        optionA: question.type === 3 ? "True" : question.optionA,
        optionB: question.type === 3 ? "False" : question.optionB,
        optionC: question.type === 3 ? "" : question.optionC,
        optionD: question.type === 3 ? "" : question.optionD,
        correctAnswers: question.type === 4 ? null : question.correctAnswer,
        starterCode: question.type === 4 ? question.starterCode : null,
        // ✅ Send test cases array
        testCases: question.type === 4 ? question.testCases : null,
      };

      const res = await assessmentApi.post("/questions", payload);
      const questionId = res.data.id || res.data.questionId;

      await assessmentApi.post("/assessment-questions", {
        assessmentId: Number(id),
        questionId,
      });

      toast.success("Question added!");
      setQuestion(initialQuestion);
    } catch (err) {
      toast.error("Error adding question");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };
  const isCoding = question.type === 4;

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", px: 4, py: 5, color: "white", mb: 4 }}>
        <Box maxWidth={900} mx="auto">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/manage-assessments")}
            sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", mb: 2, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "white" } }}
          >
            Back to Assessments
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
              {isCoding
                ? <CodeRoundedIcon sx={{ fontSize: 30, color: "white" }} />
                : <QuizRoundedIcon sx={{ fontSize: 30, color: "white" }} />
              }
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>Add Question</Typography>
              <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                Assessment ID: {id}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={900} mx="auto" px={3} pb={6}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}>

          {/* Form header */}
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f0f2f8", bgcolor: "#f8f9ff", display: "flex", alignItems: "center", gap: 1.5 }}>
            {isCoding
              ? <CodeRoundedIcon sx={{ color: "#1e3c72", fontSize: 20 }} />
              : <QuizRoundedIcon sx={{ color: "#1e3c72", fontSize: 20 }} />
            }
            <Typography fontWeight={700} color="#1e3c72">
              {isCoding ? "Coding Question" : "MCQ Question"}
            </Typography>
            <Chip
              label={isCoding ? "Coding" : question.type === 1 ? "Single Choice" : question.type === 2 ? "Multiple Choice" : "True / False"}
              size="small"
              color={isCoding ? "info" : "primary"}
              variant="outlined"
              sx={{ fontSize: 11, fontWeight: 600, ml: "auto" }}
            />
          </Box>

          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>

              {/* Question text */}
              <TextField
                fullWidth multiline minRows={2}
                label="Question Text"
                name="questionText"
                value={question.questionText}
                onChange={handleChange}
                placeholder="Enter your question here..."
                sx={fieldSx}
              />

              {/* Type selector */}
              <TextField
                select fullWidth
                label="Question Type"
                name="type"
                value={question.type}
                onChange={handleChange}
                sx={fieldSx}
              >
                <MenuItem value={1}>📝 Single Choice</MenuItem>
                <MenuItem value={2}>☑️ Multiple Choice</MenuItem>
                <MenuItem value={3}>✅ True / False</MenuItem>
                <MenuItem value={4}>💻 Coding</MenuItem>
              </TextField>

              {/* ── MCQ OPTIONS ── */}
              {!isCoding && (
                <>
                  <Box>
                    <Typography fontWeight={600} fontSize={14} color="text.secondary" mb={1.5}>
                      Answer Options
                    </Typography>
                    {question.type === 3 ? (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Option A" value="True" disabled sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f0fdf4" } }} />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Option B" value="False" disabled sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fef2f2" } }} />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        {["A", "B", "C", "D"].map((opt) => (
                          <Grid item xs={6} key={opt}>
                            <TextField
                              fullWidth
                              label={`Option ${opt}`}
                              name={`option${opt}`}
                              value={question[`option${opt}`]}
                              onChange={handleChange}
                              sx={fieldSx}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Box sx={{ width: 22, height: 22, borderRadius: 1, bgcolor: "#1e3c72", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Typography fontSize={11} fontWeight={700} color="white">{opt}</Typography>
                                    </Box>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>

                  <Divider />

                  <TextField
                    fullWidth
                    label={
                      question.type === 1 ? "Correct Answer (e.g. A)"
                      : question.type === 2 ? "Correct Answers (e.g. A,C)"
                      : "Correct Answer (A = True, B = False)"
                    }
                    name="correctAnswer"
                    value={question.correctAnswer}
                    onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value.toUpperCase() })}
                    helperText={question.type === 2 ? "Separate multiple correct answers with a comma" : ""}
                    sx={fieldSx}
                  />
                </>
              )}

              {/* ── CODING FIELDS ── */}
              {isCoding && (
                <>
                  {/* Starter code */}
                  <Box>
                    <Typography fontWeight={600} fontSize={14} color="text.secondary" mb={1}>
                      Starter Code
                    </Typography>
                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e0e7ff" }}>
                      <Box sx={{ px: 2, py: 1, bgcolor: "#1e2d3d", display: "flex", alignItems: "center", gap: 1 }}>
                        <CodeRoundedIcon sx={{ fontSize: 14, color: "#64748b" }} />
                        <Typography fontSize={12} color="#64748b" fontFamily="monospace">solution.py</Typography>
                      </Box>
                      <Box
                        component="textarea"
                        name="starterCode"
                        value={question.starterCode}
                        onChange={handleChange}
                        placeholder="# Write starter code here..."
                        spellCheck={false}
                        sx={{ width: "100%", minHeight: 160, p: 2, bgcolor: "#0f172a", color: "#e2e8f0", fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 13, lineHeight: 1.7, border: "none", outline: "none", resize: "vertical", boxSizing: "border-box", display: "block" }}
                      />
                    </Box>
                  </Box>

                  <Divider />

                  {/* Test cases */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Box>
                        <Typography fontWeight={700} fontSize={15}>Test Cases</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add multiple test cases. Hidden cases are not shown to candidates.
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddRoundedIcon />}
                        onClick={addTestCase}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#e0e7ff", color: "#1e3c72", "&:hover": { bgcolor: "#eef2ff" } }}
                      >
                        Add Test Case
                      </Button>
                    </Box>

                    <Stack spacing={2}>
                      {question.testCases.map((tc, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{ borderRadius: 2, border: `1px solid ${tc.isHidden ? "#fde047" : "#e0e7ff"}`, overflow: "hidden" }}
                        >
                          {/* Test case header */}
                          <Box sx={{ px: 2, py: 1, bgcolor: tc.isHidden ? "#fefce8" : "#f8f9ff", borderBottom: `1px solid ${tc.isHidden ? "#fde047" : "#e0e7ff"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Typography fontWeight={700} fontSize={13} color={tc.isHidden ? "#854d0e" : "#1e3c72"}>
                                Case {index + 1}
                              </Typography>
                              {tc.isHidden && (
                                <Chip label="Hidden" size="small" color="warning" sx={{ fontSize: 10, fontWeight: 700, height: 18 }} />
                              )}
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={tc.isHidden}
                                    onChange={(e) => updateTestCase(index, "isHidden", e.target.checked)}
                                    color="warning"
                                  />
                                }
                                label={<Typography fontSize={12} color="text.secondary">Hidden</Typography>}
                                sx={{ mr: 0 }}
                              />
                              {question.testCases.length > 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => removeTestCase(index)}
                                  sx={{ color: "error.main", "&:hover": { bgcolor: "#fff5f5" } }}
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          {/* Test case fields */}
                          <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Input"
                                  value={tc.input}
                                  onChange={(e) => updateTestCase(index, "input", e.target.value)}
                                  placeholder="e.g. 5"
                                  helperText="Leave empty if no input needed"
                                  sx={fieldSx}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Expected Output *"
                                  value={tc.expectedOutput}
                                  onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                                  placeholder="e.g. 25"
                                  helperText="Exact output your code should produce"
                                  sx={fieldSx}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>

                    {/* Summary */}
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Chip
                        label={`${question.testCases.length} total`}
                        size="small"
                        sx={{ fontSize: 11 }}
                      />
                      <Chip
                        label={`${question.testCases.filter((tc) => !tc.isHidden).length} visible`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                      <Chip
                        label={`${question.testCases.filter((tc) => tc.isHidden).length} hidden`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    </Box>
                  </Box>
                </>
              )}

              <Divider />

              {/* Action buttons */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/manage-assessments")}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Finish Later
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}
                  sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
                >
                  {loading ? "Adding..." : "Add Question"}
                </Button>
              </Box>

            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default AddQuestions;