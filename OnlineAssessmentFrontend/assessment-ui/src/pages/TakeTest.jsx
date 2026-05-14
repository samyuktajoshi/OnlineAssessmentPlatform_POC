import { useEffect, useState, useCallback } from "react";
import submissionApi from "../api/submissionApi";
import assessmentApi from "../api/assessmentApi";
import resultApi from "../api/resultApi";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Stack,
  LinearProgress,
  Checkbox,
  Chip,
  Paper,
  Divider,
} from "@mui/material";

import AccessAlarmRoundedIcon from "@mui/icons-material/AccessAlarmRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

function TakeTest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          assessmentApi.get(`/questions/assessment/${id}`),
          assessmentApi.get(`/assessments/${id}`),
        ]);

        setQuestions(qRes.data || []);
        const duration =
          (aRes.data.durationMinutes || aRes.data.duration || 10) * 60;

        setTimeLeft(duration);
        setTotalTime(duration);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  /* ---------------- AUTO SUBMIT ---------------- */
  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0 && !submitting) {
      handleSubmit();
    }
  }, [timeLeft]);

  /* ---------------- SINGLE SELECT ---------------- */
  const handleSelect = (qid, option) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  /* ---------------- MULTI SELECT ---------------- */
  const handleMultiSelect = (qid, option, checked) => {
    setAnswers((prev) => {
      const prevAnswers = prev[qid] ? prev[qid].split(",") : [];
      const updated = checked
        ? [...prevAnswers, option]
        : prevAnswers.filter((o) => o !== option);
      return { ...prev, [qid]: updated.join(",") };
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        assessmentId: parseInt(id),
        answers: Object.keys(answers).map((qid) => ({
          questionId: parseInt(qid),
          selectedAnswers: answers[qid],
        })),
      };

      const subRes = await submissionApi.post("/submissions", payload);
      const submissionId = subRes.data.submissionId;

      await resultApi.post(`/results/${submissionId}`);

      navigate("/result", { state: { submissionId } });
    } catch (err) {
      console.error(err);
      alert("Submission failed");
      setSubmitting(false);
    }
  }, [answers, id, navigate, submitting]);

  /* ---------------- HELPERS ---------------- */
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timerColor = timeLeft < 60 ? "#dc2626" : timeLeft < 180 ? "#d97706" : "#1e3c72";
  const timerBg   = timeLeft < 60 ? "#fee2e2" : timeLeft < 180 ? "#fef9c3" : "#eef2ff";
  const answeredCount = Object.keys(answers).length;
  const progressValue = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Typography color="text.secondary">Loading test...</Typography>
      </Box>
    );
  }

  if (!questions.length) {
    return (
      <Box sx={{ textAlign: "center", p: 6 }}>
        <Typography color="text.secondary">No questions found.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Sticky header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          px: 4,
          py: 2,
          boxShadow: "0 2px 12px rgba(30,60,114,0.2)",
        }}
      >
        <Box maxWidth={800} mx="auto">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>

            {/* Left — progress */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography color="white" fontWeight={700} fontSize={15}>
                Assessment
              </Typography>
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important", color: "white !important" }} />}
                label={`${answeredCount} / ${questions.length} answered`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 12,
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
            </Box>

            {/* Right — timer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: timerBg,
                px: 2,
                py: 0.8,
                borderRadius: 2,
              }}
            >
              <AccessAlarmRoundedIcon sx={{ fontSize: 18, color: timerColor }} />
              <Typography fontWeight={800} fontSize={18} color={timerColor} fontFamily="monospace">
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                bgcolor: timeLeft < 60 ? "#dc2626" : timeLeft < 180 ? "#f59e0b" : "white",
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </Box>

      {/* Questions */}
      <Box maxWidth={800} mx="auto" px={3} py={4}>
        <Stack spacing={3}>
          {questions.map((q, i) => {
            const qid = q.id;
            const isAnswered = !!answers[qid] && answers[qid].length > 0;
            const isMulti = q.type === 2;

            return (
              <Card
                key={qid}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: isAnswered ? "1.5px solid #2a5298" : "1px solid #e0e7ff",
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: "0 4px 16px rgba(30,60,114,0.1)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>

                  {/* Question header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          background: isAnswered
                            ? "linear-gradient(135deg, #1e3c72, #2a5298)"
                            : "#f0f2f8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isAnswered
                          ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "white" }} />
                          : <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        }
                      </Box>
                      <Typography fontWeight={700} fontSize={15} lineHeight={1.5}>
                        Q{i + 1}. {q.text}
                      </Typography>
                    </Box>

                    <Chip
                      label={isMulti ? "Multi-select" : "Single"}
                      size="small"
                      variant="outlined"
                      color={isMulti ? "secondary" : "default"}
                      sx={{ fontSize: 10, fontWeight: 600, flexShrink: 0, ml: 1 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Options */}
                  {isMulti ? (
                    <Stack spacing={0.5}>
                      {["A", "B", "C", "D"]
                        .filter((o) => q[`option${o}`])
                        .map((o) => {
                          const isChecked = answers[qid]?.includes(o) || false;
                          return (
                            <FormControlLabel
                              key={o}
                              control={
                                <Checkbox
                                  checked={isChecked}
                                  size="small"
                                  onChange={(e) => handleMultiSelect(qid, o, e.target.checked)}
                                />
                              }
                              label={
                                <Typography fontSize={14}>
                                  <strong>{o}.</strong> {q[`option${o}`]}
                                </Typography>
                              }
                              sx={{
                                px: 1.5,
                                py: 0.8,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: isChecked ? "#2a5298" : "transparent",
                                bgcolor: isChecked ? "#eef2ff" : "transparent",
                                "&:hover": { bgcolor: "#f8f9ff" },
                                transition: "all 0.15s",
                                mx: 0,
                              }}
                            />
                          );
                        })}
                    </Stack>
                  ) : (
                    <RadioGroup
                      value={answers[qid] || ""}
                      onChange={(e) => handleSelect(qid, e.target.value)}
                    >
                      <Stack spacing={0.5}>
                        {["A", "B", "C", "D"]
                          .filter((o) => q[`option${o}`])
                          .map((o) => {
                            const isSelected = answers[qid] === o;
                            return (
                              <FormControlLabel
                                key={o}
                                value={o}
                                control={<Radio size="small" />}
                                label={
                                  <Typography fontSize={14}>
                                    <strong>{o}.</strong> {q[`option${o}`]}
                                  </Typography>
                                }
                                sx={{
                                  px: 1.5,
                                  py: 0.8,
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: isSelected ? "#2a5298" : "transparent",
                                  bgcolor: isSelected ? "#eef2ff" : "transparent",
                                  "&:hover": { bgcolor: "#f8f9ff" },
                                  transition: "all 0.15s",
                                  mx: 0,
                                }}
                              />
                            );
                          })}
                      </Stack>
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Submit */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: "1px solid #e0e7ff",
            backgroundColor: "white",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography fontWeight={700}>Ready to submit?</Typography>
              <Typography variant="body2" color="text.secondary">
                {answeredCount === questions.length
                  ? "All questions answered ✓"
                  : `${questions.length - answeredCount} question(s) unanswered`}
              </Typography>
            </Box>
            <Chip
              label={`${answeredCount}/${questions.length}`}
              color={answeredCount === questions.length ? "success" : "default"}
              fontWeight={700}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting || answeredCount === 0}
            onClick={handleSubmit}
            sx={{
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              borderRadius: 2,
              py: 1.5,
              fontSize: 16,
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default TakeTest;