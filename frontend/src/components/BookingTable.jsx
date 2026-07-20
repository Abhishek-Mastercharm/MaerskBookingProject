import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "bookingNo",
    headerName: "Booking No",
    width: 150,
  },
  {
    field: "shippingLine",
    headerName: "Shipping Line",
    width: 140,
  },
  {
    field: "vesselName",
    headerName: "Vessel",
    width: 220,
  },
  {
    field: "voyageNo",
    headerName: "Voyage",
    width: 120,
  },
  {
    field: "vesselDate",
    headerName: "Vessel Date",
    width: 180,
  },
  {
    field: "eta",
    headerName: "ETA",
    width: 180,
  },
  {
    field: "loadingPort",
    headerName: "Loading Port",
    width: 220,
  },
  {
    field: "destinationPort",
    headerName: "Destination",
    width: 220,
  },
  {
    field: "shipmentStatus",
    headerName: "Status",
    width: 120,
  },
  {
    field: "lastUpdated",
    headerName: "Last Updated",
    width: 180,
  },
];

function BookingTable({ rows }) {
  return (
    <div
      style={{
        background: "#fff",
        marginTop: 20,
        borderRadius: 8,
        padding: 15,
      }}
    >
      <div
        style={{
          height: 600,
          width: "100%",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
                page: 0,
              },
            },
          }}
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
}

export default BookingTable;
