import { useEffect, useState } from "react";
import resultApi from "../api/resultApi";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
} from "@mui/material";

function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state?.submissionId) {
      fetchResult();
    }
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

  if (!state)
    return <Typography p={3}>Please take test first</Typography>;

  if (loading)
    return <Typography p={3}>Loading result...</Typography>;

  if (!result)
    return <Typography p={3}>Result not found</Typography>;

  return (
    <Box maxWidth={900} mx="auto" mt={4} px={2}>

      {/* ✅ RESULT SUMMARY */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>
            Your Result
          </Typography>

          <Typography>
            Score: <strong>{result.score}</strong> /{" "}
            {result.totalQuestions}
          </Typography>

          <Typography mt={1}>
            Percentage:{" "}
            <strong>{result.percentage.toFixed(2)}%</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* ✅ ANSWER REVIEW */}
      <Typography variant="h6" mb={2}>
        Answer Review
      </Typography>

      <Stack spacing={2}>
        {result.details.map((q, index) => {
          const options = [
            { key: "A", value: q.optionA },
            { key: "B", value: q.optionB },
            { key: "C", value: q.optionC },
            { key: "D", value: q.optionD }
          ];

          return (
            <Card key={q.questionId}>
              <CardContent>
                {/* ✅ QUESTION */}
                <Typography fontWeight={600}>
                  Q{index + 1}. {q.questionText}
                </Typography>

                {/* ✅ OPTIONS */}
                <Box mt={2}>
                  {options.map((opt) => {
                    const isUser = q.userAnswer?.includes(opt.key);
                    const isCorrect = q.correctAnswer?.includes(opt.key);

                    return (
                      <Box
                        key={opt.key}
                        sx={{
                          p: 1.5,
                          mt: 1,
                          borderRadius: 1,
                          border: "1px solid #ddd",
                          backgroundColor: isCorrect
                            ? "#e8f5e9"     // ✅ green (correct)
                            : isUser
                            ? "#ffebee"     // ❌ red (wrong)
                            : "#fafafa"
                        }}
                      >
                        <Typography>
                          <strong>{opt.key}.</strong> {opt.value}
                        </Typography>

                        {/* ✅ LABELS */}
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
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* ✅ FOOTER */}
      <Divider sx={{ my: 3 }} />

      <Button
        variant="contained"
        onClick={() => navigate("/candidate-home")}
      >
        Go Home
      </Button>
    </Box>
  );
}

export default Result;
