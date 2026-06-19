import { useEffect, useState } from "react";
import resultApi from "../api/resultApi";
import { useLocation, useNavigate } from "react-router-dom";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
} from "@mui/material";

const CHATBOT_URL = "https://localhost:7296/api/chat";

function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! Click 'Ask AI' on any question and I'll explain it 👋",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
const [selectedQuestion, setSelectedQuestion] = useState(null);
  useEffect(() => {
    if (state?.submissionId) fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await resultApi.get(
        `/results/details/${state.submissionId}`
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ask AI for specific question
 const handleAskAI = (q) => {
  setSelectedQuestion(q);
  setChatOpen(true);

  const message = `
Explain this question clearly:

Question:
${q.questionText}

User Answer:
${q.userAnswer || "Not answered"}

Correct Answer:
${q.correctAnswer}

Also explain in simple terms.`;

  setMessages((prev) => [
    ...prev,
    { from: "user", text: message },
  ]);

  sendToAI(message);
};

  // ✅ Send message to AI
  const sendToAI = async (text) => {
    setThinking(true);
    try {
      const res = await fetch(CHATBOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error contacting AI ❌" },
      ]);
    } finally {
      setThinking(false);
    }
  };

  if (!state)
    return <Typography p={3}>Please take test first</Typography>;

  if (loading)
    return <Typography p={3}>Loading result...</Typography>;

  if (!result)
    return <Typography p={3}>Result not found</Typography>;
const getPerformanceColor = (percentage) => {
  if (percentage >= 70) return "#4caf50";    // ✅ Green (Excellent)
  if (percentage >= 40) return "#ff9800";    // ⚡ Orange (Average)
  return "#f44336";                          // ❌ Red (Low)
};
  return (
    <Box maxWidth={900} mx="auto" mt={4} px={2}>
      {/* ✅ RESULT SUMMARY */}
    <Card
  sx={{
    mb: 3,
    borderRadius: 3,
    bgcolor: "#ffffff",
    border: "1px solid #e0e0e0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  }}
>
  <CardContent>

    <Typography variant="h6" mb={2} fontWeight={700}>
      📊 Your Result
    </Typography>

    <Box display="flex" gap={2} flexWrap="wrap">

      {/* ✅ SCORE BOX */}
      <Box
        sx={{
          flex: 1,
          minWidth: 120,
          p: 2,
          bgcolor: "#e3f2fd",
          borderRadius: 2,
        }}
      >
        <Typography fontSize={13} color="text.secondary">
          Score
        </Typography>

        <Typography fontWeight={700} fontSize={18}>
          🎯 {result.score} / {result.totalQuestions}
        </Typography>
      </Box>

      {/* ✅ PERCENTAGE BOX */}
      <Box
        sx={{
          flex: 1,
          minWidth: 120,
          p: 2,
          bgcolor:
            result.percentage >= 70
              ? "#e8f5e9"
              : result.percentage >= 40
              ? "#fff3e0"
              : "#fdecea",
          borderRadius: 2,
        }}
      >
        <Typography fontSize={13} color="text.secondary">
          Percentage
        </Typography>

        <Typography
          fontWeight={700}
          fontSize={18}
          sx={{ color: getPerformanceColor(result.percentage) }}
        >
          📈 {result.percentage.toFixed(2)}%
        </Typography>
      </Box>

    </Box>

    {/* ✅ PERFORMANCE TEXT */}
    <Typography mt={2} fontWeight={600}>
      {result.percentage >= 70 && "✅ Excellent Performance"}
      {result.percentage >= 40 && result.percentage < 70 && "⚡ Good Job"}
      {result.percentage < 40 && "❗ Needs Improvement"}
    </Typography>

  </CardContent>
</Card>

      {/* ✅ ANSWER REVIEW */}
      <Typography variant="h6" mb={2}>
        Answer Review
      </Typography>

      <Stack spacing={2}>
        {result.details.map((q, index) => {
          const isCoding =
            !q.optionA && !q.optionB && !q.optionC && !q.optionD;

          return (
            <Card key={q.questionId}>
              <CardContent>

                {/* ✅ QUESTION + AI BUTTON */}
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={600}>
                    Q{index + 1}. {q.questionText}
                  </Typography>

                  <Button
                    size="small"
                    startIcon={<SmartToyRoundedIcon />}
                    onClick={() => handleAskAI(q)}
                    sx={{ textTransform: "none", fontSize: 12 }}
                  >
                    Ask AI
                  </Button>
                </Box>

                <Box mt={2}>
                  {/* ✅ CODING */}
                  {isCoding ? (
                    <>
                      <Typography fontWeight={600}>
                        Your Code:
                      </Typography>

                      <Box
                        sx={{
                          background: "#111",
                          color: "#0f0",
                          p: 2,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          mt: 1,
                        }}
                      >
                        {q.userAnswer || "No code submitted"}
                      </Box>

                      <Typography mt={2} fontWeight={600}>
                        Expected Output:
                      </Typography>

                      <Box
                        sx={{
                          background: "#f5f5f5",
                          p: 2,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          mt: 1,
                        }}
                      >
                        {q.correctAnswer || "N/A"}
                      </Box>
                    </>
                  ) : (
                    <>
                      {/* ✅ MCQ */}
                      {["A", "B", "C", "D"].map((opt) => {
                        const value = q[`option${opt}`];
                        if (!value) return null;

                        const isUser =
                          q.userAnswer?.includes(opt);
                        const isCorrect =
                          q.correctAnswer?.includes(opt);

                        return (
                          <Box
                            key={opt}
                            sx={{
                              p: 1.5,
                              mt: 1,
                              borderRadius: 1,
                              border: "1px solid #ddd",
                              backgroundColor: isCorrect
                                ? "#e8f5e9"
                                : isUser
                                ? "#ffebee"
                                : "#fafafa",
                            }}
                          >
                            <Typography>
                              <strong>{opt}.</strong> {value}
                            </Typography>

                            {isCorrect && (
                              <Typography color="green" fontSize={13}>
                                ✅ Correct Answer
                              </Typography>
                            )}

                            {isUser && !isCorrect && (
                              <Typography color="red" fontSize={13}>
                                ❌ Your Answer
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Button
        variant="contained"
        onClick={() => navigate("/candidate-home")}
      >
        Go Home
      </Button>

      {/* ✅ CHATBOT UI */}
      {chatOpen && (
        <Box
  sx={{
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 340,
    height: 460,
    bgcolor: "#ffffff",
    borderRadius: 3,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 1000,
  }}
>

  {/* ✅ HEADER */}
  <Box
    sx={{
      p: 1.5,
      bgcolor: "#1e3c72",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography fontWeight={600} fontSize={14}>
      🤖 AI Assistant
    </Typography>

    <CloseRoundedIcon
      sx={{ cursor: "pointer", fontSize: 20 }}
      onClick={() => setChatOpen(false)}
    />
  </Box>

  {/* ✅ MESSAGES */}
  <Box
    sx={{
      flex: 1,
      overflowY: "auto",
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      bgcolor: "#fafafa",
    }}
  >
    {messages.map((msg, i) => (
      <Box
        key={i}
        sx={{
          display: "flex",
          justifyContent:
            msg.from === "user" ? "flex-end" : "flex-start",
        }}
      >
        <Box
          sx={{
            maxWidth: "75%",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            fontSize: 13,
            lineHeight: 1.5,
            bgcolor:
              msg.from === "user" ? "#1e3c72" : "#ffffff",
            color:
              msg.from === "user" ? "#fff" : "#333",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          {msg.text}
        </Box>
      </Box>
    ))}

    {thinking && (
      <Typography fontSize={12} color="text.secondary">
        AI is typing...
      </Typography>
    )}
  </Box>

  {/* ✅ INPUT */}
  <Box
    sx={{
      p: 1,
      borderTop: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Ask something..."
      style={{
        flex: 1,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #ddd",
        outline: "none",
        fontSize: 13,
      }}
    />

    <SendRoundedIcon
      sx={{
        cursor: "pointer",
        fontSize: 22,
        color: "#1e3c72",
      }}
     onClick={() => {
  if (!input.trim()) return;

  let message = input;

  if (selectedQuestion) {
    message = `
Question:
${selectedQuestion.questionText}

User query:
${input}
`;
  }

  setMessages((prev) => [
    ...prev,
    { from: "user", text: input },
  ]);

  sendToAI(message);
  setInput("");
}}

    />
  </Box>
</Box>

      )}
    </Box>
  );
}

export default Result;