export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in Netlify Environment Variables.");
    }

    const { messages, userName, language } = JSON.parse(event.body);

    const systemInstruction = `
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

    // Map messages perfectly for the raw Google REST API
    const contents = messages.map(msg => ({
      role: msg.from === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // THE NUCLEAR OPTION: Talk directly to Google's v1beta URL, bypassing the broken SDK
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents
      })
    });

    const data = await response.json();

    // Catch any raw API errors directly
    if (!response.ok) {
      throw new Error(data.error?.message || "Unknown Google API Error");
    }

    const responseText = data.candidates[0].content.parts[0].text;

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