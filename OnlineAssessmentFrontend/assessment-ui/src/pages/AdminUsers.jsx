import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, CircularProgress, Alert, Button,
  TextField, InputAdornment, Chip, Avatar,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const USERS_API = "http://localhost:5224/api/auth/all";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(USERS_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setFilteredUsers(
      users.filter(
        (u) =>
          u.username?.toLowerCase().includes(value.toLowerCase()) ||
          u.email?.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const getInitials = (name) =>
    name ? name.slice(0, 2).toUpperCase() : "U";

  return (
    <Box sx={{ backgroundColor: "#f0f2f8", minHeight: "100vh" }}>

      {/* Header */}
<Box
  sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    px: 3,
    py: 2.5,
    color: "white",
    mb: 3,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  }}
>
        <Box maxWidth={1000} mx="auto">
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", mb: 2, borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            Back
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5}}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
              <PeopleAltRoundedIcon sx={{ fontSize: 22, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>Candidates</Typography>
              <Typography sx={{ opacity: 0.75, fontSize: 14 }}>
                {users.length} registered candidate{users.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box maxWidth={1000} mx="auto" px={3} pb={6}>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          sx={{ mb: 3, bgcolor: "white", borderRadius: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {search && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""} for "{search}"
          </Typography>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {!loading && !error && (
          filteredUsers.length === 0 ? (
            <Paper variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6, border: "2px dashed #c5cae9" }}>
              <PeopleAltRoundedIcon sx={{ fontSize: 48, color: "#c5cae9", mb: 1 }} />
              <Typography color="text.secondary">No candidates found.</Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e7ff", overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9ff" }}>
                    {["#", "Candidate", "Email", "Status", ""].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: "#1e3c72", fontSize: 13, py: 1.8 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        "&:last-child td": { border: 0 },
                        "&:hover": { bgcolor: "#f0f4ff" },
                        transition: "background 0.15s",
                      }}
                    >
                      <TableCell sx={{ color: "text.disabled", fontSize: 13, width: 50 }}>
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 34, height: 34, fontSize: 13, fontWeight: 700,
                              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                            }}
                          >
                            {getInitials(user.username)}
                          </Avatar>
                          <Typography fontWeight={600} fontSize={14}>{user.username}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={13} color="text.secondary">{user.email}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip label="Active" color="success" size="small" sx={{ fontWeight: 600, fontSize: 11 }} />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<BarChartRoundedIcon sx={{ fontSize: 15 }} />}
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          sx={{
                            borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: 12,
                            borderColor: "#e0e7ff", color: "#1e3c72",
                            "&:hover": { bgcolor: "#eef2ff", borderColor: "#2a5298" },
                          }}
                        >
                          Analytics
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )
        )}
      </Box>
    </Box>
  );
}