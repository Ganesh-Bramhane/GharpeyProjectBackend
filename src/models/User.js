const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, unique: true, required: true },
  language_pref: { type: String },
  role: { type: String, default: 'user' },
  meta: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
