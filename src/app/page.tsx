"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, TrendingUp } from "lucide-react";
import {
  getTodayMeals,
  getProfile,
  calculateDailyTargets,
  generateInsight,
} from "@/lib/storage";
import { MealEntry, UserProfile, DailyTargets } from "@/lib/types";
import NutritionBar from "@/components/NutritionBar";
import InsightCard from "@/components/InsightCard";
import { useAuth } from "@/components/AuthProvider";
import LandingPage from "@/components/LandingPage";

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<DailyTargets | null>(null);
  const [mounted, setMounted] = useState(false);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
    const p = getProfile();
    setProfile(p);
    setMeals(getTodayMeals());
    if (p) setTargets(calculateDailyTargets(p));
  }, []);

  const handleLogin = async () => {
    try {
      const { signInWithPopup, auth, googleProvider } = await import("@/lib/firebase");
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const handleLogout = async () => {
    try {
      const { signOut, auth } = await import("@/lib/firebase");
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Logged in but no profile
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff9f0] px-6 py-12 text-center -mt-16">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#f05a22] shadow-xl shadow-orange-900/5 mb-8 border-4 border-white/50 relative">
          <div className="absolute inset-0 bg-orange-200/20 rounded-full animate-ping"></div>
          <span className="text-4xl relative z-10">👋</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Welcome, {user.displayName?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-gray-600 max-w-sm mb-10 text-lg leading-relaxed">
          Let's set up your profile to give you personalized nutrition targets and calorie insights.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link
            href="/profile"
            className="bg-[#f05a22] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-orange-200 hover:bg-[#e04a12] transition transform hover:-translate-y-0.5"
          >
            Create Profile
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 text-sm font-medium hover:text-gray-800 transition py-2"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const totalCal = meals.reduce((s, m) => s + m.totalCalories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.totalProtein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.totalFat, 0);
  const totalSugar = meals.reduce((s, m) => s + m.totalSugar, 0);

  const insight = generateInsight(
    totalProtein,
    totalCal,
    targets,
    profile.goal
  );

  const goalLabel =
    profile.goal === "loss"
      ? "Weight Loss"
      : profile.goal === "gain"
      ? "Weight Gain"
      : "Maintain Weight";

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <p className="text-sm font-medium text-orange-600/80 mb-0.5">Hello, {profile.name || "there"} 👋</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Today's Nutrition</h1>
        </div>
        <Link
          href="/scan"
          className="bg-[#f05a22] text-white px-5 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-200 hover:bg-[#e04a12] transition transform hover:-translate-y-0.5"
        >
          <Camera size={18} strokeWidth={2.5} />
          Scan
        </Link>
      </div>

      {/* Goal badge */}
      <div className="inline-flex items-center gap-2 bg-orange-100/50 text-[#f05a22] text-xs font-bold px-4 py-1.5 rounded-full border border-orange-200/50">
        <TrendingUp size={14} strokeWidth={2.5} />
        GOAL: {goalLabel.toUpperCase()}
      </div>

      {/* Main calories card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl shadow-orange-900/5 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
        
        <div className="flex items-end justify-between mb-6 relative z-10">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Calories Consumed</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight">
              {totalCal}
              <span className="text-lg font-medium text-gray-400 ml-1">
                / {targets?.calories || "—"}
              </span>
            </p>
          </div>
          <div className="text-right text-sm font-bold text-[#f05a22]">
            {targets && (
              <span className="bg-orange-50 px-3 py-1 rounded-lg">
                {Math.max(0, targets.calories - totalCal)} left
              </span>
            )}
          </div>
        </div>

        {targets && (
          <div className="space-y-4 relative z-10">
            <NutritionBar
              label="Protein"
              current={totalProtein}
              target={targets.protein}
              color="bg-[#f05a22]"
            />
            <NutritionBar
              label="Carbs"
              current={totalCarbs}
              target={targets.carbs}
              color="bg-amber-400"
            />
            <NutritionBar
              label="Fat"
              current={totalFat}
              target={targets.fat}
              color="bg-rose-400"
            />
            {profile.monitorSugar && (
              <NutritionBar
                label="Sugar"
                current={totalSugar}
                target={50}
                color="bg-purple-400"
              />
            )}
          </div>
        )}
      </div>

      {/* Insight */}
      <InsightCard text={insight} />

      {/* Recent meals */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-gray-900">Today's Meals</h2>
          <Link href="/history" className="text-sm text-[#f05a22] font-bold hover:underline">
            See all
          </Link>
        </div>

        {meals.length === 0 ? (
          <div className="bg-[#fff9f0] border-2 border-dashed border-orange-200/50 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">🍽️</div>
            <p className="text-gray-500 font-medium mb-4">No meals recorded yet</p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 text-[#f05a22] text-sm font-bold bg-white px-5 py-2.5 rounded-full shadow-sm"
            >
              <Camera size={16} strokeWidth={2.5} /> Scan your first food
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fff9f0] rounded-xl flex items-center justify-center text-xl">
                    {m.mealType === 'breakfast' ? '🍳' : m.mealType === 'lunch' ? '🥗' : m.mealType === 'dinner' ? '🍲' : '🥨'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      {m.mealType} ·{" "}
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {m.foods.map((f) => `${f.count}× ${f.name}`).join(", ")}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900 whitespace-nowrap bg-gray-50 px-3 py-1.5 rounded-lg">
                  {m.totalCalories}
                  <span className="text-[10px] text-gray-500 font-medium ml-1">kcal</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
