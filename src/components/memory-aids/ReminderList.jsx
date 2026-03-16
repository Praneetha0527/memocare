import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiBell, FiTrash2 } from "react-icons/fi";
import "./reminderlist.css";

const ReminderList = () => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const fetchReminders = async () => {
      try {
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${API_URL}/reminders`);

        setReminders(res.data);
      } catch (err) {
        console.error("Error fetching reminders:", err);
      }
    };

    fetchReminders();
  }, []);

  const addReminder = async () => {
    if (newReminder.trim() && newTime) {
      try {
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await axios.post(`${API_URL}/reminders`, {
          text: newReminder,
          time: newTime,
        });
        setReminders([res.data, ...reminders]);
        setNewReminder("");
        setNewTime("");
      } catch (err) {
        console.error("Error adding reminder:", err);
      }
    }
  };

  const toggleReminder = async (id, currentStatus) => {
    try {
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await axios.patch(
        `${API_URL}/reminders/${id}`,

        {
          active: !currentStatus,
        }
      );
      setReminders(
        reminders.map((reminder) => (reminder._id === id ? res.data : reminder))
      );
    } catch (err) {
      console.error("Error toggling reminder:", err);
    }
  };

  const deleteReminder = async (id) => {
    try {
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.delete(`${API_URL}/reminders/${id}`);
      setReminders(reminders.filter((reminder) => reminder._id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  return (
    <div className="reminder-list">
      <h2>Reminders</h2>
      <p>Set important reminders with alerts</p>

      <div className="add-reminder">
        <input
          type="text"
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          placeholder="Reminder text..."
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <button onClick={addReminder} className="btn btn-primary">
          <FiPlus /> Add
        </button>
      </div>

      <ul className="reminders">
        {reminders.map((reminder) => (
          <li
            key={reminder._id}
            className={reminder.active ? "active" : "inactive"}
          >
            <div className="reminder-info">
              <FiBell className="bell-icon" />
              <div>
                <span className="reminder-time">{reminder.time}</span>
                <span className="reminder-text">{reminder.text}</span>
              </div>
            </div>
            <div className="reminder-actions">
              <button
                onClick={() => toggleReminder(reminder._id, reminder.active)}
                className="toggle-btn"
              >
                {reminder.active ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => deleteReminder(reminder._id)}
                className="delete-btn"
              >
                <FiTrash2 />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReminderList;
