import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { parseExcelFile } from "../services/fileService.js";
import { saveImportedBookings } from "../services/shipmentService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure absolute path for uploads to avoid "Cannot access file" relative path issues
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const router = express.Router();
const upload = multer({ dest: UPLOADS_DIR });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const absoluteFilePath = req.file.path; // multer dest is absolute, so path is absolute
    const originalName = req.file.originalname || "";

    // Parse
    const parsedData = await parseExcelFile(absoluteFilePath);

    if (parsedData.length === 0) {
      return res.status(400).json({ success: false, message: "No valid Invoice/Booking rows found in the file." });
    }

    // Save to DB
    const results = await saveImportedBookings(parsedData);

    res.json({
      success: true,
      message: `Successfully processed ${parsedData.length} records.`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
