const mongoose = require('mongoose');

const AgendaSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'] 
  },
  time: String,
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: String,
  participants: [String],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
AgendaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Agenda', AgendaSchema);