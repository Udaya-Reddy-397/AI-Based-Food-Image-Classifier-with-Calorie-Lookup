"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Loader2,
  Plus,
  Minus,
  AlertTriangle,
  Check,
} from "lucide-react";
import { calculateNutrition, getAveragePortion } from "@/lib/nutrition-db";
import { addMeal, getProfile } from "@/lib/storage";
import { FoodItem, MealType } from "@/lib/types";
import { detectFood } from "@/lib/yolo";
import { v4 as uuidv4 } from "uuid";

export default function ScanPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "result">("upload");
  const [mealType, setMealType] = useState<MealType>("snack");
  const [cameraOn, setCameraOn] = useState(false);
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch {
      alert("Camera permission denied or not available. Please upload a photo instead.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        stopCamera();
        await analyze(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await analyze(file);
  };

  const analyze = async (file: File) => {
    setLoading(true);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setStep("upload");

    try {
      // 1. Create an HTMLImageElement to feed to the YOLO model
      const img = new Image();
      img.src = objectUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      // 2. Run the client-side YOLO inference! (0 server cost)
      const detectedItems = await detectFood(img);
      
      // 3. Map detected items to the nutrition database
      const processedFoods = detectedItems.map((d) => {
        const grams = getAveragePortion(d.name) * d.count;
        const nut = calculateNutrition(d.name, grams);
        return {
          ...nut,
          count: d.count,
        };
      });

      setFoods(processedFoods);
      checkAllergies(processedFoods);
      setStep("result");
    } catch (err) {
      console.error(err);
      alert("Could not analyze the image. Please try again.");
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAllergies = (detected: FoodItem[]) => {
    const profile = getProfile();
    if (!profile || !profile.allergies.length) {
      setAllergyWarnings([]);
      return;
    }

    const warnings: string[] = [];
    detected.forEach((f) => {
      f.allergens?.forEach((a) => {
        if (
          profile.allergies.some(
            (ua) => ua.toLowerCase().includes(a) || a.includes(ua.toLowerCase())
          )
        ) {
          warnings.push(
            `${f.name} may contain ${a} according to available ingredient information.`
          );
        }
      });
    });
    setAllergyWarnings(Array.from(new Set(warnings)));
  };

  const updateCount = (idx: number, delta: number) => {
    const copy = [...foods];
    const item = copy[idx];
    const newCount = Math.max(1, item.count + delta);
    const avgPerItem = item.estimatedGrams / item.count;
    const newGrams = Math.round(avgPerItem * newCount);
    const nut = calculateNutrition(item.name, newGrams);
    copy[idx] = { ...nut, count: newCount };
    setFoods(copy);
  };

  const updateGrams = (idx: number, grams: number) => {
    const copy = [...foods];
    const item = copy[idx];
    const safeGrams = Math.max(10, grams);
    const nut = calculateNutrition(item.name, safeGrams);
    copy[idx] = { ...nut, count: item.count };
    setFoods(copy);
  };

  const addToIntake = () => {
    if (foods.length === 0) return;

    const totalCalories = foods.reduce((s, f) => s + f.calories, 0);
    const totalProtein = foods.reduce((s, f) => s + f.protein, 0);
    const totalCarbs = foods.reduce((s, f) => s + f.carbs, 0);
    const totalFat = foods.reduce((s, f) => s + f.fat, 0);
    const totalSugar = foods.reduce((s, f) => s + f.sugar, 0);

    addMeal({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      foods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalSugar,
      mealType,
    });

    router.push("/");
  };

  const reset = () => {
    setStep("upload");
    setFoods([]);
    setImagePreview(null);
    setAllergyWarnings([]);
    stopCamera();
  };

  return (
    <div className="p-4 space-y-5 pb-8 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Scan My Food</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Take or upload a photo • AI detects & estimates quantity
        </p>
      </div>

      {/* Upload / Camera step */}
      {step === "upload" && !loading && (
        <div className="space-y-4">
          {!cameraOn ? (
            <>
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-3 bg-[#f05a22] text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-orange-200 hover:bg-[#e04a12] transition"
              >
                <Camera size={22} />
                Take Photo
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-orange-100 text-[#f05a22] py-4 rounded-2xl font-bold hover:border-orange-200 hover:bg-orange-50 transition"
              >
                <Upload size={22} />
                Upload Photo
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFile}
              />

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">Tips for better results</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                  <li>Good lighting helps detection</li>
                  <li>Keep food clearly visible</li>
                  <li>You can correct quantity after detection</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-2xl bg-black aspect-[4/3] object-cover"
              />
              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 rounded-xl bg-[#f05a22] text-white font-bold"
                >
                  Capture
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="animate-spin text-[#f05a22]" size={48} />
          <p className="text-gray-600 font-medium">Analyzing your food...</p>
          <p className="text-sm text-gray-400">Detecting items & estimating quantity</p>
        </div>
      )}

      {/* Results */}
      {step === "result" && foods.length > 0 && (
        <div className="space-y-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Scanned food"
              className="w-full rounded-2xl object-cover max-h-56 border border-gray-100"
            />
          )}

          {/* Allergy warnings */}
          {allergyWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                <AlertTriangle size={18} />
                Allergy Alert
              </div>
              {allergyWarnings.map((w, i) => (
                <p key={i} className="text-sm text-red-800">
                  {w}
                </p>
              ))}
              <p className="text-xs text-red-600 mt-1">
                Check ingredients / preparation before consuming. A photo cannot reliably detect hidden allergens or cross-contamination.
              </p>
            </div>
          )}

          {/* Detected foods */}
          {foods.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-900">{f.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCount(i, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">{f.count}</span>
                  <button
                    onClick={() => updateCount(i, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Estimated weight:</label>
                <input
                  type="number"
                  min={10}
                  value={f.estimatedGrams}
                  onChange={(e) => updateGrams(i, Number(e.target.value))}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"
                />
                <span className="text-sm text-gray-500">g</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm pt-1">
                <span className="text-gray-600">
                  🔥 <strong>{f.calories}</strong> kcal
                </span>
                <span className="text-gray-600">
                  💪 <strong>{f.protein}</strong> g protein
                </span>
                <span className="text-gray-600">
                  🍞 <strong>{f.carbs}</strong> g carbs
                </span>
                <span className="text-gray-600">
                  🥑 <strong>{f.fat}</strong> g fat
                </span>
              </div>
            </div>
          ))}

          {/* Meal type */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Meal type</p>
            <div className="grid grid-cols-4 gap-2">
              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setMealType(t)}
                    className={`py-2 rounded-xl text-sm capitalize font-bold transition ${
                      mealType === t
                        ? "bg-[#f05a22] text-white shadow-md shadow-orange-200"
                        : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={reset}
              className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-medium"
            >
              Scan Again
            </button>
            <button
              onClick={addToIntake}
              className="flex-1 py-3.5 rounded-xl bg-[#f05a22] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#e04a12] transition shadow-lg shadow-orange-200"
            >
              <Check size={18} />
              Add to Intake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
