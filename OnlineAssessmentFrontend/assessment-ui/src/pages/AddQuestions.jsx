import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assessmentApi from "../api/assessmentApi";

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  MenuItem,
  Chip,
  Stack,
  InputAdornment,
  Paper,
  CircularProgress,
} from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LibraryAddRoundedIcon from "@mui/icons-material/LibraryAddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const TYPE_LABELS = { 1: "Single Choice", 2: "Multiple Choice", 3: "True / False" };
const TYPE_COLORS = { 1: "primary", 2: "secondary", 3: "warning" };

function AddQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("new");
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState(new Set());

  const initialQuestion = {
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    type: 1,
  };

  const [question, setQuestion] = useState(initialQuestion);

  useEffect(() => {
    if (mode === "existing") {
      setFetchingQuestions(true);
      assessmentApi
        .get("/questions")
        .then((res) => setAllQuestions(res.data || []))
        .catch(() => toast.error("Error fetching questions"))
        .finally(() => setFetchingQuestions(false));
    }
  }, [mode]);

  const handleChange = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!question.questionText.trim()) { toast.error("Question text required"); return false; }
    if (question.type !== 3) {
      if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
        toast.error("All options required"); return false;
      }
    }
    if (question.type === 1 && !["A", "B", "C", "D"].includes(question.correctAnswer)) {
      toast.error("Answer must be A/B/C/D"); return false;
    }
    if (question.type === 2 && !question.correctAnswer.includes(",")) {
      toast.error("Use comma for multiple answers (A,B)"); return false;
    }
    if (question.type === 3 && !["A", "B"].includes(question.correctAnswer)) {
      toast.error("A=True, B=False"); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        text: question.questionText,
        type: Number(question.type),
        optionA: question.type === 3 ? "True" : question.optionA,
        optionB: question.type === 3 ? "False" : question.optionB,
        optionC: question.type === 3 ? "" : question.optionC,
        optionD: question.type === 3 ? "" : question.optionD,
        correctAnswers: question.correctAnswer,
      };

      const res = await assessmentApi.post("/questions", payload);
      const questionId = res.data.id || res.data.questionId;

      await assessmentApi.post("/assessment-questions", {
        assessmentId: Number(id),
        questionId,
      });

      toast.success("Question added successfully!");
      setQuestion(initialQuestion);
    } catch (err) {
      toast.error("Error adding question");
    } finally {
      setLoading(false);
    }
  };

  const addExistingQuestion = async (qid) => {
    try {
      await assessmentApi.post("/assessment-questions", {
        assessmentId: Number(id),
        questionId: qid,
      });
      setAddedIds((prev) => new Set([...prev, qid]));
      toast.success("Added to assessment!");
    } catch {
      toast.error("Error adding question");
    }
  };

  // Filter existing questions by search
  const filteredQuestions = allQuestions.filter((q) =>
    q.text?.toLowerCase().includes(search.toLowerCase())
  );

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
                Add Questions
              </Typography>
              <Typography sx={{ opacity: 0.75, mt: 0.5, fontSize: 14 }}>
                Assessment ID: {id} · Step 2 of 2
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={1000} mx="auto" px={3} pb={6}>

        {/* Mode Toggle */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            gap: 0,
            borderRadius: 2.5,
            border: "1px solid #e0e7ff",
            overflow: "hidden",
            mb: 4,
            width: "fit-content",
          }}
        >
          {[
            { key: "new", label: "Create New Question", icon: <AddRoundedIcon sx={{ fontSize: 18 }} /> },
            { key: "existing", label: "Use Existing Question", icon: <LibraryAddRoundedIcon sx={{ fontSize: 18 }} /> },
          ].map((m) => (
            <Button
              key={m.key}
              startIcon={m.icon}
              onClick={() => setMode(m.key)}
              sx={{
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 0,
                bgcolor: mode === m.key ? "linear-gradient(135deg, #1e3c72, #2a5298)" : "white",
                background: mode === m.key ? "linear-gradient(135deg, #1e3c72, #2a5298)" : "white",
                color: mode === m.key ? "white" : "text.secondary",
                "&:hover": {
                  background: mode === m.key
                    ? "linear-gradient(135deg, #1e3c72, #2a5298)"
                    : "#f8f9ff",
                },
              }}
            >
              {m.label}
            </Button>
          ))}
        </Paper>

        {/* ── NEW QUESTION FORM ── */}
        {mode === "new" && (
          <Paper
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}
          >
            {/* Form header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: "1px solid #f0f2f8",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#f8f9ff",
              }}
            >
              <AddRoundedIcon sx={{ color: "#1e3c72", fontSize: 20 }} />
              <Typography fontWeight={700} color="#1e3c72">
                New Question
              </Typography>
              <Chip
                label={TYPE_LABELS[question.type]}
                size="small"
                color={TYPE_COLORS[question.type]}
                variant="outlined"
                sx={{ fontSize: 11, fontWeight: 600, ml: "auto" }}
              />
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>

                {/* Question text */}
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Question Text"
                  name="questionText"
                  value={question.questionText}
                  onChange={handleChange}
                  placeholder="Enter your question here..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                {/* Type selector */}
                <TextField
                  select
                  fullWidth
                  label="Question Type"
                  name="type"
                  value={question.type}
                  onChange={handleChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  <MenuItem value={1}>📝 Single Choice</MenuItem>
                  <MenuItem value={2}>☑️ Multiple Choice</MenuItem>
                  <MenuItem value={3}>✅ True / False</MenuItem>
                </TextField>

                {/* Options */}
                <Box>
                  <Typography fontWeight={600} fontSize={14} color="text.secondary" mb={1.5}>
                    Answer Options
                  </Typography>

                  {question.type === 3 ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Option A"
                          value="True"
                          disabled
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f0fdf4" },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Option B"
                          value="False"
                          disabled
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fef2f2" },
                          }}
                        />
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
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Box
                                    sx={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 1,
                                      bgcolor: "#1e3c72",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Typography fontSize={11} fontWeight={700} color="white">
                                      {opt}
                                    </Typography>
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

                {/* Correct answer */}
                <TextField
                  fullWidth
                  label={
                    question.type === 1 ? "Correct Answer (e.g. A)"
                    : question.type === 2 ? "Correct Answers (e.g. A,C)"
                    : "Correct Answer (A = True, B = False)"
                  }
                  name="correctAnswer"
                  value={question.correctAnswer}
                  onChange={(e) =>
                    setQuestion({ ...question, correctAnswer: e.target.value.toUpperCase() })
                  }
                  placeholder={
                    question.type === 2 ? "A,C" : "A"
                  }
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  helperText={
                    question.type === 2
                      ? "Separate multiple correct answers with a comma (e.g. A,C)"
                      : question.type === 3
                      ? "Enter A for True, B for False"
                      : "Enter the letter of the correct option"
                  }
                />

                {/* Action buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}>
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
                    sx={{
                      background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                    }}
                  >
                    {loading ? "Adding..." : "Add Question"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        )}

        {/* ── EXISTING QUESTIONS ── */}
        {mode === "existing" && (
          <Box>
            {/* Search bar */}
            <TextField
              fullWidth
              placeholder="Search questions..."
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
                    <SearchRoundedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Result count */}
            <Typography variant="body2" color="text.secondary" mb={2}>
              {fetchingQuestions
                ? "Loading questions..."
                : `${filteredQuestions.length} question${filteredQuestions.length !== 1 ? "s" : ""} found`
              }
            </Typography>

            {fetchingQuestions ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : filteredQuestions.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ borderRadius: 3, textAlign: "center", py: 6, border: "2px dashed #c5cae9" }}
              >
                <QuizRoundedIcon sx={{ fontSize: 48, color: "#c5cae9", mb: 1 }} />
                <Typography color="text.secondary">
                  {search ? "No questions match your search." : "No questions available."}
                </Typography>
                {search && (
                  <Button size="small" sx={{ mt: 1.5, textTransform: "none" }} onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                )}
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredQuestions.map((q, index) => {
                  const isAdded = addedIds.has(q.id);
                  return (
                    <Paper
                      key={q.id}
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: isAdded ? "1.5px solid #86efac" : "1px solid #e0e7ff",
                        overflow: "hidden",
                        transition: "all 0.2s",
                        bgcolor: isAdded ? "#f0fdf4" : "white",
                        "&:hover": {
                          boxShadow: "0 4px 16px rgba(30,60,114,0.1)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>

                          {/* Left */}
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Typography fontWeight={700} color="white" fontSize={12}>
                                {String(index + 1).padStart(2, "0")}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography fontWeight={600} fontSize={14} mb={0.8}>
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

                          {/* Right — Add button */}
                          <Button
                            size="small"
                            variant={isAdded ? "outlined" : "contained"}
                            color={isAdded ? "success" : "primary"}
                            startIcon={isAdded ? <CheckCircleRoundedIcon /> : <AddRoundedIcon />}
                            onClick={() => !isAdded && addExistingQuestion(q.id)}
                            disabled={isAdded}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: 13,
                              flexShrink: 0,
                              background: isAdded ? "transparent" : "linear-gradient(135deg, #1e3c72, #2a5298)",
                              boxShadow: "none",
                            }}
                          >
                            {isAdded ? "Added" : "Add"}
                          </Button>
                        </Box>
                      </CardContent>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AddQuestions;