import xlsx from "xlsx";
import fs from "fs";

export async function parseExcelFile(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    let parsedData = [];

    // Check all sheets
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet, { raw: false });

      const sheetRecords = [];

      for (const row of rawData) {
        let invoiceNo = null;
        let bookingNo = null;

        for (const [key, value] of Object.entries(row)) {
          const lowerKey = String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const cleanValue = value !== null && value !== undefined ? String(value).trim() : "";

          if (lowerKey.includes("inv") && cleanValue && !invoiceNo) {
            invoiceNo = cleanValue;
          }
          if ((lowerKey.includes("booking") || lowerKey.includes("bl")) && cleanValue && !bookingNo) {
            bookingNo = cleanValue;
          }
        }

        if (invoiceNo && bookingNo) {
          sheetRecords.push({ invoiceNo, bookingNo });
        }
      }

      if (sheetRecords.length > 0) {
        parsedData = sheetRecords;
        break; // Stop looking after we found valid records on a sheet
      }
    }

    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }

    return parsedData;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }
    throw new Error("Failed to parse file: " + error.message);
  }
}
