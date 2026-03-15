import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TicketView() {
  const { number } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {

  async function loadTicket() {
    const res = await fetch(`/api/tickets/${number}`);
    const data = await res.json();
    setTicket(data);
    setLoading(false);
  }

  loadTicket();

  const interval = setInterval(loadTicket, 10000);

  return () => clearInterval(interval);

}, [number]);

  if (loading) return <div>Loading ticket...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      
      <h1>Ticket {ticket.ticket.number}</h1>

      <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
        
        <p><strong>Name:</strong> {ticket.ticket.name}</p>
        <p><strong>Service:</strong> {ticket.ticket.service}</p>
        <p><strong>Status:</strong> {ticket.ticket.status}</p>

        <hr />

        <p>
          <strong>Queue Position:</strong> {ticket.queue_position}
        </p>

        <p>
          <strong>Tickets Ahead:</strong> {ticket.tickets_ahead}
        </p>

        <p>
          <strong>Estimated Wait:</strong>{" "}
          {Math.round(ticket.estimated_wait_minutes)} minutes
        </p>

        <p>
          <small>
            Avg Service Time: {Math.round(ticket.avg_service_time_seconds)} seconds
          </small>
        </p>

      </div>
    </div>
  );
}
