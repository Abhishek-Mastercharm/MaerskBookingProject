import { useState } from "react";

function SearchBox({ onFetch, loading }) {
  const [bookingText, setBookingText] = useState("");

  const handleFetch = () => {
    let bookings = bookingText
      .split(/[\n,]+/)
      .map((b) => b.trim())
      .filter((b) => b !== "");

    bookings = [...new Set(bookings)];

    if (bookings.length === 0) {
      alert("Please enter booking numbers.");
      return;
    }

    onFetch(bookings);
  };

  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 8,
        marginBottom: 25,
        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
      }}
    >
      <label
        style={{
          fontWeight: "bold",
        }}
      >
        Booking Numbers
      </label>

      <textarea
        rows={8}
        placeholder={`274244174
272932703
274555555`}
        value={bookingText}
        onChange={(e) => setBookingText(e.target.value)}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 12,
          resize: "vertical",
          fontSize: 15,
        }}
      />

      <button
        onClick={handleFetch}
        disabled={loading}
        style={{
          marginTop: 15,
          background: "#003366",
          color: "white",
          border: "none",
          padding: "12px 25px",
          cursor: "pointer",
          borderRadius: 5,
          fontWeight: "bold",
        }}
      >
        {loading ? "Fetching..." : "Fetch Bookings"}
      </button>
    </div>
  );
}

export default SearchBox;
