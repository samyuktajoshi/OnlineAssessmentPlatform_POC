import { Box, Typography, Paper, Avatar, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setAdmin(JSON.parse(raw));
  }, []);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "A";

  const cards = [
   
    {
      title: "Create Assessment",
      description: "Build new tests with custom duration, questions and options",
      icon: <AddCircleOutlineRoundedIcon sx={{ fontSize: 26, color: "white" }} />,
      gradient: "linear-gradient(135deg, #2e7d32, #43a047)",
      lightBg: "#f0fdf4",
      route: "/create",
      tag: "New",
    },
     {
      title: "Manage Assessments",
      description: "View, edit, delete assessments and manage their questions",
      icon: <AssignmentIcon sx={{ fontSize: 26, color: "white" }} />,
      gradient: "linear-gradient(135deg, #1e3c72, #2a5298)",
      lightBg: "#eef2ff",
      route: "/manage-assessments",
      tag: "Assessments",
    },
    {
      title: "Submissions",
      description: "Review all candidate responses, scores and performance",
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 26, color: "white" }} />,
      gradient: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
      lightBg: "#faf5ff",
      route: "/view-submissions",
      tag: "Results",
    },
    {
      title: "View Candidates",
      description: "Browse all registered candidates on the platform",
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 26, color: "white" }} />,
      gradient: "linear-gradient(135deg, #0277bd, #0288d1)",
      lightBg: "#e1f5fe",
      route: "/admin/users",
      tag: "Users",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          px: 4,
          py: 5,
          color: "white",
          mb: 5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -40, right: 120, width: 150, height: 150, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />

        <Box maxWidth={1100} mx="auto">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>

            {/* Left — admin info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: "rgba(255,255,255,0.2)",
                  fontSize: 20,
                  fontWeight: 800,
                  border: "2px solid rgba(255,255,255,0.35)",
                  letterSpacing: 1,
                }}
              >
                
                {getInitials(admin?.username)}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                  <Typography variant="h4" fontWeight={800}>
                  Hi  {admin?.username || "Admin"} 
                  </Typography>
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 11,
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  />
                </Box>
                <Typography sx={{ opacity: 0.75, fontSize: 14 }}>
                  Manage your assessment platform from here
                </Typography>
              </Box>
            </Box>

            {/* Right — icon */}
            {/* <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.12)",
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <AdminPanelSettingsRoundedIcon sx={{ fontSize: 30, color: "white" }} />
            </Box> */}
          </Box>

          {/* Stats row */}
          {/* <Box sx={{ display: "flex", gap: 5, mt: 3, flexWrap: "wrap" }}>
            {[
              { label: "Assessments", value: "Manage" },
              { label: "Candidates", value: "View" },
              { label: "Submissions", value: "Review" },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Typography fontSize={11} sx={{ opacity: 0.7 }}>{s.label}</Typography>
                <Typography fontWeight={700} fontSize={13}>{s.value}</Typography>
              </Box>
            ))}
          </Box> */}
        </Box>
      </Box>

      {/* Cards */}
      <Box maxWidth={1100} mx="auto" px={4} pb={6}>
        <Typography variant="h6" fontWeight={700} color="text.secondary" mb={3}>
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 2.5,
          }}
        >
          {cards.map((card) => (
            <Paper
              key={card.title}
              elevation={0}
              onClick={() => navigate(card.route)}
              sx={{
                borderRadius: 3,
                border: "1px solid #e0e7ff",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.2s",
                bgcolor: "white",
                "&:hover": {
                  boxShadow: "0 12px 32px rgba(30,60,114,0.13)",
                  transform: "translateY(-4px)",
                  borderColor: "#c7d2fe",
                },
              }}
            >
              {/* Colored top strip */}
              <Box sx={{ height: 5, background: card.gradient }} />

              <Box sx={{ p: 3 }}>
                {/* Icon + tag row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      background: card.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Chip
                    label={card.tag}
                    size="small"
                    sx={{
                      bgcolor: card.lightBg,
                      fontWeight: 700,
                      fontSize: 11,
                      height: 24,
                      border: "none",
                    }}
                  />
                </Box>

                <Typography variant="h6" fontWeight={700} mb={0.5} fontSize={16}>
                  {card.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" lineHeight={1.6} fontSize={13}>
                  {card.description}
                </Typography>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  px: 3,
                  py: 1.5,
                  borderTop: "1px solid #f0f2f8",
                  bgcolor: "#fafbff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  fontSize={12}
                  fontWeight={700}
                  sx={{
                    background: card.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Open
                </Typography>
                <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;