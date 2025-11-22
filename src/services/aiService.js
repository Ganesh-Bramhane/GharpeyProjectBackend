const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeMessage = async (text) => {
  try {
    const res = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
        Analyze the following message.
        Return JSON only with:
        {
          "intent": "",
          "sentiment": "",
          "entities": {}
        }

        Message: "${text}"
      `
    });

    return JSON.parse(res.output[0].content[0].text);
  } catch (err) {
    console.error("AI analysis error:", err);
    return {};
  }
};

exports.generateAIReply = async (text) => {
  try {
    const res = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
        You are an AI WhatsApp Assistant for a home services company.
        Reply shortly and clearly.

        User said: "${text}"
      `
    });

    return res.output[0].content[0].text;
  } catch (err) {
    console.error("AI reply error:", err);
    return null;
  }
};
