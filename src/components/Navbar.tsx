"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/api";
import type { User } from "@/lib/types";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <nav className="no-print bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-700">MedDoc AI</span>
          <span className="text-xs text-gray-400 hidden sm:inline">by Notem</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 hidden md:block truncate max-w-[200px]">
              {user.name}
              {user.crm && user.crm_state && (
                <span className="text-gray-400 ml-1">
                  · CRM/{user.crm_state} {user.crm}
                </span>
              )}
            </span>
          )}
          <Link
            href="/perfil"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
