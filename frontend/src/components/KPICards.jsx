import { Box, Card, CardContent, Typography } from "@mui/material";

function KPICards({ data }) {
  const total = data.length;
  const inTransit = data.filter((d) => d.shipmentStatus === "ACT" || d.shipmentStatus === "EST" || d.shipmentStatus === "DEPA").length;
  const arrived = data.filter((d) => d.shipmentStatus === "ARRI").length;
  const pending = data.filter((d) => d.shipmentStatus === "PENDING").length;
  const delayed = data.filter((d) => d.shipmentStatus === "DELAYED").length;

  const kpis = [
    { title: "Total Shipments", value: total, color: "#1976d2" },
    { title: "In Transit", value: inTransit, color: "#ed6c02" },
    { title: "Arrived", value: arrived, color: "#2e7d32" },
    { title: "Delayed", value: delayed, color: "#d32f2f" },
    { title: "Pending", value: pending, color: "#9c27b0" },
  ];

  return (
    <Box 
      sx={{ 
        display: "grid", 
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(5, 1fr)" }, 
        gap: 2 
      }}
    >
      {kpis.map((kpi, index) => (
        <Card key={index} sx={{ borderLeft: `5px solid ${kpi.color}`, boxShadow: 2 }}>
          <CardContent>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {kpi.title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {kpi.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default KPICards;
