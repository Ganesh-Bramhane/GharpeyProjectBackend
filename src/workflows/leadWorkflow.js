const { sendTextMessage } = require("../services/whatsappService");

module.exports = async (user, text) => {
  // Auto-reply message
  const reply = 
    `Hi ${user.name || ""}! 👋  
Thanks for contacting us.  
How can we assist you today?`;

  // Send message
  await sendTextMessage(user.phone, reply);

  return {
    workflow: "lead_workflow",
    reply,
  };
};
