import OpenAI from 'openai';

let openaiClient = null;
let isMockMode = false;

export const initializeAI = (apiKey) => {
  if (apiKey.startsWith('mock-')) {
    console.log("🧪 Mock Mode Activated");
    isMockMode = true;
    openaiClient = null;
    return;
  }

  try {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    isMockMode = false;
  } catch (err) {
    console.error("Failed to initialize OpenAI, switching to mock mode", err);
    isMockMode = true;
    openaiClient = null;
  }
};

export const getAIResponse = async (userMessage, context = "") => {
  /* ================= MOCK MODE ================= */
  if (isMockMode || !openaiClient) {
    await new Promise(r => setTimeout(r, 800)); // fake thinking delay

    const msg = userMessage.toLowerCase();

    if (msg.includes('joke'))
      return "Why did the AI get lost? Because the website had too many menus 😄 (mock response)";

    if (msg.includes('login') || msg.includes('log in'))
      return "I found the Login button on this page. I’m highlighting it for you now.";

    if (msg.includes('pricing'))
      return "The Pricing section is available from the top navigation bar.";

    return `[MOCK AI]: I understood "${userMessage}". I’m currently in demo mode and ready to guide you.`;
  }

  /* ================= REAL AI MODE ================= */
  try {
    const response = await openaiClient.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `You are LostNoMore, a website navigation assistant. Be concise and helpful. Context: ${context}`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return response.output_text;

  } catch (error) {
    console.warn("OpenAI error, falling back to mock:", error);
    return "I’m having trouble connecting to my AI services. Please check billing or use 'mock-key' to continue in demo mode.";
  }
};
