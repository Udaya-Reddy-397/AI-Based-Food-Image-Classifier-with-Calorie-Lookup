"use client";

import { Lightbulb } from "lucide-react";

interface Props {
  text: string;
}

export default function InsightCard({ text }: Props) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
      <div className="shrink-0 mt-0.5">
        <Lightbulb className="text-amber-600" size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Today&apos;s Insight
        </p>
        <p className="text-sm text-amber-900 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
