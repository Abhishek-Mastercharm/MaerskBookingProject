import { useState } from "react";

import api from "../api/bookingApi";

import Header from "../components/Header";
import Loader from "../components/Loader";
import SearchBox from "../components/SearchBox";
import BookingTable from "../components/BookingTable";

function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([]);

  const fetchBookings = async (bookings) => {
    try {
      setLoading(true);

      const response = await api.get("/bookings", {
        params: {
          booking: bookings.join(","),
        },
      });

      console.log(response.data);

      const tableRows = (response.data.results || [])
        .filter((item) => item.success)
        .map((item, index) => ({
          id: index + 1,
          ...item.row,
        }));

      setRows(tableRows);
    } catch (err) {
      console.error(err);

      alert("Unable to fetch booking details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <SearchBox onFetch={fetchBookings} loading={loading} />

      {loading && <Loader />}

      {!loading && rows.length > 0 && <BookingTable rows={rows} />}
    </div>
  );
}

export default Dashboard;
