"use client";

import { useEffect, useState } from "react";
import { getMeals, getWeekMeals } from "@/lib/storage";
import { MealEntry } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO, startOfDay } from "date-fns";

export default function HistoryPage() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weekData, setWeekData] = useState<
    { day: string; calories: number; protein: number }[]
  >([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const all = getMeals();
    setMeals(all);

    // Build weekly summary
    const week = getWeekMeals();
    const map: Record<string, { calories: number; protein: number }> = {};

    week.forEach((m) => {
      const day = format(startOfDay(parseISO(m.timestamp)), "EEE");
      if (!map[day]) map[day] = { calories: 0, protein: 0 };
      map[day].calories += m.totalCalories;
      map[day].protein += m.totalProtein;
    });

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    setWeekData(
      days.map((d) => ({
        day: d,
        calories: map[d]?.calories || 0,
        protein: Math.round(map[d]?.protein || 0),
      }))
    );
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Group meals by date
  const grouped: Record<string, MealEntry[]> = {};
  meals.forEach((m) => {
    const date = format(parseISO(m.timestamp), "yyyy-MM-dd");
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  return (
    <div className="p-4 space-y-6 pb-10 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">History</h1>
        <p className="text-sm text-gray-500">Weekly overview & past meals</p>
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">This Week – Calories</h2>
        {weekData.every((d) => d.calories === 0) ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No data yet this week
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="calories" fill="#f05a22" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Meal list */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-800">All Meals</h2>

        {sortedDates.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
            No meals recorded yet. Go scan some food!
          </div>
        )}

        {sortedDates.map((date) => {
          const dayMeals = grouped[date];
          const dayTotal = dayMeals.reduce((s, m) => s + m.totalCalories, 0);

          return (
            <div key={date} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-700">
                  {format(parseISO(date), "EEEE, d MMM")}
                </p>
                <p className="text-sm text-gray-500">{dayTotal} kcal</p>
              </div>

              {dayMeals.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-gray-100 rounded-xl p-3.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 capitalize">
                        {m.mealType} ·{" "}
                        {format(parseISO(m.timestamp), "h:mm a")}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {m.foods
                          .map((f) => `${f.count}× ${f.name}`)
                          .join(", ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        P {m.totalProtein.toFixed(0)}g · C{" "}
                        {m.totalCarbs.toFixed(0)}g · F {m.totalFat.toFixed(0)}g
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {m.totalCalories} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
