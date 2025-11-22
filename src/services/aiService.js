const axios = require("axios");

exports.generateAIResponse = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are GharPay AI assistant. Give short helpful answers."
        },
        { role: "user", content: prompt }
      ]
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` }
    }
  );

  return res.data.choices[0].message.content;
};
