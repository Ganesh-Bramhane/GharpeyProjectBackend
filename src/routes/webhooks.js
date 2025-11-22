const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// ---------------------------------------------------------
// 1️⃣ VERIFY WEBHOOK (GET)
// ---------------------------------------------------------
router.get("/whatsapp", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED SUCCESSFULLY!");
    return res.status(200).send(challenge);
  }

  console.log("❌ WEBHOOK VERIFICATION FAILED!");
  return res.sendStatus(403);
});

// ---------------------------------------------------------
// 2️⃣ HANDLE INCOMING WHATSAPP MESSAGES (POST)
// ---------------------------------------------------------
router.post("/whatsapp", async (req, res) => {
  try {
    const body = req.body;

    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const phone = msg.from;
    const text = msg.text?.body || "";

    console.log(`💬 Incoming: ${phone} → ${text}`);

    // 1️⃣ Find/create user
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    // 2️⃣ Save incoming conversation
    await Conversation.create({
      user_id: user._id,
      direction: "in",
      text,
      raw: body
    });

    // 3️⃣ Generate AI reply
    const aiReply = await require("../services/aiService").generateAIReply(text);

    console.log("🤖 AI Reply:", aiReply);

    // 4️⃣ Send reply back to WhatsApp
    const { sendTextMessage } = require("../services/whatsappService");
    await sendTextMessage(phone, aiReply);

    // 5️⃣ Save outgoing message
    await Conversation.create({
      user_id: user._id,
      direction: "out",
      text: aiReply,
      raw: { aiReply }
    });

    res.sendStatus(200);

  } catch (err) {
    console.error("🔥 WEBHOOK AUTO-REPLY ERROR:", err);
    res.sendStatus(500);
  }
});


module.exports = router;
