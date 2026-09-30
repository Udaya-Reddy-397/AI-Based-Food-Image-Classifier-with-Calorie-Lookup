"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, History, User, MessageCircle } from "lucide-react";
import clsx from "clsx";

import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/history", label: "History", icon: History },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors",
                active ? "text-[#f05a22]" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? "font-semibold" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
