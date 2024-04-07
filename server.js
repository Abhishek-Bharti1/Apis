// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const bodyParser = require("body-parser");

const app = express();
app.use(cors())
const PORT =3000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://abhishekbharti:abhishek@cluster0.zsppc.mongodb.net/", {
  useUnifiedTopology: true,
});

// Create a schema for tasks
const TaskSchema = new mongoose.Schema({
    id:String,
  name: String,
  status: {
    type: String,
    default: "todo",
  },
});

const Task = mongoose.model("Task", TaskSchema);

app.use(bodyParser.json());

// Define routes

app.get("/api/tasks", async (req, res) => {
    try {
      // Fetch all tasks from the database
      const tasks = await Task.find().select("-__v").lean();
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const { id, name, status } = req.body;
  
      // Validate request
      if (!id || !name || name.length < 3) {
        return res.status(400).json({ message: "Invalid task data" });
      }
  
      const task = new Task({ id, name, status });
  
      await task.save();
  
      res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
// Update task route
app.put("/api/tasks/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
      const {status } = req.body;
  
      const task = await Task.findById(taskId);
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
     
      if (status !== undefined) { 
        task.status = status;
      }
  
      await task.save();
  
      res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

  // Delete task route
app.delete("/api/tasks/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
  
      const deletedTask = await Task.findByIdAndDelete(taskId);
  
      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.status(200).json({ message: "Task deleted successfully", deletedTask });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tasks/download-pdf", async (req, res) => {
    try {
      const tasks = await Task.find().lean(); 
  
      const doc = new PDFDocument();
      const fileName = "tasks.pdf";
  
      res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-type', 'application/pdf');
  
  
      doc.fontSize(20).text('Tasks List', { align: 'center' }).moveDown();
  
      tasks.forEach(task => {
        doc.fontSize(14).text(`Name: ${task.name}`, { continued: true });
        doc.fontSize(12).text(`Status: ${task.status}`).moveDown();
      });
  
      doc.end(); 
  
  
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
