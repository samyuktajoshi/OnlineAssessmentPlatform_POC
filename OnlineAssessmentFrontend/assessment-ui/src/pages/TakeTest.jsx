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
  Checkbox,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import AccessAlarmRoundedIcon from "@mui/icons-material/AccessAlarmRounded";

const TYPE_LABELS = {
  1: { label: "Single Choice", color: "primary" },
  2: { label: "Multi Select", color: "secondary" },
  3: { label: "True / False", color: "warning" },
  4: { label: "Coding", color: "info" },
};

function TakeTest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  // testResults: { [qid]: { passed: number, total: number, cases: [{input, expected, actual, pass}] } }
  const [testResults, setTestResults] = useState({});
  const [runningId, setRunningId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  /* ---------------- HELPERS ---------------- */
  const formatTime = (t) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const normalize = (str) =>
    (str || "").replace(/\r?\n|\r/g, "").replace(/\s+/g, " ").trim().toLowerCase();

  const timerColor = timeLeft < 60 ? "#dc2626" : timeLeft < 180 ? "#d97706" : "white";
  const timerBg = timeLeft < 60 ? "#fee2e2" : timeLeft < 180 ? "#fef9c3" : "rgba(255,255,255,0.15)";

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        assessmentId: parseInt(id),
        answers: questions.map((q) => {
          if (q.type === 4) {
            const tr = testResults[q.id];
            const allPassed = tr && tr.passed === tr.total && tr.total > 0;
            return {
              questionId: q.id,
              // Send the actual code written by candidate
              selectedAnswers: answers[q.id] || q.starterCode || "",
              isCorrect: allPassed,
            };
          }
          return {
            questionId: q.id,
            selectedAnswers: answers[q.id] || "",
          };
        }),
      };

      const subRes = await submissionApi.post("/submissions", payload);
      const submissionId = subRes.data.submissionId;
      await resultApi.post(`/results/${submissionId}`);
      localStorage.removeItem(`timer-${id}`);
      navigate("/result", { state: { submissionId } });
    } catch (err) {
      console.error(err);
      alert("Submission failed");
      setSubmitting(false);
    }
  }, [answers, testResults, questions, id, navigate, submitting]);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, aRes] = await Promise.all([
          assessmentApi.get(`/questions/assessment/${id}`),
          assessmentApi.get(`/assessments/${id}`),
        ]);

        setQuestions(qRes.data || []);

        const duration = aRes.data.duration || aRes.data.durationMinutes || 10;
        const saved = localStorage.getItem(`timer-${id}`);
        setTimeLeft(saved ? parseInt(saved) : duration * 60);
        setTotalTime(duration * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const initial = {};
    questions.forEach((q) => {
      if (q.type === 4) initial[q.id] = q.starterCode || "";
    });
    setAnswers((prev) => ({ ...initial, ...prev }));
  }, [questions]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;
    localStorage.setItem(`timer-${id}`, timeLeft);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, id]);

  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0 && !submitting && !loading) {
      handleSubmit();
    }
  }, [timeLeft]);

  /* ---------------- ANSWERS ---------------- */
  const handleSelect = (qid, option) =>
    setAnswers((prev) => ({ ...prev, [qid]: option }));

  const handleMultiSelect = (qid, option, checked) => {
    setAnswers((prev) => {
      const prevAnswers = prev[qid] ? prev[qid].split(",") : [];
      const updated = checked
        ? [...prevAnswers, option]
        : prevAnswers.filter((o) => o !== option);
      return { ...prev, [qid]: updated.join(",") };
    });
  };

  const handleCodeChange = (qid, code) =>
    setAnswers((prev) => ({ ...prev, [qid]: code }));

  /* ---------------- RUN CODE (multiple test cases) ---------------- */
  const runCode = async (qid, code, starterCode) => {
    setRunningId(qid);

    const question = questions.find((q) => q.id === qid);
    // testCases from backend — array of { input, expectedOutput, isHidden }
    const testCases = question?.testCases || [];

    // Fallback: if no testCases array, use single input/expectedOutput
    const casesToRun = testCases.length > 0
      ? testCases
      : [{ input: question?.input || "", expectedOutput: question?.expectedOutput || "", isHidden: false }];

    try {
      const finalCode = code ?? starterCode ?? "";
      const caseResults = [];

      for (const tc of casesToRun) {
        if (tc.isHidden) {
          // Don't run hidden test cases on frontend — mark as pending
          caseResults.push({
            input: "Hidden",
            expected: "Hidden",
            actual: "Hidden",
            pass: null, // null = unknown (hidden)
          });
          continue;
        }

        try {
          const res = await fetch("https://localhost:7219/api/code/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: finalCode, input: tc.input }),
          });

          const data = await res.json();
          const actual = normalize(data.output || "");
          const expected = normalize(tc.expectedOutput || "");
          const pass = actual === expected;

          caseResults.push({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: data.output || "No output",
            pass,
          });
        } catch {
          caseResults.push({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: "Error",
            pass: false,
          });
        }
      }

      const passedCount = caseResults.filter((c) => c.pass === true).length;
      const totalVisible = caseResults.filter((c) => c.pass !== null).length;

      setTestResults((prev) => ({
        ...prev,
        [qid]: {
          passed: passedCount,
          total: casesToRun.length,
          visibleTotal: totalVisible,
          cases: caseResults,
        },
      }));

    } catch (err) {
      console.error(err);
      setTestResults((prev) => ({
        ...prev,
        [qid]: { passed: 0, total: 1, cases: [{ input: "", expected: "", actual: "Error running code", pass: false }] },
      }));
    } finally {
      setRunningId(null);
    }
  };

  const answeredCount = questions.filter((q) => {
    if (q.type === 4) {
      const tr = testResults[q.id];
      return tr && tr.passed > 0;
    }
    return answers[q.id] && answers[q.id].length > 0;
  }).length;

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

  const timerProgress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Sticky header */}
      <Box sx={{
        position: "sticky", top: 0, zIndex: 100,
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        px: 4, py: 2,
        boxShadow: "0 2px 12px rgba(30,60,114,0.2)",
      }}>
        <Box maxWidth={900} mx="auto">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography color="white" fontWeight={700} fontSize={15}>Assessment</Typography>
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important", color: "white !important" }} />}
                label={`${answeredCount} / ${questions.length} answered`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, fontSize: 12, border: "1px solid rgba(255,255,255,0.3)" }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: timerBg, px: 2, py: 0.7, borderRadius: 2, transition: "all 0.3s" }}>
              <AccessAlarmRoundedIcon sx={{ fontSize: 18, color: timerColor }} />
              <Typography fontWeight={800} fontSize={17} color={timerColor} fontFamily="monospace" sx={{ minWidth: 48 }}>
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <LinearProgress variant="determinate" value={(answeredCount / questions.length) * 100}
              sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.2)", "& .MuiLinearProgress-bar": { bgcolor: "white", borderRadius: 2 } }}
            />
            <LinearProgress variant="determinate" value={timerProgress}
              sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.2)", "& .MuiLinearProgress-bar": { bgcolor: timeLeft < 60 ? "#dc2626" : timeLeft < 180 ? "#fde047" : "#4ade80", borderRadius: 2 } }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography fontSize={10} color="rgba(255,255,255,0.6)">Progress</Typography>
            <Typography fontSize={10} color="rgba(255,255,255,0.6)">Time remaining</Typography>
          </Box>
        </Box>
      </Box>

      {/* Questions */}
      <Box maxWidth={900} mx="auto" px={3} py={4}>
        <Stack spacing={3}>
          {questions.map((q, i) => {
            const qid = q.id;
            const isMulti = q.type === 2;
            const isCoding = q.type === 4;
            const tr = testResults[qid];
            const isAnswered = isCoding
              ? tr && tr.passed > 0
              : answers[qid] && answers[qid].length > 0;
            const typeConfig = TYPE_LABELS[q.type] || TYPE_LABELS[1];

            return (
              <Card key={qid} elevation={0} sx={{ borderRadius: 3, border: isAnswered ? "1.5px solid #2a5298" : "1px solid #e0e7ff", overflow: "hidden", transition: "all 0.2s" }}>
                <CardContent sx={{ p: 0 }}>

                  {/* Question header */}
                  <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, flexShrink: 0, background: isAnswered ? "linear-gradient(135deg, #1e3c72, #2a5298)" : "#f0f2f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isAnswered
                            ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "white" }} />
                            : <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                          }
                        </Box>
                        <Typography fontWeight={700} fontSize={15} lineHeight={1.5}>
                          Q{i + 1}. {q.text}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: 1 }}>
                        <Chip label={typeConfig.label} size="small" color={typeConfig.color} variant="outlined" sx={{ fontSize: 10, fontWeight: 600 }} />
                        {isCoding && (
                          <Chip
                            label={`${(q.testCases || []).length || 1} test case${((q.testCases || []).length || 1) !== 1 ? "s" : ""}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 10, fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Divider />
                  </Box>

                  <Box sx={{ px: 3, pb: 3 }}>
                    {isCoding ? (
                      <Box>
                        {/* Code editor */}
                        <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e0e7ff", mb: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1, bgcolor: "#1e2d3d", borderBottom: "1px solid #2d3f50" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CodeRoundedIcon sx={{ fontSize: 16, color: "#64748b" }} />
                              <Typography fontSize={12} color="#64748b" fontFamily="monospace">solution.py</Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Reset to starter code">
                                <IconButton size="small" onClick={() => handleCodeChange(qid, q.starterCode || "")} sx={{ color: "#64748b", "&:hover": { color: "white" } }}>
                                  <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                                disabled={runningId === qid}
                                onClick={() => runCode(qid, answers[qid], q.starterCode)}
                                sx={{ bgcolor: "#16a34a", color: "white", fontSize: 12, py: 0.4, px: 1.5, textTransform: "none", fontWeight: 600, borderRadius: 1.5, "&:hover": { bgcolor: "#15803d" }, "&:disabled": { bgcolor: "#374151", color: "#6b7280" } }}
                              >
                                {runningId === qid ? "Running..." : "Run All Tests"}
                              </Button>
                            </Box>
                          </Box>

                          <Box
                            component="textarea"
                            value={answers[qid] ?? ""}
                            onChange={(e) => handleCodeChange(qid, e.target.value)}
                            spellCheck={false}
                            sx={{ width: "100%", minHeight: 200, p: 2, bgcolor: "#0f172a", color: "#e2e8f0", fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace", fontSize: 13, lineHeight: 1.7, border: "none", outline: "none", resize: "vertical", boxSizing: "border-box", display: "block" }}
                          />
                        </Box>

                        {/* Test case results */}
                        {tr && (
                          <Box>
                            {/* Summary */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                              <Typography fontSize={13} fontWeight={700}>
                                Test Cases:
                              </Typography>
                              <Chip
                                label={`${tr.passed} / ${tr.total} passed`}
                                size="small"
                                color={tr.passed === tr.total ? "success" : tr.passed > 0 ? "warning" : "error"}
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              />
                              {tr.passed > 0 && tr.passed < tr.total && (
                                <Typography fontSize={12} color="text.secondary">
                                  Partial marks awarded
                                </Typography>
                              )}
                            </Box>

                            {/* Individual test cases */}
                            <Stack spacing={1}>
                              {tr.cases.map((tc, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${tc.pass === null ? "#e0e7ff" : tc.pass ? "#86efac" : "#fca5a5"}`,
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* Case header */}
                                  <Box sx={{
                                    px: 2, py: 0.8,
                                    bgcolor: tc.pass === null ? "#f8f9ff" : tc.pass ? "#052e16" : "#450a0a",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                  }}>
                                    <Typography
                                      fontSize={12} fontWeight={600} fontFamily="monospace"
                                      color={tc.pass === null ? "text.secondary" : tc.pass ? "#86efac" : "#fca5a5"}
                                    >
                                      Case {idx + 1} {tc.pass === null ? "(Hidden)" : ""}
                                    </Typography>
                                    {tc.pass === null ? (
                                      <Typography fontSize={11} color="text.disabled">Evaluated on submit</Typography>
                                    ) : tc.pass ? (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "#4ade80" }} />
                                        <Typography fontSize={11} fontWeight={700} color="#4ade80">Passed</Typography>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <CancelRoundedIcon sx={{ fontSize: 14, color: "#f87171" }} />
                                        <Typography fontSize={11} fontWeight={700} color="#f87171">Failed</Typography>
                                      </Box>
                                    )}
                                  </Box>

                                  {/* Case details — only for visible cases */}
                                  {tc.pass !== null && (
                                    <Box sx={{ bgcolor: "#0f172a", px: 2, py: 1.5 }}>
                                      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                        <Box>
                                          <Typography fontSize={10} color="#64748b" fontWeight={600} mb={0.3}>INPUT</Typography>
                                          <Typography fontSize={12} fontFamily="monospace" color="#94a3b8">{tc.input || "None"}</Typography>
                                        </Box>
                                        <Box>
                                          <Typography fontSize={10} color="#64748b" fontWeight={600} mb={0.3}>EXPECTED</Typography>
                                          <Typography fontSize={12} fontFamily="monospace" color="#86efac">{tc.expected}</Typography>
                                        </Box>
                                        <Box>
                                          <Typography fontSize={10} color="#64748b" fontWeight={600} mb={0.3}>YOUR OUTPUT</Typography>
                                          <Typography fontSize={12} fontFamily="monospace" color={tc.pass ? "#4ade80" : "#f87171"}>{tc.actual}</Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>

                    ) : isMulti ? (
                      <Stack spacing={0.5}>
                        {["A", "B", "C", "D"].filter((o) => q[`option${o}`]).map((o) => {
                          const isChecked = answers[qid]?.includes(o) || false;
                          return (
                            <FormControlLabel
                              key={o}
                              control={<Checkbox checked={isChecked} size="small" onChange={(e) => handleMultiSelect(qid, o, e.target.checked)} />}
                              label={<Typography fontSize={14}><strong>{o}.</strong> {q[`option${o}`]}</Typography>}
                              sx={{ px: 1.5, py: 0.8, borderRadius: 2, border: "1px solid", borderColor: isChecked ? "#2a5298" : "transparent", bgcolor: isChecked ? "#eef2ff" : "transparent", "&:hover": { bgcolor: "#f8f9ff" }, transition: "all 0.15s", mx: 0 }}
                            />
                          );
                        })}
                      </Stack>

                    ) : (
                      <RadioGroup value={answers[qid] || ""} onChange={(e) => handleSelect(qid, e.target.value)}>
                        <Stack spacing={0.5}>
                          {["A", "B", "C", "D"].filter((o) => q[`option${o}`]).map((o) => {
                            const isSelected = answers[qid] === o;
                            return (
                              <FormControlLabel
                                key={o}
                                value={o}
                                control={<Radio size="small" />}
                                label={<Typography fontSize={14}><strong>{o}.</strong> {q[`option${o}`]}</Typography>}
                                sx={{ px: 1.5, py: 0.8, borderRadius: 2, border: "1px solid", borderColor: isSelected ? "#2a5298" : "transparent", bgcolor: isSelected ? "#eef2ff" : "transparent", "&:hover": { bgcolor: "#f8f9ff" }, transition: "all 0.15s", mx: 0 }}
                              />
                            );
                          })}
                        </Stack>
                      </RadioGroup>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Submit panel */}
        <Paper elevation={0} sx={{ mt: 4, mb: 4, p: 3, borderRadius: 3, border: "1px solid #e0e7ff", bgcolor: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography fontWeight={700}>Ready to submit?</Typography>
              <Typography variant="body2" color="text.secondary">
                {answeredCount === questions.length ? "All questions answered ✓" : `${questions.length - answeredCount} question(s) remaining`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Chip label={`${answeredCount}/${questions.length}`} color={answeredCount === questions.length ? "success" : "default"} sx={{ fontWeight: 700 }} />
              <Chip
                icon={<AccessAlarmRoundedIcon sx={{ fontSize: "14px !important" }} />}
                label={formatTime(timeLeft)}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: timeLeft < 60 ? "#fee2e2" : timeLeft < 180 ? "#fef9c3" : "#f0f2f8",
                  color: timeLeft < 60 ? "#dc2626" : timeLeft < 180 ? "#d97706" : "text.secondary",
                  border: "1px solid",
                  borderColor: timeLeft < 60 ? "#fca5a5" : timeLeft < 180 ? "#fde047" : "#e0e7ff",
                }}
              />
            </Box>
          </Box>

          <Button
            fullWidth variant="contained" size="large"
            disabled={submitting || answeredCount === 0}
            onClick={handleSubmit}
            sx={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)", borderRadius: 2, py: 1.5, fontSize: 16, fontWeight: 700, textTransform: "none" }}
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default TakeTest;