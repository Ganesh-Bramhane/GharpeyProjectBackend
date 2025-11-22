const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generateAIReply = async (message, lang = "english") => {
  try {
    const prompt = `
User said: "${message}"
Language: ${lang}

You are an AI assistant for GharPe (Gig Workforce Platform).
You must:
- Detect user’s intent
- Reply VERY SHORT
- Reply in same language as user
- Be friendly and helpful
- If unclear, ask simple clarification.

Now generate reply:
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("AI Error:", err);
    return "Sorry, I couldn't understand. Can you repeat?";
  }
};
