const cron = require("node-cron");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { sendTextMessage } = require("../services/whatsappService");

// ================================
// 1. WELCOME MESSAGE (user created)
// ================================
async function sendWelcomeMessages() {
  const users = await User.find({ welcomeSent: { $ne: true } });

  for (let u of users) {
    await sendTextMessage(u.phone, "Welcome to our service! How can we help?");
    u.welcomeSent = true;
    await u.save();
  }
}

// ========================================
// 2. FOLLOW-UP (24 hours कोई reply नहीं किया)
// ========================================
async function sendFollowUps() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const users = await User.find();

  for (let u of users) {
    const lastMsg = await Conversation.findOne({ phone: u.phone }).sort({ createdAt: -1 });

    if (lastMsg && lastMsg.direction === "in" && lastMsg.createdAt < dayAgo) {
      await sendTextMessage(u.phone, "Just checking in — do you need any help?");
    }
  }
}

// ========================================
// 3. DOCUMENT REMINDER
// ========================================
async function documentReminder() {
  const users = await User.find({ documentSubmitted: { $ne: true } });

  for (let u of users) {
    await sendTextMessage(u.phone, "Please upload your pending documents.");
  }
}

// ========================================
// 4. SALARY REMINDER (Every month 1st)
// ========================================
async function salaryReminder() {
  const today = new Date();

  if (today.getDate() === 1) {
    const users = await User.find();

    for (let u of users) {
      await sendTextMessage(u.phone, "Your salary reminder for this month.");
    }
  }
}

// ========== CRON JOBS ==========

// check every minute
cron.schedule("* * * * *", () => {
  sendWelcomeMessages();
  sendFollowUps();
  documentReminder();
  salaryReminder();
});

console.log("⏰ Scheduler started");
