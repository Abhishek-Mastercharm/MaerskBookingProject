import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../api/bookingApi";

function ImportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert(res.data.message);
        onSuccess();
        onClose();
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>Import Excel / CSV</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload an Excel or CSV file containing <strong>OUR INV NO</strong> and <strong>BOOKING NO</strong> columns to sync shipments.
          </Typography>
          
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.5 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{
                color: "#0090da",
                borderColor: "#0090da",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  borderColor: "#0072b0",
                  bgcolor: "rgba(0, 144, 218, 0.04)",
                }
              }}
            >
              Choose File
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            {file && (
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: "medium", mt: 0.5 }}>
                Selected File: <span style={{ color: "#0090da" }}>{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{
            color: "#666",
            borderColor: "#ccc",
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              borderColor: "#999",
              bgcolor: "rgba(0, 0, 0, 0.04)",
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
          sx={{
            bgcolor: "#00243d",
            color: "white",
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#001a2d",
            },
            "&.Mui-disabled": {
              bgcolor: "rgba(0, 0, 0, 0.12)",
              color: "rgba(0, 0, 0, 0.26)",
            }
          }}
        >
          {loading ? "Uploading..." : "Upload & Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportModal;
