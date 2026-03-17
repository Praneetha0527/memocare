const express = require("express");
const router = express.Router();
const VoiceNote = require("../models/VoiceNote");

router.get("/", async (req, res) => {
  try {
    const notes = await VoiceNote.find().sort({ date: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch voice notes" });
  }
});

// POST a new note
router.post("/", async (req, res) => {
  const { name, audioData, date } = req.body;
  if (!name || !audioData)
    return res.status(400).json({ message: "Name and audio data required" });

  try {
    const note = new VoiceNote({ name, audioData, date });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch {
    res.status(500).json({ message: "Failed to save voice note" });
  }
});

// DELETE a note
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await VoiceNote.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Voice note deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete voice note" });
  }
});

module.exports = router;
