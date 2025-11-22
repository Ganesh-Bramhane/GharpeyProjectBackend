const axios = require('axios');

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!TOKEN) {
  console.warn("⚠ WHATSAPP_TOKEN not set — messages will fail");
}

const waApi = axios.create({
  baseURL: `https://graph.facebook.com/v24.0/${PHONE_ID}/messages`,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
  },
  timeout: 10000
});

// ⭐ AUTO FIX PHONE FORMAT
function normalizePhone(phone) {
  phone = phone.toString().replace(/\D/g, ""); // remove spaces, +, symbols

  if (phone.startsWith("91")) return phone;
  if (phone.length === 10) return "91" + phone;

  return phone;
}

exports.sendTextMessage = async (to, message) => {
  if (!TOKEN || !PHONE_ID) {
    throw new Error("WhatsApp credentials are missing in .env");
  }

  const phone = normalizePhone(to);

  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: message }
  };

  try {
    console.log("📤 Sending WhatsApp Text →", phone, message);

    const res = await waApi.post("/", payload);

    console.log("✅ WhatsApp API Response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ WhatsApp API ERROR:", err.response?.data || err.message);
    throw err;
  }
};
