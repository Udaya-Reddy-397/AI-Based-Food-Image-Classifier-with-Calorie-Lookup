# NutriScan-ai 🍏

> An AI-powered web application that helps users scan and analyze their food for nutritional insights. 
> Built with Next.js and Firebase to seamlessly track dietary habits and personal health history.

![Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow?logo=firebase)

NutriScan-ai allows you to snap a photo of your meal and get an instant breakdown of calories, protein, carbs, and fats. It also provides personalized dietary targets, allergy warnings, and a dashboard to track your nutrition history.

## 🚀 Live Demo
**[View Live Application on Vercel](https://ai-based-food-image-classifier-with.vercel.app/)**

---

## ✨ Features

- 📸 **AI Food Detection**: Identifies food items directly from your camera or uploaded images.
- 🤖 **Personal AI Chatbot**: Ask nutrition questions and get personalized advice based on your profile and goals.
- 📊 **Nutrition Tracking**: Calculates exact nutrition data based on detected portion sizes.
- 👤 **Personalized Profiles**: Set your goals (weight loss/gain), track allergies, and view daily macro targets.
- ⚠️ **Allergy Warnings**: Automatically flags scanned foods that might contain your listed allergens.
- 📈 **History & Dashboard**: Visualize your weekly progress using charts and a complete meal history.
- 🔐 **Secure Authentication**: Uses Firebase Google Sign-In so your data is linked directly to your account.
- 📱 **Mobile Ready**: Fully responsive and optimized for scanning on your smartphone (PWA ready).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database/Storage**: Firebase Firestore + Local Storage
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI Integration**: Custom ONNX Model Inference using `onnxruntime-web`

---

## 💻 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/Udaya-Reddy-397/AI-Based-Food-Image-Classifier-with-Calorie-Lookup.git
cd AI-Based-Food-Image-Classifier-with-Calorie-Lookup
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## ☁️ Deployment

This project is configured and optimized for deployment on **Vercel**. 

*Note: For Firebase Authentication to work in production, ensure your Vercel deployment URL (e.g., `yourapp.vercel.app`) is added to the **Authorized Domains** list in your Firebase Console Authentication settings.*

---

## 📁 Project Structure

- `src/app/` - Next.js App Router pages (Dashboard, Scan, Profile, History)
- `src/components/` - Reusable UI components (Navbar, LandingPage, InsightCard, etc.)
- `src/lib/` - Core logic, Firebase config, YOLO detection scripts, and types
- `public/` - Static assets, PWA manifest, and ONNX models

---

Built for health, powered by AI.
