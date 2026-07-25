import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

const columns = [
  { field: "invoiceNo", headerName: "Invoice No", flex: 1, minWidth: 120 },
  { field: "bookingNo", headerName: "Booking No", flex: 1, minWidth: 120 },
  { field: "shippingLine", headerName: "Line", flex: 0.5, minWidth: 100 },
  { field: "vesselName", headerName: "Vessel", flex: 1, minWidth: 150 },
  { field: "voyageNo", headerName: "Voyage", flex: 0.8, minWidth: 100 },
  {
    field: "vesselDate",
    headerName: "Vessel Date",
    flex: 1,
    minWidth: 120,
    valueFormatter: (params) => {
      if (!params) return "";
      return new Date(params).toLocaleDateString();
    },
  },
  { field: "loadingPort", headerName: "POL", flex: 1, minWidth: 120 },
  { field: "destinationPort", headerName: "POD", flex: 1, minWidth: 120 },
  {

    field: "eta",
    headerName: "ETA",
    flex: 1,
    minWidth: 120,
    valueFormatter: (params) => {
      if (!params) return "";
      return new Date(params).toLocaleDateString();
    },
  },
  {
    field: "shipmentStatus",
    headerName: "Status",
    flex: 0.8,
    minWidth: 120,
    renderCell: (params) => {
      let color = "default";
      if (params.value === "ARRI") color = "success";
      else if (params.value === "ACT" || params.value === "EST" || params.value === "DEPA") color = "warning";
      else if (params.value === "DELAYED") color = "error";
      return <Chip label={params.value || "UNKNOWN"} color={color} size="small" />;
    },
  },
  {
    field: "lastUpdated",
    headerName: "Last Updated",
    flex: 1,
    minWidth: 150,
    valueFormatter: (params) => {
      if (!params) return "";
      return new Date(params).toLocaleString();
    },
  },
];

function ShipmentGrid({ data }) {
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.bookingNo}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
    </div>
  );
}

export default ShipmentGrid;
