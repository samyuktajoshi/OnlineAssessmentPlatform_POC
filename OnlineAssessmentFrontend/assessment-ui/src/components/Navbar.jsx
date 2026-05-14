import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
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
      elevation={1}
      sx={{
        background: "linear-gradient(90deg, #0b3c6d, #1e5aa8)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "1200px",
          mx: "auto",
          width: "100%",
          px: 2,
        }}
      >
        {/* Brand */}
        <Box
          onClick={handleLogoClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
          }}
        >
          <MenuBookRoundedIcon sx={{ color: "#fff", fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 700,
              letterSpacing: "0.4px",
            }}
          >
            Assessment Platform
          </Typography>
        </Box>

        {/* Right Actions */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Home */}
            <Tooltip title="Home">
              <IconButton
                onClick={handleHomeClick}
                sx={{
                  color: "#e3f2fd",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                }}
              >
                <HomeRoundedIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: "#e3f2fd",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                }}
              >
                <Badge variant="dot" color="error">
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "rgba(255,255,255,0.25)", mx: 1 }}
            />

            {/* Role */}
            <Chip
              label={user.username}
              size="small"
              sx={{
                backgroundColor:
                  user.role?.toLowerCase() === "admin"
                    ? "rgba(255,255,255,0.28)"
                    : "rgba(255,255,255,0.18)",
                color: "#fff",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />

            {/* Avatar + Menu */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#ffffff22",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {user.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Box>
                  <Typography fontSize="0.85rem" fontWeight={600}>
                    {user.email}
                  </Typography>
                  <Typography fontSize="0.75rem" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
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