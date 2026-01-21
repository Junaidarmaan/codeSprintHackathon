import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: "background.paper",
          padding: 4,
          borderRadius: 3,
          textAlign: "center",
          boxShadow: 6,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          color="text.primary"
          gutterBottom
        >
          Dashboard
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          You are successfully logged in.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
