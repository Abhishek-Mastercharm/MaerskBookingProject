import { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../api/bookingApi";
import Header from "../components/Header";
import KPICards from "../components/KPICards";
import ShipmentGrid from "../components/ShipmentGrid";
import ImportModal from "../components/ImportModal";

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      setRefreshing(true);
      await api.post("/refresh-all");
      await fetchData(); // Refetch updated data
    } catch (err) {
      console.error("Failed to refresh shipments:", err);
      alert("Error refreshing shipments.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Header />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Shipment Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2.5 }}>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setImportModalOpen(true)}
            sx={{
              bgcolor: "#00243d",
              color: "white",
              fontWeight: "bold",
              px: 3,
              py: 1.2,
              borderRadius: "6px",
              textTransform: "none",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: "#001a2d",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
            }}
          >
            Import Excel
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefreshAll}
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
            sx={{
              color: "#00243d",
              borderColor: "#00243d",
              fontWeight: "bold",
              px: 3,
              py: 1.2,
              borderRadius: "6px",
              textTransform: "none",
              "&:hover": {
                borderColor: "#001a2d",
                bgcolor: "rgba(0, 36, 61, 0.04)",
              },
              "&.Mui-disabled": {
                borderColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
              }
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh All Shipments"}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <KPICards data={data} />
          <Box mt={4} sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: 1 }}>
            <ShipmentGrid data={data} />
          </Box>
        </>
      )}

      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={fetchData}
      />
    </Box>
  );
}

export default Dashboard;
