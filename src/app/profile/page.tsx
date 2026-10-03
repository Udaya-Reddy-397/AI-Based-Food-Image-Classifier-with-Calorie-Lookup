"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, saveProfile, clearAllData } from "@/lib/storage";
import { UserProfile, Goal, DietType, ActivityLevel } from "@/lib/types";
import { Save, Trash2 } from "lucide-react";

const ALLERGY_OPTIONS = [
  "Milk/dairy",
  "Peanut",
  "Tree nuts",
  "Egg",
  "Wheat/gluten",
  "Soy",
  "Fish",
  "Shellfish",
];

const defaultProfile: UserProfile = {
  name: "",
  age: 25,
  height: 170,
  weight: 65,
  activity: "moderate",
  goal: "maintain",
  dietType: "vegetarian",
  allergies: [],
  monitorSugar: false,
  monitorProtein: true,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const existing = getProfile();
    if (existing) setProfile(existing);
  }, []);

  const handleSave = () => {
    if (!profile.name.trim()) {
      alert("Please enter your name");
      return;
    }
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/");
    }, 800);
  };

  const toggleAllergy = (item: string) => {
    setProfile((p) => ({
      ...p,
      allergies: p.allergies.includes(item)
        ? p.allergies.filter((a) => a !== item)
        : [...p.allergies, item],
    }));
  };

  const handleClear = () => {
    if (confirm("Clear all data including meals and profile?")) {
      clearAllData();
      setProfile(defaultProfile);
      router.push("/");
    }
  };

  if (!mounted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-10 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Profile & Goals</h1>
        <p className="text-sm text-gray-500">
          Used for personalized targets and allergy checks
        </p>
      </div>

      {/* Basic info */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f05a22]"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Age</label>
            <input
              type="number"
              min={10}
              max={100}
              value={profile.age}
              onChange={(e) =>
                setProfile({ ...profile, age: Number(e.target.value) })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Height (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              value={profile.height}
              onChange={(e) =>
                setProfile({ ...profile, height: Number(e.target.value) })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Weight (kg)</label>
            <input
              type="number"
              min={30}
              max={250}
              value={profile.weight}
              onChange={(e) =>
                setProfile({ ...profile, weight: Number(e.target.value) })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Activity Level</label>
          <select
            value={profile.activity}
            onChange={(e) =>
              setProfile({
                ...profile,
                activity: e.target.value as ActivityLevel,
              })
            }
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="sedentary">Sedentary (little exercise)</option>
            <option value="light">Light (1–3 days/week)</option>
            <option value="moderate">Moderate (3–5 days/week)</option>
            <option value="active">Active (6–7 days/week)</option>
          </select>
        </div>
      </section>

      {/* BMI Calculator */}
      {(() => {
        const heightInMeters = profile.height / 100;
        const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
        const bmiValue = parseFloat(bmi);
        
        let category = "";
        let colorClass = "";
        
        if (bmiValue < 18.5) {
          category = "Underweight";
          colorClass = "bg-blue-100 text-blue-800 border-blue-300";
        } else if (bmiValue >= 18.5 && bmiValue < 25) {
          category = "Healthy Weight";
          colorClass = "bg-green-100 text-green-800 border-green-300";
        } else if (bmiValue >= 25 && bmiValue < 30) {
          category = "Overweight";
          colorClass = "bg-orange-100 text-orange-800 border-orange-300";
        } else {
          category = "Obesity";
          colorClass = "bg-red-100 text-red-800 border-red-300";
        }

        return (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Body Mass Index (BMI)</h2>
              <p className="text-sm text-gray-500 mt-0.5">Based on your height and weight</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-gray-900">{bmi}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border mt-1 ${colorClass}`}>
                {category}
              </span>
            </div>
          </section>
        );
      })()}

      {/* Goal */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-800">Goal</h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "maintain", label: "Maintain", color: "bg-green-100 text-green-800 border-green-300" },
              { value: "gain", label: "Weight Gain", color: "bg-blue-100 text-blue-800 border-blue-300" },
              { value: "loss", label: "Weight Loss", color: "bg-orange-100 text-orange-800 border-orange-300" },
            ] as { value: Goal; label: string; color: string }[]
          ).map((g) => (
            <button
              key={g.value}
              onClick={() => setProfile({ ...profile, goal: g.value })}
              className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                profile.goal === g.value
                  ? g.color
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </section>

      {/* Diet type */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-800">Diet Type</h2>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              "vegetarian",
              "non-vegetarian",
              "vegan",
              "other",
            ] as DietType[]
          ).map((d) => (
            <button
              key={d}
              onClick={() => setProfile({ ...profile, dietType: d })}
              className={`py-2.5 rounded-xl text-sm font-medium border capitalize transition ${
                profile.dietType === d
                  ? "bg-orange-100 text-[#f05a22] border-orange-300"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* Allergies */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-800">Allergies</h2>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => toggleAllergy(a)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                profile.allergies.includes(a)
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      {/* Monitoring preferences */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-800">Monitoring Preferences</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.monitorProtein}
            onChange={(e) =>
              setProfile({ ...profile, monitorProtein: e.target.checked })
            }
            className="w-4 h-4 rounded accent-[#f05a22]"
          />
          <span className="text-sm text-gray-700">Monitor protein intake</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.monitorSugar}
            onChange={(e) =>
              setProfile({ ...profile, monitorSugar: e.target.checked })
            }
            className="w-4 h-4 rounded accent-[#f05a22]"
          />
          <span className="text-sm text-gray-700">Monitor sugar intake</span>
        </label>
      </section>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-[#f05a22] text-white py-3.5 rounded-xl font-bold hover:bg-[#e04a12] transition shadow-lg shadow-orange-200"
        >
          <Save size={18} />
          {saved ? "Saved!" : "Save Profile"}
        </button>

        <button
          onClick={async () => {
            try {
              const { signOut, auth } = await import("@/lib/firebase");
              await signOut(auth);
              router.push("/");
            } catch (error) {
              console.error("Logout failed:", error);
            }
          }}
          className="w-full flex items-center justify-center gap-2 text-gray-700 bg-gray-100 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition"
        >
          Sign Out
        </button>

        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 text-red-600 py-2.5 text-sm"
        >
          <Trash2 size={16} />
          Clear all data
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center px-4">
        Targets are estimates based on standard formulas. This app does not provide medical advice.
      </p>
    </div>
  );
}
