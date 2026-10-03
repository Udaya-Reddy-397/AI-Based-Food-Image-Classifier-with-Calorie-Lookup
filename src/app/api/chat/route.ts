export async function POST(req: Request) {
  try {
    const { message, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables." }),
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

    // Step 1: Auto-discover available models from the API key
    let availableModels: string[] = [];
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        availableModels = (listData.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name?.replace("models/", "") || "");
      }
    } catch (e) {
      console.log("Failed to list models:", e);
    }

    // Step 2: Build a prioritized list of models to try
    const preferredOrder = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.0-pro-latest",
    ];

    // Use discovered models first, fallback to our preferred list
    const modelsToTry = availableModels.length > 0
      ? [...new Set([...availableModels.filter(m => preferredOrder.some(p => m.includes(p))), ...availableModels, ...preferredOrder])]
      : preferredOrder;

    let lastError = "";
    const errors: string[] = [];

    for (const model of modelsToTry.slice(0, 8)) {
      for (const version of ["v1beta", "v1"]) {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

        try {
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

          const errorData = await res.text();
          lastError = `${version}/${model}: ${errorData.substring(0, 100)}`;
          errors.push(lastError);
        } catch (fetchErr: any) {
          lastError = `${version}/${model}: ${fetchErr.message}`;
          errors.push(lastError);
        }
      }
    }

    const keyPrefix = apiKey.substring(0, 6) + "...";
    return new Response(
      JSON.stringify({
        error: `Could not connect to any Gemini model. API key starts with: ${keyPrefix}. Available models found: ${availableModels.length > 0 ? availableModels.join(", ") : "NONE (key may be invalid)"}. Tried: ${errors.slice(0, 3).join(" | ")}`
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to communicate with AI. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
