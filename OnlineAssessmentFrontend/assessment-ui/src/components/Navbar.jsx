import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Paper,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (!user) navigate("/login");
    else if (user.role?.toLowerCase() === "admin") navigate("/admin");
    else navigate("/candidate-home");
  };

  const handleHomeClick = () => {
    if (user?.role?.toLowerCase() === "admin") navigate("/admin");
    else navigate("/candidate-home");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background:
          "linear-gradient(90deg, rgba(11,60,109,0.95), rgba(16, 55, 107, 0.95))",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 70,
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          px: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* BRAND */}
        <Box
          onClick={handleLogoClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <MenuBookRoundedIcon sx={{ color: "#fff" }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            Assessment Platform
          </Typography>
        </Box>

        {/* RIGHT ACTIONS */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

            {/* HOME */}
            <Tooltip title="Home">
              <IconButton
                onClick={handleHomeClick}
                sx={{
                  color: "#e3f2fd",
                  transition: "0.2s",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <HomeRoundedIcon />
              </IconButton>
            </Tooltip>

            {/* NOTIFICATIONS */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: "#e3f2fd",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                <Badge
                  variant="dot"
                  color="error"
                  overlap="circular"
                >
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "rgba(255,255,255,0.25)" }}
            />

            {/* USER CHIP */}
            <Chip
              label={user.username}
              size="small"
              sx={{
                color: "#fff",
                fontWeight: 600,
                background:
                  user.role?.toLowerCase() === "admin"
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />

            {/* AVATAR */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 700,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {user.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>

            {/* MENU */}
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 3,
                  minWidth: 220,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <MenuItem disabled>
                <Box>
                  <Typography fontWeight={700}>
                    {user.email}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "#d32f2f",
                  fontWeight: 600,
                }}
              >
                <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;