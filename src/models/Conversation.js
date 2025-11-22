const mongoose = require('mongoose');

const ConvSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  phone: { type: String }, // store phone for quick lookup if user not created
  direction: { type: String, enum: ['in','out'], required: true },
  text: { type: String },
  raw: { type: Object, default: {} },
  intent: { type: String, default: null },
  sentiment: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConvSchema);
