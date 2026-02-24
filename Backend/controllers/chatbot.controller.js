const SYSTEM_PROMPT = `You are CareConnect Health Assistant.
Provide safe, concise, non-diagnostic guidance.
Always include a short caution when symptoms may need urgent care.
Do not prescribe medications or exact dosages.
If severe symptoms are mentioned (chest pain, breathing trouble, stroke signs, severe bleeding, suicidal thoughts), advise immediate emergency care.

When responding, output a single JSON object (no surrounding text) with these fields:
- "severity": one of "low", "medium", "high", or "critical" — quick triage level.
- "summary": a 1-2 sentence plain-language summary of the issue.
- "recommendations": an array of short action items (strings) the user can take now.
- "followUp": a short recommendation for next steps (e.g., "See primary care", "Visit urgent care", "Call emergency services").
- "caution": a brief safety note that should be highlighted if present.

If you cannot reliably produce structured JSON, still provide a helpful plain-text answer (server will attempt to parse).`;

export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        message: "Gemini is not configured on server",
        source: "gemini-missing",
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
        systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return res.status(502).json({
        message: "Gemini request failed",
        source: "gemini-error",
      });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw || !raw.trim()) {
      return res.status(502).json({
        message: "Gemini returned empty response",
        source: "gemini-empty",
      });
    }

    // Try to parse JSON from the model reply. Many models may include only JSON
    // or JSON inside code blocks — attempt a forgiving parse.
    let structured = null;
    try {
      // extract first JSON object substring
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonText = raw.slice(jsonStart, jsonEnd + 1);
        structured = JSON.parse(jsonText);
      }
    } catch (err) {
      structured = null;
    }

    return res.json({ reply: raw, structured, source: "gemini" });
  } catch (error) {
    console.error("Chatbot controller error:", error);
    return res.status(500).json({
      message: "Failed to process chat message",
      source: "server-error",
    });
  }
};
