import { useState, useEffect } from "react";
import {
  FiPlus,
  FiClock,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiLoader,
  FiX,
} from "react-icons/fi";
import "./routineplanner.css";

const RoutinePlanner = () => {
  const [routines, setRoutines] = useState([]);
  const [newRoutine, setNewRoutine] = useState({
    time: "",
    activity: "",
    important: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

  // Fetch routines from backend
  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching routines from backend...");

      const response = await fetch(`${API_BASE_URL}/api/routines`, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Routines response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${contentType}`);
      }

      const data = await response.json();
      console.log("Routines data:", data);
      setRoutines(data);
    } catch (err) {
      console.error("Failed to fetch routines:", err);
      setError(
        "Could not load routines. Please make sure the backend server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Add or update routine
  const saveRoutine = async () => {
    if (!newRoutine.time || !newRoutine.activity) {
      setError("Please fill in both time and activity");
      return;
    }

    try {
      setError("");
      console.log("Saving routine:", newRoutine);

      const url = editingId
        ? `${API_BASE_URL}/api/routines/${editingId}`
        : `${API_BASE_URL}/api/routines`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newRoutine),
      });

      console.log("Save routine response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Save routine error response:", errorText);
        throw new Error(`Failed to save routine: ${response.status}`);
      }

      const savedRoutine = await response.json();
      console.log("Saved routine:", savedRoutine);

      if (editingId) {
        setRoutines(
          routines.map((routine) =>
            routine._id === editingId ? savedRoutine : routine
          )
        );
      } else {
        setRoutines([...routines, savedRoutine]);
      }

      setNewRoutine({ time: "", activity: "", important: false });
      setEditingId(null);
    } catch (err) {
      console.error("Error saving routine:", err);
      setError(
        err.message ||
          "Failed to save routine. Please check if the backend is running."
      );
    }
  };

  // Toggle routine completion
  const toggleComplete = async (id) => {
    try {
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/api/routines/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update routine: ${response.status}`);
      }

      const updatedRoutine = await response.json();
      setRoutines(
        routines.map((routine) =>
          routine._id === id ? updatedRoutine : routine
        )
      );
    } catch (err) {
      console.error("Error toggling routine:", err);
      setError("Failed to update routine status.");
    }
  };

  // Delete routine
  const deleteRoutine = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/routines/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete routine: ${response.status}`);
      }

      setRoutines(routines.filter((routine) => routine._id !== id));
    } catch (err) {
      console.error("Error deleting routine:", err);
      setError("Failed to delete routine. Please try again.");
    }
  };

  // Start editing routine
  const startEditing = (routine) => {
    setEditingId(routine._id);
    setNewRoutine({
      time: routine.time,
      activity: routine.activity,
      important: routine.important,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setNewRoutine({ time: "", activity: "", important: false });
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/test`);
      const data = await response.json();
      setError("Backend connection successful! " + data.message);
    } catch (err) {
      setError(
        "Backend connection failed. Make sure the server is running on port 5000."
      );
    }
  };

  if (loading) {
    return (
      <div className="routine-planner">
        <div className="loading-container">
          <FiLoader className="spinner" />
          <p>Loading routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="routine-planner">
      <h2>Daily Routine Planner</h2>
      <p className="subtitle">
        Create a structured daily routine to help maintain consistency
      </p>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <div className="error-actions">
            <button onClick={() => setError("")} className="dismiss-btn">
              <FiX />
            </button>
            {error.includes("backend") && (
              <button onClick={testBackendConnection} className="test-btn">
                Test Connection
              </button>
            )}
          </div>
        </div>
      )}

      <div className="routine-form">
        <div className="form-group">
          <label>Time:</label>
          <input
            type="time"
            value={newRoutine.time}
            onChange={(e) =>
              setNewRoutine({ ...newRoutine, time: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Activity:</label>
          <input
            type="text"
            value={newRoutine.activity}
            onChange={(e) =>
              setNewRoutine({ ...newRoutine, activity: e.target.value })
            }
            placeholder="e.g., Take medication, Walk, Lunch"
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={newRoutine.important}
              onChange={(e) =>
                setNewRoutine({ ...newRoutine, important: e.target.checked })
              }
            />
            Important (highlight)
          </label>
        </div>

        <div className="form-actions">
          {editingId ? (
            <>
              <button onClick={saveRoutine} className="btn btn-primary">
                <FiCheck /> Update
              </button>
              <button onClick={cancelEditing} className="btn btn-secondary">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={saveRoutine} className="btn btn-primary">
              <FiPlus /> Add Activity
            </button>
          )}
        </div>
      </div>

      <div className="routine-list">
        {routines.length === 0 ? (
          <div className="empty-state">
            <p>No routines added yet. Add your first activity above.</p>
            <button onClick={fetchRoutines} className="btn btn-primary">
              <FiLoader /> Refresh
            </button>
          </div>
        ) : (
          routines
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((routine) => (
              <div
                key={routine._id}
                className={`routine-item ${
                  routine.completed ? "completed" : ""
                } ${routine.important ? "important" : ""}`}
              >
                <div className="routine-time">
                  <FiClock /> {routine.time}
                </div>

                <div className="routine-activity">{routine.activity}</div>

                <div className="routine-actions">
                  <button
                    onClick={() => toggleComplete(routine._id)}
                    className={`status-btn ${
                      routine.completed ? "completed" : ""
                    }`}
                    aria-label={
                      routine.completed ? "Mark incomplete" : "Mark complete"
                    }
                  >
                    <FiCheck />
                  </button>

                  <button
                    onClick={() => startEditing(routine)}
                    className="edit-btn"
                    aria-label="Edit"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => deleteRoutine(routine._id)}
                    className="delete-btn"
                    aria-label="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default RoutinePlanner;
