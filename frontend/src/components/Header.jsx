import { Box, Typography } from "@mui/material";
import DirectionsBoatFilledIcon from "@mui/icons-material/DirectionsBoatFilled";

function Header() {
  return (
    <Box
      sx={{
        bgcolor: "#00243d", // Maersk Navy Blue
        color: "white",
        p: 3,
        borderRadius: 2,
        boxShadow: 2,
        mb: 4,
        display: "flex",
        alignItems: "center",
        gap: 2.5,
      }}
    >
      <DirectionsBoatFilledIcon sx={{ fontSize: 45, color: "#0090da" }} />
      <Box>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          sx={{ 
            m: 0, 
            color: "white", 
            letterSpacing: 0.5,
            fontSize: { xs: "1.6rem", sm: "2.2rem" }
          }}
        >
          MAERSK TRACK & TRACE
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: "#b0bec5", 
            mt: 0.5,
            fontSize: { xs: "0.85rem", sm: "1rem" }
          }}
        >
          Enter one or multiple booking numbers and fetch shipment details.
        </Typography>
      </Box>
    </Box>
  );
}

export default Header;
