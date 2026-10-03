import { NextRequest, NextResponse } from "next/server";
import { calculateNutrition, getAveragePortion } from "@/lib/nutrition-db";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Detection = { name: string; count: number };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY in Vercel." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert the uploaded file to a base64 string for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");

    const imageParts = [
      {
        inlineData: {
          data: base64String,
          mimeType: file.type || "image/jpeg",
        },
      },
    ];

    const prompt = `Analyze this image of food. 
Identify the main food items present on the plate.
Return ONLY a valid JSON array of objects. 
Each object must have exactly two keys: "name" (string, the name of the food, e.g. "Chicken Curry") and "count" (number, estimated quantity, usually 1).
Example: [{"name": "Chicken Curry", "count": 1}, {"name": "Rice", "count": 1}]
Do not include any markdown formatting or backticks, just the raw JSON array starting with [ and ending with ].`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim().replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    let detections: Detection[] = [];
    try {
      detections = JSON.parse(text);
      if (!Array.isArray(detections)) detections = [{ name: "Food", count: 1 }];
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      detections = [{ name: "Unknown Food", count: 1 }];
    }

    const foods = detections.map((d) => {
      const grams = getAveragePortion(d.name) * (d.count || 1);
      const nut = calculateNutrition(d.name, grams);
      return {
        ...nut,
        count: d.count || 1,
      };
    });

    return NextResponse.json({
      success: true,
      foods,
      message: "Analysis complete",
    });
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: err?.message || "Food analysis failed" },
      { status: 500 }
    );
  }
}
