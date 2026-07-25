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
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>Import Excel / CSV</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            Upload an Excel or CSV file containing <strong>OUR INV NO</strong> and <strong>BOOKING NO</strong> columns.
          </Typography>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            style={{ marginTop: "1rem" }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          color="primary"
          variant="contained"
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Uploading..." : "Upload & Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportModal;
