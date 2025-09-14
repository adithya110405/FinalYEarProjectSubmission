// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded files

// MongoDB Atlas connection
mongoose.connect(
  "mongodb+srv://asin_db_user:abcdefg@cluster0.8pvgowo.mongodb.net/fyp_manager?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Schema
const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  files: [String],
  status: { type: String, default: "Pending" }
});
const Project = mongoose.model("Project", projectSchema);

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Routes
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post("/api/projects", upload.array("files"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files ? req.files.map(f => f.filename) : [];
    const project = new Project({ title, description, files });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to add project" });
  }
});

app.listen(5000, () => console.log("Server running on http://127.0.0.1:5000"));
