const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { sendTextMessage } = require('../services/whatsappService');
const { analyzeMessage } = require('../services/aiService');

exports.getConversationsForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const convs = await Conversation.find({
      $or: [{ user_id: userId }, { phone: userId }]
    }).sort({ createdAt: 1 });

    res.json(convs);
  } catch (err) { next(err); }
};

exports.sendMessageToUser = async (req, res, next) => {
  try {
    const userIdOrPhone = req.params.userId;
    const { text } = req.body;

    let user = null;

    if (/^\d+$/.test(userIdOrPhone)) {
      user = await User.findOne({ phone: userIdOrPhone });
    } else {
      user = await User.findById(userIdOrPhone);
    }

    const toPhone = user ? user.phone : userIdOrPhone;

    const waRes = await sendTextMessage(toPhone, text);

    const conv = await Conversation.create({
      user_id: user ? user._id : null,
      phone: toPhone,
      direction: 'out',
      text,
      raw: waRes
    });

    res.json(conv);
  } catch (err) { next(err); }
};

exports.processIncomingMessage = async (req, res, next) => {
  try {
    const { phone, text } = req.body;

    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    const ai = await analyzeMessage(text);

    await Conversation.create({
      user_id: user._id,
      phone,
      direction: "in",
      text,
      intent: ai.intent,
      sentiment: ai.sentiment,
      raw: req.body
    });

    await sendTextMessage(phone, ai.reply);

    res.json({ status: "ok", ai });
  } catch (err) {
    next(err);
  }
};
