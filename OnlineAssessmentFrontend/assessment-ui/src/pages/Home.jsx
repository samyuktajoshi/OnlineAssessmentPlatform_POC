import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
} from "@mui/material";

import AssessmentIcon from "@mui/icons-material/Assessment";
import QuizIcon from "@mui/icons-material/Quiz";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";

import assessmentApi from "../api/assessmentApi";
import submissionApi from "../api/submissionApi";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [totalAssessments, setTotalAssessments] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ Fetch all assessments
      const aRes = await assessmentApi.get("/assessments");
      setTotalAssessments(aRes.data.length);

      // ✅ Count all questions across all assessments
      let totalQ = 0;
      for (let a of aRes.data) {
        const qRes = await assessmentApi.get(`/questions/assessment/${a.assessmentId}`);
        totalQ += qRes.data.length;
      }
      setTotalQuestions(totalQ);

      // ✅ Fetch submissions
      const sRes = await submissionApi.get("/submissions");
      setTotalSubmissions(sRes.data.length);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#F5F6FA", minHeight: "100vh" }}>
      
      {/* ✅ Welcome Title */}
      <Typography variant="h5" fontWeight="600" sx={{ mb: 7 }}>
        Welcome Admin 👋
      </Typography>

      {/* ✅ Stats Row */}
      <Grid container spacing={6} sx={{ mb: 7 }}>
        
        <Grid item xs={12} sm={4} md={3}>
          <Card sx={{ padding: 2, borderRadius: 3, textAlign: "center" }}>
            <AssessmentIcon sx={{ fontSize: 32, color: "#3f51b5", mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              {totalAssessments}
            </Typography>
            <Typography variant="body2" color="text.secondary">Assessments</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <Card sx={{ padding: 2, borderRadius: 3, textAlign: "center" }}>
            <QuizIcon sx={{ fontSize: 32, color: "#3f51b5", mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              {totalQuestions}
            </Typography>
            <Typography variant="body2" color="text.secondary">Questions</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <Card sx={{ padding: 2, borderRadius: 3, textAlign: "center" }}>
            <BarChartIcon sx={{ fontSize: 32, color: "#3f51b5", mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              {totalSubmissions}
            </Typography>
            <Typography variant="body2" color="text.secondary">Submissions</Typography>
          </Card>
        </Grid>

      </Grid>

      {/* ✅ Quick Actions */}
      <Typography variant="h6" fontWeight="800" sx={{ mb: 5 }}>
        Quick Actions
      </Typography>

      <Stack direction="row" spacing={10}>
        <Button
          variant="contained"
          startIcon={<AddCircleRoundedIcon />}
          sx={{
            backgroundColor: "#3f51b5",
            textTransform: "none",
            borderRadius: 1,
            paddingY: 2,
            "&:hover": { backgroundColor: "#2c3c99" },
          }}
          onClick={() => navigate("/create")}
        >
          Create Assessment
        </Button>

        <Button
          variant="outlined"
          startIcon={<DashboardCustomizeRoundedIcon />}
          sx={{
            borderColor: "#3f51b5",
            color: "#3f51b5",
            textTransform: "none",
            borderRadius: 1,
            paddingY: 2,
            "&:hover": {
              backgroundColor: "#EEF0FF",
              borderColor: "#2c3c99",
            },
          }}
          onClick={() => navigate("/admin")}
        >
          View Dashboard
        </Button>
      </Stack>
    </Box>
  );
}

export default Home;