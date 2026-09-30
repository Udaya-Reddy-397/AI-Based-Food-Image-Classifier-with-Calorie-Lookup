import React from "react";
import { Camera, Search, Smartphone, Apple, BarChart2 } from "lucide-react";

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#fff9f0] font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-[#f05a22] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
            N
          </div>
          <span className="font-bold text-xl text-gray-900">NutriScan</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-gray-600 text-sm font-medium">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900">How it works</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Login
          </button>
          <button onClick={onLogin} className="bg-[#111827] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 transition">
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block bg-white text-[#f05a22] text-xs font-semibold px-3 py-1 rounded-full shadow-sm border border-[#ffe5d9]">
            Food classification + calorie lookup
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
            Know your food.<br />
            Track every <span className="text-[#f05a22]">calorie.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md leading-relaxed">
            Snap a photo, identify what&apos;s on your plate, and look up calories instantly. NutriScan makes healthy eating effortless — right from your phone.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button onClick={onLogin} className="bg-[#f05a22] text-white font-medium px-7 py-3.5 rounded-full hover:bg-[#e04a12] transition shadow-lg shadow-orange-200">
              Get started free
            </button>
            <button onClick={onLogin} className="bg-white text-gray-700 border border-gray-200 font-medium px-7 py-3.5 rounded-full hover:bg-gray-50 transition shadow-sm">
              Sign in
            </button>
          </div>
        </div>

        {/* Hero Image Mockup (CSS) */}
        <div className="relative">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-white/50 backdrop-blur-sm relative z-10">
            <div className="absolute -top-4 -left-4 bg-white text-sm font-bold text-gray-900 px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 z-20">
              ~520 kcal
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#fff9f0] h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🍓</div>
              <div className="bg-[#f0fdf4] h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🥬</div>
              <div className="bg-[#fffbeb] h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🥜</div>
              <div className="bg-[#fefce8] h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🌾</div>
              <div className="bg-[#fdf2f8] h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🍅</div>
              <div className="bg-[#f0f9ff] h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🥑</div>
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/40 to-yellow-100/40 blur-3xl -z-10 rounded-full"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to eat smarter</h2>
            <p className="text-gray-500 text-lg">Simple tools that turn any meal into clear nutrition data.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#fff9f0] p-8 rounded-3xl transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f05a22] shadow-sm mb-6">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Food classification</h3>
              <p className="text-gray-600 leading-relaxed">
                Point your camera at a meal and NutriScan identifies each ingredient in seconds using advanced YOLOv8 AI.
              </p>
            </div>
            
            <div className="bg-[#fff9f0] p-8 rounded-3xl transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f05a22] shadow-sm mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Calorie lookup</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant calorie and macro estimates for thousands of dishes and ingredients, completely offline.
              </p>
            </div>

            <div className="bg-[#fff9f0] p-8 rounded-3xl transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#f05a22] shadow-sm mb-6">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Built for your phone</h3>
              <p className="text-gray-600 leading-relaxed">
                Works smoothly on mobile as a PWA, so you can log meals anywhere — kitchen, café, or gym.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-[#fff9f0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500 text-lg">Three steps, straight from your phone.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 relative max-w-4xl mx-auto">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-orange-200"></div>

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center flex-1 z-10 w-full md:w-auto">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#f05a22] shadow-xl shadow-orange-900/5 mb-6 border-4 border-[#fff9f0]">
                <Camera size={32} />
              </div>
              <div className="text-[#f05a22] text-xs font-bold uppercase tracking-wider mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Snap</h3>
              <p className="text-gray-500 max-w-[200px]">Take a photo of your food</p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center flex-1 z-10 w-full md:w-auto">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#f05a22] shadow-xl shadow-orange-900/5 mb-6 border-4 border-[#fff9f0]">
                <Apple size={32} />
              </div>
              <div className="text-[#f05a22] text-xs font-bold uppercase tracking-wider mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Classify</h3>
              <p className="text-gray-500 max-w-[200px]">We identify the dish and ingredients</p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center flex-1 z-10 w-full md:w-auto">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#f05a22] shadow-xl shadow-orange-900/5 mb-6 border-4 border-[#fff9f0]">
                <BarChart2 size={32} />
              </div>
              <div className="text-[#f05a22] text-xs font-bold uppercase tracking-wider mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track</h3>
              <p className="text-gray-500 max-w-[200px]">See calories and macros instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#f05a22] py-20 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Start tracking in seconds</h2>
        <p className="text-orange-100 text-lg mb-10 max-w-xl mx-auto">
          Create a free account and classify your first meal today. Completely free, no credit card required.
        </p>
        <button onClick={onLogin} className="bg-white text-[#f05a22] font-bold px-10 py-4 rounded-full text-lg hover:bg-orange-50 transition shadow-2xl shadow-orange-900/20">
          Create your account
        </button>
      </section>
    </div>
  );
}
