import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    
    const systemPrompt = `You are a personalized AI nutrition assistant for a user named ${profile.name}.
    Here is their profile:
    - Age: ${profile.age}
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg
    - Activity Level: ${profile.activity}
    - Goal: ${profile.goal} (maintain, gain, or loss)
    - Diet Type: ${profile.dietType}
    - Allergies: ${profile.allergies.join(", ") || "None"}
    
    Please answer their questions specifically tailored to this profile. Keep your answers concise, friendly, and practical (around 2-3 short paragraphs max). Do not use markdown headers.`;

    // 503 errors mean the Google server is overloaded. We will fallback through multiple less-congested models.
    const modelsToTry = [
      "gemma-4-31b-it",          // Gemma is likely on different infrastructure
      "gemini-3.1-pro-preview",  // Obscure preview model
      "gemini-3.7-flash",        // Less common version
      "gemini-2.5-flash-lite",   // Lite version might have lower load
      "gemini-2.5-pro",          
      "gemini-3.5-flash",        
      "gemini-flash-latest"      
    ];

    let lastErrorMsg = "";

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([systemPrompt, message]);
        const response = await result.response;
        
        return new Response(JSON.stringify({ reply: response.text() }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (e: any) {
        lastErrorMsg = e.message;
        console.log(`Model ${modelName} failed:`, e.message);
        // Wait half a second before trying the next model to avoid rapid-fire rate limits
        await delay(500);
      }
    }

    throw new Error(`All fallback models failed due to Google API overload. Last error: ${lastErrorMsg}`);
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to communicate with AI." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
