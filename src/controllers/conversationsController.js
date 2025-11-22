const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { sendTextMessage } = require('../services/whatsappService');

// -----------------------------------------------------
// 1️⃣ GET ALL CONVERSATIONS / MESSAGES FOR A USER (BY PHONE)
// -----------------------------------------------------
exports.getConversationsForUser = async (req, res, next) => {
  try {
    const phone = req.params.phone;   // always phone

    const convs = await Conversation.find({ phone })
      .sort({ createdAt: 1 })
      .limit(2000);

    res.json(convs);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------
// 2️⃣ SEND MESSAGE TO USER (WHATSAPP) + SAVE IN DB
// -----------------------------------------------------
exports.sendMessageToUser = async (req, res, next) => {
  try {
    const phone = req.params.phone;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "text_required" });
    }

    // 1️⃣ find user or create if missing
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    // 2️⃣ SEND MESSAGE to WhatsApp (API)
    const waRes = await sendTextMessage(phone, text);

    // 3️⃣ save outbound message
    const conv = await Conversation.create({
      user_id: user._id,
      phone,
      direction: "out",
      text,
      raw: waRes,
    });

    res.json(conv);
  } catch (err) {
    console.error("Send message error:", err);
    next(err);
  }
};
