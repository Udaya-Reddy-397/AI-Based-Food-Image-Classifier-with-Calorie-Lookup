export async function POST(req: Request) {
  try {
    const { message, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();

    const systemPrompt = `You are a personalized AI nutrition assistant for a user named ${profile.name}.
    Here is their profile:
    - Age: ${profile.age}
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg
    - Activity Level: ${profile.activity}
    - Goal: ${profile.goal} (maintain, gain, or loss)
    - Diet Type: ${profile.dietType}
    - Allergies: ${profile.allergies.join(", ") || "None"}
    
    Please answer their questions specifically tailored to this profile. If they ask if they can eat something, consider their allergies and diet type. Keep your answers concise, friendly, and practical (around 2-3 short paragraphs max). Do not use markdown headers, just plain text with line breaks.`;

    const body = JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nUser question: " + message }] }
      ]
    });

    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash-latest"
    ];

    let lastError = "";

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response.";
        return new Response(JSON.stringify({ reply: text }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Record error and try next model
      lastError = await res.text();
    }

    // If all models failed, let's ask Google exactly what models this key IS allowed to use!
    let availableModelsStr = "Could not fetch model list.";
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const models = (listData.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name.replace("models/", ""));
        availableModelsStr = models.join(", ") || "NO MODELS FOUND FOR THIS KEY!";
      } else {
        availableModelsStr = `Failed to fetch list: ${listRes.status}`;
      }
    } catch (e: any) {
      availableModelsStr = `Error fetching list: ${e.message}`;
    }

    return new Response(
      JSON.stringify({ error: `All models 404'd! However, Google says your API key IS allowed to use these exact models: [${availableModelsStr}].` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to communicate with AI." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
