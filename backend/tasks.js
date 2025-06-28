const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  project: { type: String },
  status: { type: String, default: 'To Do' }, // simple default status
  assignee: { type: String },
  dueDate: { type: Date },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Auto'], 
    default: 'Auto' 
  },
  priorityConfidence: {
    type: Number,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
