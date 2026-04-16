export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing in Netlify Environment Variables.");
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

    // Map messages specifically for OpenAI's format
    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(msg => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    // Direct REST API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Extremely fast, smart, and highly reliable
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Unknown OpenAI API Error");
    }

    const responseText = data.choices[0].message.content;

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