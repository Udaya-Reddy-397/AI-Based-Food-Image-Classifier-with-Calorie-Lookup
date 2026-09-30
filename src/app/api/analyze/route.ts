import { NextRequest, NextResponse } from "next/server";
import { calculateNutrition, getAveragePortion } from "@/lib/nutrition-db";

/**
 * MOCK AI DETECTION
 * -----------------
 * This simulates what a real YOLO model would return.
 * Later you can replace the body of this function with:
 * 1. Real YOLO / ONNX inference
 * 2. Hugging Face Inference API call
 * 3. Replicate / custom backend
 */

type Detection = { name: string; count: number };

function mockDetect(): Detection[] {
  const scenarios: Detection[][] = [
    [{ name: "Samosa", count: 3 }],
    [
      { name: "Idli", count: 2 },
      { name: "Sambar", count: 1 },
    ],
    [
      { name: "Rice", count: 1 },
      { name: "Dal", count: 1 },
      { name: "Roti", count: 2 },
    ],
    [
      { name: "Dosa", count: 1 },
      { name: "Sambar", count: 1 },
    ],
    [
      { name: "Biryani", count: 1 },
      { name: "Curd", count: 1 },
    ],
    [
      { name: "Paneer", count: 1 },
      { name: "Roti", count: 2 },
      { name: "Salad", count: 1 },
    ],
    [{ name: "Poha", count: 1 }],
    [
      { name: "Egg", count: 2 },
      { name: "Bread", count: 2 },
    ],
    [
      { name: "Chicken", count: 1 },
      { name: "Rice", count: 1 },
    ],
    [{ name: "Banana", count: 1 }],
  ];

  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1200));

    // ---- REPLACE THIS BLOCK WITH REAL MODEL ----
    const detections = mockDetect();
    // --------------------------------------------

    const foods = detections.map((d) => {
      const grams = getAveragePortion(d.name) * d.count;
      const nut = calculateNutrition(d.name, grams);
      return {
        ...nut,
        count: d.count,
      };
    });

    return NextResponse.json({
      success: true,
      foods,
      message: "Analysis complete (mock AI – replace with real YOLO model)",
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Food analysis failed" },
      { status: 500 }
    );
  }
}
