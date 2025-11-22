const User = require('../models/User');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!phone) return res.status(400).json({ error: "phone_required" });

    let user = await User.findOne({ phone });

    if (user) return res.json(user);

    user = await User.create({ name, phone });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
