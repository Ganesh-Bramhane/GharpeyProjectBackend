const { sendTextMessage } = require("../services/whatsappService");

module.exports = async (user, text) => {
  const reply =
    `Sure! I can help you with your booking.  
Please share:  
• Your city  
• Service needed  
• Preferred date`;

  await sendTextMessage(user.phone, reply);

  return {
    workflow: "booking_workflow",
    reply,
  };
};
