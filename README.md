# NutriVision AI

AI-Based Food Quantity, Nutrition & Personalized Meal Tracking System

## Features

- 📷 Take photo or upload food image
- 🤖 AI food detection + item counting (mock AI included – ready for real YOLO)
- ⚖️ Quantity / portion estimation with user correction
- 🧮 Nutrition calculation for actual estimated grams
- 👤 User profile (goal, diet type, allergies, preferences)
- 📊 Daily dashboard with progress bars
- 💡 Rule-based personalized insights
- 🚨 Allergy warnings based on ingredient database
- 📅 Weekly history + charts
- ☁️ Ready to deploy on **Vercel**

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo
3. Framework Preset: **Next.js** (auto-detected)
4. Click **Deploy**

That’s it. Camera access works on the HTTPS domain provided by Vercel.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              → Dashboard
│   ├── scan/page.tsx         → Camera + Upload + Results
│   ├── history/page.tsx      → Weekly chart + meal history
│   ├── profile/page.tsx      → Profile, goals, allergies
│   └── api/analyze/route.ts  → Food analysis API (mock AI)
├── components/
│   ├── Navbar.tsx
│   ├── NutritionBar.tsx
│   └── InsightCard.tsx
└── lib/
    ├── types.ts
    ├── nutrition-db.ts       → Per-100g nutrition data
    └── storage.ts            → localStorage helpers + BMR logic
```

## Replacing Mock AI with Real YOLO Model

Current detection is mocked in `src/app/api/analyze/route.ts`.

To use a real model:

1. Train YOLOv8 on Indian food images (Roboflow + Ultralytics)
2. Export to ONNX
3. Either:
   - Run inference client-side with `onnxruntime-web`, or
   - Host model on Hugging Face / Replicate and call the API from the route

The rest of the app (quantity correction, nutrition calc, dashboard, allergies) already works with whatever list of `{ name, count }` the API returns.

## Notes for Exhibition / Viva

- Nutrition values are **estimates**
- Allergy alerts are based on the **database**, not the photo itself
- Quantity is estimated + **user-correctable**
- Daily targets use standard Mifflin-St Jeor formula + goal adjustment
- The system does **not** claim to measure blood glucose or diagnose conditions

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Lucide Icons
- localStorage (no external DB needed for MVP)

---

Built for college project demonstration – ready for Vercel deployment.
