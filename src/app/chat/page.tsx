"use client";

import { useState, useEffect, useRef } from "react";
import { getProfile } from "@/lib/storage";
import { UserProfile } from "@/lib/types";
import { Send, User, Bot, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your personal nutrition AI. Ask me anything about your diet, like 'What should I eat for breakfast today?' or 'Can I eat peanut butter?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || !profile) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, profile }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle size={48} className="text-orange-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Profile Required</h2>
        <p className="text-gray-600 mb-6 max-w-sm">
          You need to set up your profile first so I know your goals, allergies, and diet type!
        </p>
        <Link href="/profile" className="bg-[#f05a22] text-white px-6 py-3 rounded-xl font-bold">
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto bg-[#fff9f0]">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 shadow-sm flex items-center gap-3 shrink-0">
        <div className="bg-orange-100 p-2 rounded-full text-[#f05a22]">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">NutriScan AI</h1>
          <p className="text-xs text-gray-500 font-medium">Personalized for {profile.name || "you"}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-gray-200 text-gray-600" : "bg-[#f05a22] text-white"}`}>
              {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
              m.role === "user" 
                ? "bg-gray-900 text-white rounded-tr-sm" 
                : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm whitespace-pre-wrap"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f05a22] text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 mb-16">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your diet..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f05a22] focus:border-transparent"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-[#f05a22] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e04a12] transition shadow-md shadow-orange-200"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
