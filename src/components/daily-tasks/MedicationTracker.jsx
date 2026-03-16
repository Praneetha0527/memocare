import { useState, useEffect } from "react";
import {
  FiPlus,
  FiCheck,
  FiClock,
  FiTrash2,
  FiLoader,
  FiEdit,
  FiX,
} from "react-icons/fi";
import "./medicationtracker.css";

const MedicationTracker = () => {
  const [medications, setMedications] = useState([]);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    time: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editMed, setEditMed] = useState({
    name: "",
    dosage: "",
    time: "",
    taken: false,
  });

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

  // Fetch medications from backend
  const fetchMedications = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching medications from backend...");

      const response = await fetch(`${API_BASE_URL}/api/medications`, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

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
      console.log("Medications data:", data);
      setMedications(data);
    } catch (err) {
      console.error("Failed to fetch medications:", err);
      setError(
        "Could not load medications. Please make sure the backend server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const addMedication = async () => {
    if (!newMed.name || !newMed.dosage || !newMed.time) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError("");
      console.log("Adding medication:", newMed);

      const response = await fetch(`${API_BASE_URL}/api/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newMed),
      });

      console.log("Add response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Add error response:", errorText);
        throw new Error(`Failed to add medication: ${response.status}`);
      }

      const savedMedication = await response.json();
      console.log("Saved medication:", savedMedication);

      setMedications([...medications, savedMedication]);
      setNewMed({ name: "", dosage: "", time: "" });
    } catch (err) {
      console.error("Error adding medication:", err);
      setError(
        err.message ||
          "Failed to add medication. Please check if the backend is running."
      );
    }
  };

  const toggleTaken = async (id) => {
    try {
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/api/medications/${id}/toggle`,
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
        throw new Error(`Failed to update medication: ${response.status}`);
      }

      const updatedMedication = await response.json();
      setMedications(
        medications.map((med) => (med._id === id ? updatedMedication : med))
      );
    } catch (err) {
      console.error("Error toggling medication:", err);
      setError("Failed to update medication status.");
    }
  };

  const deleteMedication = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete medication: ${response.status}`);
      }

      setMedications(medications.filter((med) => med._id !== id));
    } catch (err) {
      console.error("Error deleting medication:", err);
      setError("Failed to delete medication. Please try again.");
    }
  };

  const startEdit = (med) => {
    setEditingId(med._id);
    setEditMed({
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      taken: med.taken,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMed({ name: "", dosage: "", time: "", taken: false });
  };

  const saveEdit = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(editMed),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update medication: ${response.status}`);
      }

      const updatedMedication = await response.json();
      setMedications(
        medications.map((med) => (med._id === id ? updatedMedication : med))
      );
      setEditingId(null);
      setEditMed({ name: "", dosage: "", time: "", taken: false });
    } catch (err) {
      console.error("Error updating medication:", err);
      setError("Failed to update medication. Please try again.");
    }
  };

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
      <div className="medication-tracker">
        <div className="loading-container">
          <FiLoader className="spinner" />
          <p>Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medication-tracker">
      <h2>Medication Tracker</h2>
      <p>Track your daily medications and dosages</p>

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

      <div className="add-medication">
        <input
          type="text"
          value={newMed.name}
          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
          placeholder="Medication name"
          className="med-input"
        />
        <input
          type="text"
          value={newMed.dosage}
          onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
          placeholder="Dosage"
          className="med-input"
        />
        <input
          type="time"
          value={newMed.time}
          onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
          className="med-input"
        />
        <button onClick={addMedication} className="btn btn-primary">
          <FiPlus /> Add
        </button>
      </div>

      <div className="medication-list">
        {medications.length === 0 ? (
          <div className="empty-state">
            <p>No medications added yet.</p>
            <button onClick={fetchMedications} className="btn btn-primary">
              <FiLoader /> Refresh
            </button>
          </div>
        ) : (
          medications.map((med) => (
            <div
              key={med._id}
              className={`medication-card ${med.taken ? "taken" : ""}`}
            >
              {editingId === med._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editMed.name}
                    onChange={(e) =>
                      setEditMed({ ...editMed, name: e.target.value })
                    }
                    placeholder="Medication name"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={editMed.dosage}
                    onChange={(e) =>
                      setEditMed({ ...editMed, dosage: e.target.value })
                    }
                    placeholder="Dosage"
                    className="edit-input"
                  />
                  <input
                    type="time"
                    value={editMed.time}
                    onChange={(e) =>
                      setEditMed({ ...editMed, time: e.target.value })
                    }
                    className="edit-input"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => saveEdit(med._id)}
                      className="btn btn-primary"
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="med-info">
                    <h3>{med.name}</h3>
                    <p>{med.dosage}</p>
                    <div className="med-time">
                      <FiClock /> {med.time}
                    </div>
                    <div className="med-status">
                      Status:{" "}
                      {med.taken ? (
                        <span className="status-taken">Taken</span>
                      ) : (
                        <span className="status-pending">Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="med-actions">
                    <button
                      onClick={() => toggleTaken(med._id)}
                      className={`status-btn ${med.taken ? "taken" : ""}`}
                    >
                      <FiCheck /> {med.taken ? "Taken" : "Mark Taken"}
                    </button>
                    <div className="action-buttons">
                      <button
                        onClick={() => startEdit(med)}
                        className="edit-btn"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => deleteMedication(med._id)}
                        className="delete-btn"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicationTracker;
