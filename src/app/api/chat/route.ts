import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, profile } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to communicate with AI. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
