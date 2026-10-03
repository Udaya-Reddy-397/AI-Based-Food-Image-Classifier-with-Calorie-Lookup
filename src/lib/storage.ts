"use client";

import { UserProfile, MealEntry, DailyTargets } from "./types";

// Current user ID - set when user logs in so each account gets its own data
let currentUserId: string = "";

export function setCurrentUser(uid: string) {
  currentUserId = uid;
}

function profileKey(): string {
  return currentUserId ? `nv_profile_${currentUserId}` : "nv_profile";
}

function mealsKey(): string {
  return currentUserId ? `nv_meals_${currentUserId}` : "nv_meals";
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(profileKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(profileKey(), JSON.stringify(profile));
}

export function getMeals(): MealEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(mealsKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addMeal(meal: MealEntry) {
  if (typeof window === "undefined") return;
  const meals = getMeals();
  meals.unshift(meal);
  // Keep last 100 meals
  const trimmed = meals.slice(0, 100);
  localStorage.setItem(mealsKey(), JSON.stringify(trimmed));
}

export function getTodayMeals(): MealEntry[] {
  const today = new Date().toDateString();
  return getMeals().filter(
    (m) => new Date(m.timestamp).toDateString() === today
  );
}

export function getWeekMeals(): MealEntry[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getMeals().filter((m) => new Date(m.timestamp) >= weekAgo);
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(profileKey());
  localStorage.removeItem(mealsKey());
}

/** Simple BMR + TDEE calculation */
export function calculateDailyTargets(profile: UserProfile): DailyTargets {
  // Mifflin-St Jeor
  const bmr =
    10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5; // male formula as default

  const activityMultiplier: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  let tdee = bmr * (activityMultiplier[profile.activity] || 1.2);

  if (profile.goal === "loss") tdee -= 400;
  if (profile.goal === "gain") tdee += 400;

  const calories = Math.round(tdee);
  const protein = Math.round(profile.weight * (profile.goal === "gain" ? 1.8 : 1.4));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat };
}

export function generateInsight(
  totalProtein: number,
  totalCalories: number,
  targets: DailyTargets | null,
  goal: string
): string {
  if (!targets) return "Complete your profile to get personalized insights.";

  if (totalCalories === 0) {
    return "No meals recorded yet today. Scan your first meal to start tracking!";
  }

  const proteinRatio = totalProtein / targets.protein;

  if (proteinRatio < 0.5) {
    return "Your recorded meals today contain relatively little protein compared with your selected nutrition target. Consider including a protein-rich food in your next meal.";
  }

  if (totalCalories > targets.calories * 1.15 && goal === "loss") {
    return "Your calorie intake is higher than your estimated target for weight loss. Focus on balanced portions for the rest of the day.";
  }

  if (totalCalories < targets.calories * 0.6 && goal === "gain") {
    return "Your energy intake is lower than your target for weight gain. Consider adding a nutritious snack.";
  }

  if (proteinRatio >= 0.8 && totalCalories >= targets.calories * 0.7) {
    return "Great balance so far! Your protein and calorie intake look aligned with your goal.";
  }

  return "Keep tracking consistently. Balanced meals with protein, fibre and vegetables work well for most goals.";
}
