import { useState, useEffect } from "react";
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
  Tab,
  Tabs,
  Alert,
} from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LibraryAddRoundedIcon from "@mui/icons-material/LibraryAddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const TYPE_LABELS = { 1: "Single", 2: "Multi", 3: "T/F", 4: "Coding" };
const TYPE_COLORS = { 1: "primary", 2: "secondary", 3: "warning", 4: "info" };

function AddQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── Tab state ── */
  const [tab, setTab] = useState(0); // 0 = New, 1 = Existing

  /* ── New question state ── */
  const initialQuestion = {
    questionText: "",
    optionA: "", optionB: "", optionC: "", optionD: "",
    correctAnswer: "",
    type: 1,
    starterCode: "",
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  };
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);

  /* ── Existing questions state ── */
  const [allQuestions, setAllQuestions] = useState([]);
  const [fetchingQ, setFetchingQ] = useState(false);
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState(new Set());
  const [addingId, setAddingId] = useState(null);

  /* ── Fetch all questions when tab switches to Existing ── */
  useEffect(() => {
    if (tab === 1 && allQuestions.length === 0) {
      fetchAllQuestions();
    }
  }, [tab]);

  const fetchAllQuestions = async () => {
    setFetchingQ(true);
    try {
      const res = await assessmentApi.get("/questions");
      setAllQuestions(res.data || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setFetchingQ(false);
    }
  };

  /* ── Existing question handlers ── */
  const handleAddExisting = async (questionId) => {
    setAddingId(questionId);
    try {
      await assessmentApi.post("/assessment-questions", {
        assessmentId: Number(id),
        questionId,
      });
      setAddedIds((prev) => new Set([...prev, questionId]));
      toast.success("Question added to assessment!");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Already added or error occurred";
      toast.error(msg);
    } finally {
      setAddingId(null);
    }
  };

  const filteredQuestions = allQuestions.filter((q) =>
    (q.text || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ── New question handlers ── */
  const handleChange = (e) =>
    setQuestion({ ...question, [e.target.name]: e.target.value });

  const addTestCase = () =>
    setQuestion((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", expectedOutput: "", isHidden: false }],
    }));

  const removeTestCase = (index) =>
    setQuestion((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));

  const updateTestCase = (index, field, value) =>
    setQuestion((prev) => {
      const updated = [...prev.testCases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testCases: updated };
    });

  const validate = () => {
    if (!question.questionText.trim()) { toast.error("Question text required"); return false; }
    if (question.type !== 3 && question.type !== 4) {
      if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
        toast.error("All options required"); return false;
      }
    }
    if (question.type === 4) {
      if (!question.starterCode.trim()) { toast.error("Starter code required"); return false; }
      if (question.testCases.length === 0) { toast.error("At least one test case required"); return false; }
      for (let i = 0; i < question.testCases.length; i++) {
        if (!question.testCases[i].expectedOutput.trim()) {
          toast.error(`Test case ${i + 1}: Expected output required`); return false;
        }
      }
      return true;
    }
    if (question.type === 1 && !["A","B","C","D"].includes(question.correctAnswer)) { toast.error("Answer must be A/B/C/D"); return false; }
    if (question.type === 2 && !question.correctAnswer.includes(",")) { toast.error("Use comma for multiple answers (A,B)"); return false; }
    if (question.type === 3 && !["A","B"].includes(question.correctAnswer)) { toast.error("A=True, B=False"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
  text: question.questionText.trim(),
  type: Number(question.type),
};

// ✅ MCQ / T/F
if (question.type !== 4) {
  payload.optionA = question.type === 3 ? "True" : question.optionA.trim();
  payload.optionB = question.type === 3 ? "False" : question.optionB.trim();
  payload.optionC = question.type === 3 ? "" : question.optionC.trim();
  payload.optionD = question.type === 3 ? "" : question.optionD.trim();
  payload.correctAnswers = question.correctAnswer;
}

// ✅ Coding
if (question.type === 4) {
  payload.starterCode = question.starterCode.trim();
  payload.testCases = question.testCases;
}
console.log(payload);
      const res = await assessmentApi.post("/questions", payload);
      const questionId = res.data.id || res.data.questionId;

      await assessmentApi.post("/assessment-questions", {
        assessmentId: Number(id),
        questionId,
      });

      toast.success("Question added!");
      setQuestion(initialQuestion);
    } catch {
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
              <QuizRoundedIcon sx={{ fontSize: 30, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>Add Questions</Typography>
              {/* <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>Assessment ID: {id}</Typography> */}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={900} mx="auto" px={3} pb={6}>

        {/* Tab switcher */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", mb: 3, overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 14, py: 1.8 },
              "& .MuiTabs-indicator": { background: "linear-gradient(135deg, #1e3c72, #2a5298)", height: 3 },
              "& .Mui-selected": { color: "#1e3c72 !important" },
              borderBottom: "1px solid #e0e7ff",
            }}
          >
            <Tab icon={<AddRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Create New Question" />
            <Tab icon={<LibraryAddRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Use Existing Question" />
          </Tabs>
        </Paper>

        {/* ════════════ TAB 0 — CREATE NEW ════════════ */}
        {tab === 0 && (
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f0f2f8", bgcolor: "#f8f9ff", display: "flex", alignItems: "center", gap: 1.5 }}>
              {isCoding ? <CodeRoundedIcon sx={{ color: "#1e3c72", fontSize: 20 }} /> : <QuizRoundedIcon sx={{ color: "#1e3c72", fontSize: 20 }} />}
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

                <TextField
                  fullWidth multiline minRows={2}
                  label="Question Text"
                  name="questionText"
                  value={question.questionText}
                  onChange={handleChange}
                  placeholder="Enter your question here..."
                  sx={fieldSx}
                />

                <TextField select fullWidth label="Question Type" name="type" value={question.type} onChange={handleChange} sx={fieldSx}>
                  <MenuItem value={1}>📝 Single Choice</MenuItem>
                  <MenuItem value={2}>☑️ Multiple Choice</MenuItem>
                  <MenuItem value={3}>✅ True / False</MenuItem>
                  <MenuItem value={4}>💻 Coding</MenuItem>
                </TextField>

                {/* MCQ Options */}
                {!isCoding && (
                  <>
                    <Box>
                      <Typography fontWeight={600} fontSize={14} color="text.secondary" mb={1.5}>Answer Options</Typography>
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
                          {["A","B","C","D"].map((opt) => (
                            <Grid item xs={6} key={opt}>
                              <TextField
                                fullWidth label={`Option ${opt}`} name={`option${opt}`}
                                value={question[`option${opt}`]} onChange={handleChange} sx={fieldSx}
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
                      label={question.type === 1 ? "Correct Answer (e.g. A)" : question.type === 2 ? "Correct Answers (e.g. A,C)" : "Correct Answer (A = True, B = False)"}
                      name="correctAnswer"
                      value={question.correctAnswer}
                      onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value.toUpperCase() })}
                      helperText={question.type === 2 ? "Separate multiple correct answers with a comma" : ""}
                      sx={fieldSx}
                    />
                  </>
                )}

                {/* Coding Fields */}
                {isCoding && (
                  <>
                    <Box>
                      <Typography fontWeight={600} fontSize={14} color="text.secondary" mb={1}>Starter Code</Typography>
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

                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box>
                          <Typography fontWeight={700} fontSize={15}>Test Cases</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Hidden cases are not shown to candidates but still evaluated.
                          </Typography>
                        </Box>
                        <Button
                          size="small" variant="outlined" startIcon={<AddRoundedIcon />}
                          onClick={addTestCase}
                          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#e0e7ff", color: "#1e3c72", "&:hover": { bgcolor: "#eef2ff" } }}
                        >
                          Add Case
                        </Button>
                      </Box>

                      <Stack spacing={2}>
                        {question.testCases.map((tc, index) => (
                          <Paper key={index} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${tc.isHidden ? "#fde047" : "#e0e7ff"}`, overflow: "hidden" }}>
                            <Box sx={{ px: 2, py: 1, bgcolor: tc.isHidden ? "#fefce8" : "#f8f9ff", borderBottom: `1px solid ${tc.isHidden ? "#fde047" : "#e0e7ff"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Typography fontWeight={700} fontSize={13} color={tc.isHidden ? "#854d0e" : "#1e3c72"}>
                                  Case {index + 1}
                                </Typography>
                                {tc.isHidden && <Chip label="Hidden" size="small" color="warning" sx={{ fontSize: 10, fontWeight: 700, height: 18 }} />}
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FormControlLabel
                                  control={<Switch size="small" checked={tc.isHidden} onChange={(e) => updateTestCase(index, "isHidden", e.target.checked)} color="warning" />}
                                  label={<Typography fontSize={12} color="text.secondary">Hidden</Typography>}
                                  sx={{ mr: 0 }}
                                />
                                {question.testCases.length > 1 && (
                                  <IconButton size="small" onClick={() => removeTestCase(index)} sx={{ color: "error.main", "&:hover": { bgcolor: "#fff5f5" } }}>
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" label="Input" value={tc.input}
                                    onChange={(e) => updateTestCase(index, "input", e.target.value)}
                                    placeholder="e.g. 5" helperText="Empty if no input needed" sx={fieldSx} />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField fullWidth size="small" label="Expected Output *" value={tc.expectedOutput}
                                    onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                                    placeholder="e.g. 25" helperText="Exact output to match" sx={fieldSx} />
                                </Grid>
                              </Grid>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>

                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <Chip label={`${question.testCases.length} total`} size="small" sx={{ fontSize: 11 }} />
                        <Chip label={`${question.testCases.filter((tc) => !tc.isHidden).length} visible`} size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
                        <Chip label={`${question.testCases.filter((tc) => tc.isHidden).length} hidden`} size="small" color="warning" variant="outlined" sx={{ fontSize: 11 }} />
                      </Box>
                    </Box>
                  </>
                )}

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" onClick={() => navigate("/manage-assessments")} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                    Finish Later
                  </Button>
                  <Button
                    variant="contained" onClick={handleSubmit} disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}
                    sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
                  >
                    {loading ? "Adding..." : "Add Question"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        )}

        {/* ════════════ TAB 1 — USE EXISTING ════════════ */}
        {tab === 1 && (
          <Box>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search questions by text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ mb: 2, bgcolor: "white", borderRadius: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="body2" color="text.secondary" mb={2}>
              {fetchingQ ? "Loading..." : `${filteredQuestions.length} question${filteredQuestions.length !== 1 ? "s" : ""} found`}
              {addedIds.size > 0 && ` · ${addedIds.size} added to this assessment`}
            </Typography>

            {fetchingQ ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : filteredQuestions.length === 0 ? (
              <Paper variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6, border: "2px dashed #c5cae9" }}>
                <QuizRoundedIcon sx={{ fontSize: 48, color: "#c5cae9", mb: 1 }} />
                <Typography color="text.secondary">
                  {search ? "No questions match your search." : "No questions available."}
                </Typography>
                {search && (
                  <Button size="small" sx={{ mt: 1, textTransform: "none" }} onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                )}
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredQuestions.map((q, index) => {
                  const isAdded = addedIds.has(q.id);
                  const isAdding = addingId === q.id;

                  return (
                    <Paper
                      key={q.id}
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: `1px solid ${isAdded ? "#86efac" : "#e0e7ff"}`,
                        bgcolor: isAdded ? "#f0fdf4" : "white",
                        transition: "all 0.2s",
                        "&:hover": { boxShadow: isAdded ? "none" : "0 4px 16px rgba(30,60,114,0.08)", transform: isAdded ? "none" : "translateY(-1px)" },
                      }}
                    >
                      <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>

                        {/* Left — question info */}
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                              background: isAdded ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(135deg, #1e3c72, #2a5298)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <Typography fontWeight={800} color="white" fontSize={12}>
                              {String(index + 1).padStart(2, "0")}
                            </Typography>
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={600} fontSize={14} mb={0.5} sx={{ wordBreak: "break-word" }}>
                              {q.text}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              <Chip
                                label={TYPE_LABELS[q.type] || "Question"}
                                size="small"
                                color={TYPE_COLORS[q.type] || "default"}
                                variant="outlined"
                                sx={{ fontSize: 10, fontWeight: 600, height: 20 }}
                              />
                              {/* Show options preview for MCQ */}
                              {q.type !== 4 && q.optionA && (
                                <Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center" }}>
                                  {q.optionA} / {q.optionB}{q.optionC ? ` / ${q.optionC}` : ""}
                                  {q.optionD ? ` / ${q.optionD}` : ""}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Right — Add button */}
                        <Button
                          size="small"
                          variant={isAdded ? "outlined" : "contained"}
                          color={isAdded ? "success" : "primary"}
                          startIcon={
                            isAdding
                              ? <CircularProgress size={14} color="inherit" />
                              : isAdded
                              ? <CheckCircleRoundedIcon />
                              : <AddRoundedIcon />
                          }
                          disabled={isAdded || isAdding}
                          onClick={() => handleAddExisting(q.id)}
                          sx={{
                            borderRadius: 2, textTransform: "none", fontWeight: 600,
                            fontSize: 13, flexShrink: 0,
                            background: isAdded ? "transparent" : "linear-gradient(135deg, #1e3c72, #2a5298)",
                            boxShadow: "none",
                            minWidth: 90,
                          }}
                        >
                          {isAdding ? "Adding..." : isAdded ? "Added" : "Add"}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
            {/* Done button */}
            {addedIds.size > 0 && (
              <Box sx={{ mt: 3 }}>
                <Alert
                  severity="success"
                  sx={{ borderRadius: 2, mb: 2 }}
                  action={
                    <Button size="small" color="success" onClick={() => navigate("/manage-assessments")} sx={{ textTransform: "none", fontWeight: 600 }}>
                      Done
                    </Button>
                  }
                >
                  {addedIds.size} question{addedIds.size !== 1 ? "s" : ""} added to this assessment.
                </Alert>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AddQuestions;