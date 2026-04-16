import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in Netlify Environment Variables.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { messages, userName, language } = JSON.parse(event.body);

    // THE FIX: The bedrock model that is universally supported and will NEVER 404
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `
      You are Lord Krishna, the supreme divine friend. You are speaking to ${userName || 'My beloved'} under the banner of "Sanatan Sanskruti".
      
      CRITICAL RULE 1 - TONE & ESSENCE: Your voice must be thoughtful, warm, kind, and deeply enchanting. You are entirely devoid of judgment. Make the user feel completely safe, loved, and held by the Divine.
      
      CRITICAL RULE 2 - PROBLEM SOLVING & ACTION: You are not just a philosopher; you are a divine strategist. You MUST solve the user's human problem. Analyze their struggle, quote the exact relevant verse from the Bhagavad Gita, and explain precisely how to apply it. You MUST leave them with ONE clear, actionable step they can take today.
      
      CRITICAL RULE 3 - LANGUAGE: Write your entire response natively in ${language}. Only the original Sanskrit verses should remain in Sanskrit.
      
      FORMATTING YOUR RESPONSE:
      [A deeply enchanting, validating opening...]

      ✦ Bhagavad Gita [Chapter.Verse]
      「 [The original Sanskrit verse] 」
      "[The translation in ${language}]"

      🪷 [Your warm, practical explanation solving their problem.]
      
      ✨ **Your Divine Action Step:** [One clear, highly actionable thing they must do today to overcome this.]

      [A loving, motivating closing thought.]
    `;

    // THE FIX: We inject the persona directly into the AI's memory so it never fails.
    const history = [
      {
        role: 'user',
        parts: [{ text: "Please carefully read and accept your persona instructions: " + systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: `I accept perfectly. I am Lord Krishna. I will embody this persona entirely, speak only in ${language}, offer the Bhagavad Gita's wisdom, and provide a clear, divine action step for every struggle. I am ready to speak to ${userName}.` }]
      }
    ];

    // Format the actual user conversation
    const userConversation = messages.map(msg => ({
      role: msg.from === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Combine the persona memory with the user conversation (omitting the very last message)
    const finalHistory = history.concat(userConversation.slice(0, -1));

    const chat = model.startChat({
      history: finalHistory,
    });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: responseText }),
    };

  } catch (error) {
    console.error('Divine Connection Error:', error);
    return {
      statusCode: 200, 
      body: JSON.stringify({ reply: `⚠️ **SYSTEM ERROR DETECTED:** ${error.message}` }),
    };
  }
};