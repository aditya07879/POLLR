import { useState, useEffect } from "react";

export default function useCountdown(expiresAt) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setUrgent(false);
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setUrgent(diff < 300000); // < 5 min

      if (days > 0) setTimeLeft(`${days}d ${hours}h remaining`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m remaining`);
      else setTimeLeft(`${mins}m ${secs}s remaining`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return { timeLeft, urgent };
}
