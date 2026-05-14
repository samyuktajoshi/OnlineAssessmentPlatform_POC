import { Box, Typography, Paper, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import AssignmentIcon from "@mui/icons-material/Assignment";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

 useEffect(() => {
  const raw = localStorage.getItem("user");
  if (raw) {
    const parsed = JSON.parse(raw);
    console.log("ADMIN USER OBJECT:", parsed);
    setAdmin(parsed);
  }
}, []);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "A";

  const cards = [
    {
      title: "Manage Assessments",
      description: "View, edit, and delete existing assessments and their questions",
      icon: <AssignmentIcon sx={{ fontSize: 28, color: "white" }} />,
      gradient: "linear-gradient(135deg, #1e3c72, #2a5298)",
      route: "/manage-assessments",
      stat: "View All",
    },
    {
      title: "Create Assessment",
      description: "Build new tests with custom duration, questions and options",
      icon: <AddCircleOutlineRoundedIcon sx={{ fontSize: 28, color: "white" }} />,
      gradient: "linear-gradient(135deg, #2e7d32, #43a047)",
      route: "/create",
      stat: "New",
    },
    {
      title: "Submissions",
      description: "Review all candidate responses, scores and performance",
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 28, color: "white" }} />,
      gradient: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
      route: "/view-submissions",
      stat: "Review",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "120vh" }}>

      {/* Hero Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          px: 6,
          py: 3,
          color: "white",
          mb: 5,
        }}
      >
        <Box maxWidth={1000} mx="auto">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: 22,
                fontWeight: 700,
                border: "2px solid rgba(255,255,255,0.4)",
              }}
            >
              {getInitials(admin?.username)}
            </Avatar>
            <Box>
             <Typography variant="h4" fontWeight={700}>
  {admin?.username}
</Typography>

<Typography sx={{ opacity: 0.8, mt: 0.5 }}>
  Administrator Dashboard
</Typography>

              <Typography sx={{ opacity: 0.8, mt: 0.5 }}>
                Manage your assessment platform from here
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Cards */}
      <Box maxWidth={1100} mx="auto" px={4} pb={6}>
        <Typography variant="h6" fontWeight={600} color="text.secondary" mb={3}>
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 3,
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
                "&:hover": {
                  boxShadow: "0 12px 32px rgba(30,60,114,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              {/* Colored top strip */}
              <Box sx={{ height: 6, background: card.gradient }} />

              <Box sx={{ p: 3 }}>
                {/* Icon + stat row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      background: card.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      background: "#f0f2f8",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {card.stat}
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight={700} mb={0.5}>
                  {card.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  {card.description}
                </Typography>
              </Box>

              {/* Footer arrow */}
              <Box
                sx={{
                  px: 3,
                  py: 1.5,
                  borderTop: "1px solid #f0f2f8",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  sx={{
                    background: card.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Go →
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;