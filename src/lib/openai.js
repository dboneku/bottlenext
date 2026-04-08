export async function evaluateAnswer(moduleTitle, questionPrompt, userAnswer) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // If no API key is provided, we just skip the coaching and accept the answer.
  // This allows the app to function without breaking if the key isn't set yet.
  if (!apiKey) {
    return { accepted: true, feedback: null }; 
  }

  const systemPrompt = `You are a world-class strategic business coach, guiding a CEO/leader through the "${moduleTitle}" module of their Leadership Operating System.
The user is responding to this specific prompt: "${questionPrompt}"

Your job is to evaluate their response:
- Is it specific, actionable, clear, and impactful?
- Or is it too generic, brief, or vague? (e.g., "we do good marketing", "provide good service")

If their answer is too generic or lacks depth, push back gently and constructively. Ask a clarifying follow-up question to help them dig deeper and produce a better answer. (Mark accepted: false).
If their answer is solid and thoughtful, accept it. Give a brief, encouraging remark, and optionally offer a slightly polished/sharpened version of their thought. (Mark accepted: true).

IMPORTANT: You MUST return a valid JSON object matching this exact schema:
{
  "accepted": boolean,
  "feedback": "Your conversational response to the user. Keep it natural and highly professional."
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userAnswer }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return { accepted: true, feedback: null }; 
    }
    
    // The response is guaranteed to be a JSON string thanks to response_format
    const result = JSON.parse(data.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    return { accepted: true, feedback: null }; 
  }
}
