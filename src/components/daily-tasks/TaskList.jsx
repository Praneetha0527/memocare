import { useState, useEffect } from "react";
import {
  FiPlus,
  FiCheck,
  FiTrash2,
  FiEdit,
  FiX,
  FiLoader,
} from "react-icons/fi";
import "./tasklist.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching tasks from backend...");

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Tasks response status:", response.status);

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
      console.log("Tasks data:", data);
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(
        "Could not load tasks. Please make sure the backend server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async () => {
    if (!newTask.trim()) {
      setError("Please enter a task");
      return;
    }

    try {
      setError("");
      console.log("Adding task:", newTask);

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text: newTask.trim() }),
      });

      console.log("Add task response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Add task error response:", errorText);
        throw new Error(`Failed to add task: ${response.status}`);
      }

      const savedTask = await response.json();
      console.log("Saved task:", savedTask);

      setTasks([...tasks, savedTask]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding task:", err);
      setError(
        err.message ||
          "Failed to add task. Please check if the backend is running."
      );
    }
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (err) {
      console.error("Error toggling task:", err);
      setError("Failed to update task status.");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  // Start editing task
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditText(task.text);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // Save edited task
  const saveEdit = async (id) => {
    if (!editText.trim()) {
      setError("Task cannot be empty");
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text: editText.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
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
      <div className="task-list">
        <div className="loading-container">
          <FiLoader className="spinner" />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>Task Manager</h2>
      <p>Organize your daily tasks and stay productive</p>

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

      <div className="add-task">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task..."
          className="task-input"
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask} className="btn btn-primary">
          <FiPlus /> Add Task
        </button>
      </div>

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add your first task above!</p>
            <button onClick={fetchTasks} className="btn btn-primary">
              <FiLoader /> Refresh
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.completed ? "completed" : ""}`}
            >
              {editingId === task._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input"
                    onKeyPress={(e) => e.key === "Enter" && saveEdit(task._id)}
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => saveEdit(task._id)}
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
                  <div className="task-content">
                    <button
                      onClick={() => toggleTask(task._id)}
                      className={`status-btn ${
                        task.completed ? "completed" : ""
                      }`}
                    >
                      <FiCheck />
                    </button>
                    <span className="task-text">{task.text}</span>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => startEdit(task)}
                      className="edit-btn"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="delete-btn"
                    >
                      <FiTrash2 />
                    </button>
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

export default TaskList;
