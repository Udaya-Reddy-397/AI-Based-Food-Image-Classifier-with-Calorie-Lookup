export async function POST(req: Request) {
  try {
    const { message, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

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

    // Try multiple model + API version combinations until one works
    const modelsToTry = [
      { version: "v1beta", model: "gemini-2.0-flash" },
      { version: "v1beta", model: "gemini-1.5-flash-latest" },
      { version: "v1beta", model: "gemini-1.5-flash" },
      { version: "v1", model: "gemini-pro" },
      { version: "v1beta", model: "gemini-pro" },
      { version: "v1beta", model: "gemini-1.0-pro" },
    ];

    let lastError = "";

    for (const { version, model } of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

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

      const errorData = await res.json().catch(() => ({}));
      lastError = `${version}/${model}: ${errorData?.error?.message || res.statusText}`;
      console.log(`Model ${version}/${model} failed:`, lastError);
      // Continue to next model
    }

    return new Response(
      JSON.stringify({ error: "No compatible Gemini model found. Last error: " + lastError }),
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
