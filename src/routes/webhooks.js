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
  const body = req.body;

  try {
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

      console.log("Incoming message:", phone, text);

      // Find or create user
      let user = await User.findOne({ phone });
      if (!user) user = await User.create({ phone, name: phone });

      // --- AI ANALYSIS ---
      const { analyzeMessage, generateAIReply } = require("../services/aiService");
      const analysis = await analyzeMessage(text);

      // Save the inbound message
      await Conversation.create({
        user_id: user._id,
        phone,
        direction: "in",
        text,
        intent: analysis.intent,
        sentiment: analysis.sentiment,
        raw: body
      });

      // --- AI AUTO-REPLY ---
     // --- RUN WORKFLOW ---
const { runWorkflow } = require("../workflows/workflowEngine");

const workflowResult = await runWorkflow(analysis.intent, user, text);

if (workflowResult?.reply) {
  await Conversation.create({
    user_id: user._id,
    phone,
    direction: "out",
    text: workflowResult.reply,
    raw: { system: true },
    intent: analysis.intent
  });
}

    }

    res.sendStatus(200);
  } catch (e) {
    console.error("Webhook error:", e);
    res.sendStatus(500);
  }
});



module.exports = router;
