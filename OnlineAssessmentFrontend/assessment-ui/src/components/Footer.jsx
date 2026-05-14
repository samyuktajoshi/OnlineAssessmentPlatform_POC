import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 1.5,
        textAlign: "center",
        background: "linear-gradient(90deg, #0d447c, #1e5aa8)",
        color: "#e3f2fd",
        borderTop: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <Typography variant="body2" sx={{ fontSize: 13 }}>
        © 2026 Online Assessment Platform. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;
