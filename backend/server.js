const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Enhanced CORS configuration ===
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);


// === Middleware ===
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// === MongoDB Connection ===
// Fixed the connection string - removed the database name from the connection string
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// === Define All Schemas ===

// Photo Schema
const photoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageData: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});
const Photo = mongoose.model("Photo", photoSchema);

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Reminder = mongoose.model("Reminder", reminderSchema);

// VoiceNote Schema
const voiceNoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  audioData: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const VoiceNote = mongoose.model("VoiceNote", voiceNoteSchema);

// Medication Schema
const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    required: true,
  },
  taken: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

medicationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Medication = mongoose.model("Medication", medicationSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Task = mongoose.model("Task", taskSchema);

// Routine Schema - Fixed to match frontend expectations
const routineSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  activity: {
    type: String,
    required: true,
    trim: true,
  },
  important: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

routineSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Routine = mongoose.model("Routine", routineSchema);


// === API ROUTES ===

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend connected!" });
});

// === Voice Notes ===
app.get("/api/voicenotes", async (req, res) => {
  try {
    console.log("Fetching voice notes...");
    const notes = await VoiceNote.find().sort({ date: -1 });
    console.log(`Found ${notes.length} voice notes`);
    res.json(notes);
  } catch (err) {
    console.error("Error fetching voice notes:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch voice notes", error: err.message });
  }
});

app.post("/api/voicenotes", async (req, res) => {
  try {
    console.log("Received voice note save request");
    const { name, audioData, date } = req.body;

    if (!name || !audioData) {
      return res.status(400).json({
        message: "Name and audio data are required",
        received: { name: !!name, audioData: !!audioData },
      });
    }

    const newNote = new VoiceNote({
      name,
      audioData,
      date: date || new Date(),
    });

    const savedNote = await newNote.save();
    console.log("Voice note saved successfully:", savedNote._id);
    res.status(201).json(savedNote);
  } catch (err) {
    console.error("Error saving voice note:", err);
    res
      .status(500)
      .json({ message: "Failed to save voice note", error: err.message });
  }
});

app.delete("/api/voicenotes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deletedNote = await VoiceNote.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ message: "Voice note not found" });
    }

    console.log("Voice note deleted:", id);
    res.json({ message: "Voice note deleted successfully", id });
  } catch (err) {
    console.error("Delete voice note error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete voice note", error: err.message });
  }
});

// === Medication Routes ===
app.get("/api/medications", async (req, res) => {
  try {
    const medications = await Medication.find().sort({ time: 1 });
    res.json(medications);
  } catch (err) {
    console.error("Error fetching medications:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch medications", error: err.message });
  }
});

app.post("/api/medications", async (req, res) => {
  try {
    const { name, dosage, time } = req.body;

    if (!name || !dosage || !time) {
      return res.status(400).json({
        message: "Name, dosage, and time are required",
        received: { name: !!name, dosage: !!dosage, time: !!time },
      });
    }

    const newMedication = new Medication({
      name,
      dosage,
      time,
      taken: false,
    });

    const savedMedication = await newMedication.save();
    res.status(201).json(savedMedication);
  } catch (err) {
    console.error("Error saving medication:", err);
    res
      .status(500)
      .json({ message: "Failed to save medication", error: err.message });
  }
});

app.patch("/api/medications/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const medication = await Medication.findById(id);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    medication.taken = !medication.taken;
    medication.updatedAt = Date.now();

    const updatedMedication = await medication.save();
    res.json(updatedMedication);
  } catch (err) {
    console.error("Error toggling medication status:", err);
    res
      .status(500)
      .json({ message: "Failed to update medication", error: err.message });
  }
});

app.delete("/api/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deletedMedication = await Medication.findByIdAndDelete(id);

    if (!deletedMedication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.json({ message: "Medication deleted successfully", id });
  } catch (err) {
    console.error("Error deleting medication:", err);
    res
      .status(500)
      .json({ message: "Failed to delete medication", error: err.message });
  }
});

app.put("/api/medications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage, time, taken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const medication = await Medication.findById(id);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    if (name !== undefined) medication.name = name;
    if (dosage !== undefined) medication.dosage = dosage;
    if (time !== undefined) medication.time = time;
    if (taken !== undefined) medication.taken = taken;

    medication.updatedAt = Date.now();

    const updatedMedication = await medication.save();
    res.json(updatedMedication);
  } catch (err) {
    console.error("Error updating medication:", err);
    res
      .status(500)
      .json({ message: "Failed to update medication", error: err.message });
  }
});

// === Task Routes ===
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch tasks", error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Task text is required",
        received: { text: !!text },
      });
    }

    const newTask = new Task({
      text: text.trim(),
      completed: false,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error saving task:", err);
    res
      .status(500)
      .json({ message: "Failed to save task", error: err.message });
  }
});

app.patch("/api/tasks/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    task.updatedAt = Date.now();

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error("Error toggling task status:", err);
    res
      .status(500)
      .json({ message: "Failed to update task", error: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", id });
  } catch (err) {
    console.error("Error deleting task:", err);
    res
      .status(500)
      .json({ message: "Failed to delete task", error: err.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Task text is required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.text = text.trim();
    task.updatedAt = Date.now();

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res
      .status(500)
      .json({ message: "Failed to update task", error: err.message });
  }
});

// === Routine Routes - Fixed to work with frontend ===
app.get("/api/routines", async (req, res) => {
  try {
    console.log("Fetching routines from backend...");
    const routines = await Routine.find().sort({ time: 1 });
    console.log(`Found ${routines.length} routines`);
    res.json(routines);
  } catch (err) {
    console.error("Error fetching routines:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch routines", error: err.message });
  }
});

app.post("/api/routines", async (req, res) => {
  try {
    console.log("Received routine save request:", req.body);
    const { time, activity, important } = req.body;

    if (!time || !activity) {
      return res.status(400).json({
        message: "Time and activity are required",
        received: { time: !!time, activity: !!activity },
      });
    }

    const newRoutine = new Routine({
      time,
      activity: activity.trim(),
      important: important || false,
      completed: false,
    });

    const savedRoutine = await newRoutine.save();
    console.log("Routine saved successfully:", savedRoutine._id);
    res.status(201).json(savedRoutine);
  } catch (err) {
    console.error("Error saving routine:", err);
    res
      .status(500)
      .json({ message: "Failed to save routine", error: err.message });
  }
});

app.patch("/api/routines/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Toggling routine completion for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const routine = await Routine.findById(id);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    routine.completed = !routine.completed;
    routine.updatedAt = Date.now();

    const updatedRoutine = await routine.save();
    console.log("Routine toggled successfully:", updatedRoutine);
    res.json(updatedRoutine);
  } catch (err) {
    console.error("Error toggling routine status:", err);
    res
      .status(500)
      .json({ message: "Failed to update routine", error: err.message });
  }
});

app.delete("/api/routines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting routine with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deletedRoutine = await Routine.findByIdAndDelete(id);

    if (!deletedRoutine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    console.log("Routine deleted successfully:", id);
    res.json({ message: "Routine deleted successfully", id });
  } catch (err) {
    console.error("Error deleting routine:", err);
    res
      .status(500)
      .json({ message: "Failed to delete routine", error: err.message });
  }
});

app.put("/api/routines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { time, activity, important } = req.body;
    console.log("Updating routine:", id, req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const routine = await Routine.findById(id);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (time !== undefined) routine.time = time;
    if (activity !== undefined) routine.activity = activity.trim();
    if (important !== undefined) routine.important = important;

    routine.updatedAt = Date.now();

    const updatedRoutine = await routine.save();
    console.log("Routine updated successfully:", updatedRoutine);
    res.json(updatedRoutine);
  } catch (err) {
    console.error("Error updating routine:", err);
    res
      .status(500)
      .json({ message: "Failed to update routine", error: err.message });
  }
});

// === Health check endpoint ===
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// === Error handling middleware ===
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// === 404 handler ===
app.use((req, res) => {
  console.log("404 Error: Endpoint not found -", req.method, req.url);
  res.status(404).json({ message: "Endpoint not found" });
});

// === Start the Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🎤 Voice notes API at http://localhost:${PORT}/api/voicenotes`);
  console.log(`💊 Medication API at http://localhost:${PORT}/api/medications`);
  console.log(`✅ Task API at http://localhost:${PORT}/api/tasks`);
  console.log(`📅 Routine API at http://localhost:${PORT}/api/routines`);
});
