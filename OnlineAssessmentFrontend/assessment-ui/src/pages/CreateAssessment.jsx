import { useState, useEffect } from "react";
import assessmentApi from "../api/assessmentApi";
import { useNavigate } from "react-router-dom";

import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  MenuItem,
} from "@mui/material";

import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { toast } from "react-toastify";

function CreateAssessment() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?.token) {
      toast.error("Please login again");
      navigate("/login");
    }
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: "",
    status: "Active",
    availableFrom: "",
    availableUntil: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Assessment title is required");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    const durationValue = parseInt(form.durationMinutes);
    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error("Duration must be greater than 0");
      return false;
    }

    if (
      form.availableFrom &&
      form.availableUntil &&
      form.availableFrom >= form.availableUntil
    ) {
      toast.error("Available From must be before Available Until");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        title: form.title,
        description: form.description,
        durationMinutes: parseInt(form.durationMinutes),

        // ✅ NEW FIELDS (SAFE)
        status: form.status,
        availableFrom: form.availableFrom || null,
        availableUntil: form.availableUntil || null,
      };

      const res = await assessmentApi.post("/assessments", payload);
      const assessmentId = res.data.assessmentId;

      toast.success("Assessment created successfully!");

      setTimeout(() => {
        navigate(`/add-questions/${assessmentId}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Error creating assessment");
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#f4f6fa" px={{ xs: 2, md: 6 }} py={4}>
      {/* HEADER */}
      <Box maxWidth={900} mx="auto" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Create Assessment
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Define the basic details before adding questions
        </Typography>

        <Box mt={2}>
          <Chip
            label="Step 1 of 2 · Assessment Details"
            sx={{
              backgroundColor: "rgba(13,68,124,0.1)",
              color: "#0d447c",
              fontWeight: 500,
            }}
          />
        </Box>
      </Box>

      {/* FORM */}
      <Box maxWidth={900} mx="auto">
        <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <TextField
                label="Assessment Title"
                name="title"
                fullWidth
                value={form.title}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <TitleRoundedIcon sx={{ mr: 1 }} />,
                }}
              />

              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={4}
                value={form.description}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <DescriptionRoundedIcon sx={{ mr: 1 }} />,
                }}
              />

              <TextField
                label="Duration (minutes)"
                name="durationMinutes"
                type="number"
                fullWidth
                value={form.durationMinutes}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <AccessTimeRoundedIcon sx={{ mr: 1 }} />,
                }}
              />

              {/* ✅ STATUS */}
              <TextField
                select
                label="Assessment Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <VisibilityIcon sx={{ mr: 1 }} />,
                }}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Hidden">Hidden</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>

              {/* ✅ AVAILABILITY */}
              <TextField
                label="Available From"
                name="availableFrom"
                type="datetime-local"
                value={form.availableFrom}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <EventIcon sx={{ mr: 1 }} />,
                }}
              />

              <TextField
                label="Available Until"
                name="availableUntil"
                type="datetime-local"
                value={form.availableUntil}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <EventIcon sx={{ mr: 1 }} />,
                }}
              />

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  sx={{
                    px: 4,
                    py: 1.3,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    background: "linear-gradient(90deg, #0d447c, #1e5aa8)",
                  }}
                >
                  Save & Add Questions →
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default CreateAssessment;