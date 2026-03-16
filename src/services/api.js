import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // MERN backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth tokens if needed
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTasks = (userId) => API.get(`/tasks/${userId}`);
export const createTask = (taskData) => API.post("/tasks", taskData);
export const updateTask = (id, taskData) => API.patch(`/tasks/${id}`, taskData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Add more API calls as needed
