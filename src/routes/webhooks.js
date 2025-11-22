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
router.post('/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    if (
      body.object &&
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const msg = body.entry[0].changes[0].value.messages[0];
      const phone = msg.from;
      const text = msg.text?.body || "";

      console.log("Incoming:", phone, text);

      // 1. USER create / find
      let user = await User.findOne({ phone });
      if (!user) user = await User.create({ phone, name: "User " + phone });

      // 2. Save incoming message
      await Conversation.create({
        user_id: user._id,
        phone,
        direction: "in",
        text,
        raw: body
      });

      // 3. Auto Welcome Message (ONLY first message)
      const count = await Conversation.countDocuments({ phone });
      if (count === 1) {
        await sendTextMessage(phone, "👋 Hi! Welcome to GharPay. How can I help you?");
      }

      // 4. AI AUTO REPLY ALWAYS
      const aiReply = await aiService.generateAIResponse(text);
      await sendTextMessage(phone, aiReply);

      // save bot message
      await Conversation.create({
        user_id: user._id,
        phone,
        direction: "out",
        text: aiReply,
        raw: { ai: true }
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});




module.exports = router;
