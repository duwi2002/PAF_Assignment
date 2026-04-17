import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:8080/bookings";

function App() {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error on input
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Append seconds if missing (Spring Boot LocalTime expectation)
    const payload = {
      ...formData,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };

    try {
      await axios.post(API_BASE_URL, payload);
      setFormData({ date: "", startTime: "", endTime: "" });
      fetchBookings();
      alert("Booking created successfully!");
    } catch (err) {
      setError(err.response?.data || "Failed to create booking. Please check for overlaps.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}/approve`);
      fetchBookings();
    } catch (err) {
      alert("Error approving booking.");
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Smart Campus Booking System</h1>
      </header>

      <section className="booking-form-section">
        <div className="glass-card">
          <h2>Create New Booking</h2>
          <form onSubmit={handleCreateBooking}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Processing..." : "Create Booking"}
            </button>
          </form>
        </div>
      </section>

      <section className="booking-list-section">
        <h2>Existing Bookings</h2>
        <div className="table-container">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.date}</td>
                    <td>{booking.startTime}</td>
                    <td>{booking.endTime}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
