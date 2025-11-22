const cron = require("node-cron");
const Conversation = require("../models/Conversation");
const { sendTextMessage } = require("../services/whatsappService");

cron.schedule("0 * * * *", async () => {
  // run every hour
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const inactiveUsers = await Conversation.aggregate([
    {
      $group: {
        _id: "$phone",
        lastMsg: { $max: "$createdAt" }
      }
    },
    {
      $match: {
        lastMsg: { $lt: oneDayAgo }
      }
    }
  ]);

  inactiveUsers.forEach(async (u) => {
    await sendTextMessage(u._id, "⏳ Just checking in! Do you still need help?");
  });

});
