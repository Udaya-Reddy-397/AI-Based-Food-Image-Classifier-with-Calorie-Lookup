export type Goal = "maintain" | "gain" | "loss";
export type DietType = "vegetarian" | "non-vegetarian" | "vegan" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  activity: ActivityLevel;
  goal: Goal;
  dietType: DietType;
  allergies: string[];
  monitorSugar: boolean;
  monitorProtein: boolean;
}

export interface FoodItem {
  name: string;
  count: number;
  estimatedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fibre: number;
  allergens?: string[];
}

export interface MealEntry {
  id: string;
  timestamp: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSugar: number;
  mealType: MealType;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
