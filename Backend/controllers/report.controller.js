const REPORT_SYSTEM_PROMPT = `You are a medical report assistant.
Analyze uploaded medical report images and return strict JSON only.
No markdown.
JSON schema:
{
  "status": "normal" | "attention" | "urgent",
  "summary": "short plain summary",
  "details": ["key finding 1", "key finding 2"],
  "recommendations": ["action 1", "action 2"]
}
Avoid diagnosis claims; provide informational guidance and suggest doctor consultation when needed.`;

const extractJson = (text) => {
  const trimmed = text?.trim() || "";
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in Gemini output");
  }
  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
};

export const analyzeReportImage = async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ message: "imageBase64 is required" });
    }

    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({ message: "Only image mime types are supported" });
    }

    const apiKey = process.env.GEMINI_API_KEY1;
    if (!apiKey) {
      console.error("Report analysis missing GEMINI_API_KEY env var");
      return res.status(503).json({ message: "Gemini is not configured on server" });
    }

    // Try multiple Gemini models in order until one returns valid JSON
    const models = [
      "gemini-3-flash-preview",
      "gemini-2.5-flash-image",
      "gemini-2.5-flash-lite",
    ];

    let lastError = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              role: "system",
              parts: [{ text: REPORT_SYSTEM_PROMPT }],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: imageBase64,
                    },
                  },
                  {
                    text: "Analyze this medical report image and respond with strict JSON only.",
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          console.error(`Gemini (${model}) request failed:`, errText.slice ? errText.slice(0, 1000) : errText);
          lastError = `model=${model} status=${response.status}`;
          continue; // try next model
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.error(`Gemini (${model}) returned empty text payload`);
          lastError = `model=${model} empty_response`;
          continue;
        }

        let parsed;
        try {
          parsed = extractJson(text);
        } catch (err) {
          console.error(`Gemini (${model}) JSON parse failed:`, err, "raw:", text?.slice?.(0, 1000));
          lastError = `model=${model} parse_error`;
          continue; // try next model
        }

        if (!parsed || !parsed.status || !parsed.summary || !Array.isArray(parsed.details) || !Array.isArray(parsed.recommendations)) {
          console.error(`Gemini (${model}) returned invalid schema:`, parsed);
          lastError = `model=${model} invalid_schema`;
          continue;
        }

        // Success
        return res.json({ result: parsed, source: model });
      } catch (err) {
        console.error(`Gemini (${model}) request error:`, err);
        lastError = `model=${model} error:${String(err).slice(0, 200)}`;
        continue; // try next model
      }
    }

    console.error("All Gemini models failed:", lastError);
    return res.status(502).json({ message: "All Gemini models failed", details: String(lastError).slice(0, 500) });
  } catch (error) {
    console.error("Report analysis error:", error);
    return res.status(500).json({ message: "Failed to analyze report image" });
  }
};
