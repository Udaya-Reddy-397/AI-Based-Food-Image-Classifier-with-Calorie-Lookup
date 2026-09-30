"use client";

interface Props {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export default function NutritionBar({
  label,
  current,
  target,
  unit = "g",
  color = "bg-green-500",
}: Props) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {current.toFixed(0)} / {target} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
