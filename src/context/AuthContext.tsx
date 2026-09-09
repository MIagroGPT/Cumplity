"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ConsultantUser {
  id: string;
  fullName: string;
  licenseNumber: string;
  email: string;
}

interface AuthContextType {
  consultant: ConsultantUser | null;
  loading: boolean;
  login: (data: { email?: string; licenseNumber?: string; password?: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [consultant, setConsultant] = useState<ConsultantUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar recuperar de localStorage o api/auth/me
    const stored = localStorage.getItem("cumplity_consultant");
    if (stored) {
      try {
        setConsultant(JSON.parse(stored));
        setLoading(false);
        return;
      } catch (e) {
        // ignore
      }
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.consultant) {
          setConsultant(data.consultant);
          localStorage.setItem("cumplity_consultant", JSON.stringify(data.consultant));
        }
      })
      .catch((err) => console.error("Error loading session:", err))
      .finally(() => setLoading(false));
  }, []);

  const login = async (params: { email?: string; licenseNumber?: string; password?: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.consultant) {
        setConsultant(data.consultant);
        localStorage.setItem("cumplity_consultant", JSON.stringify(data.consultant));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    setConsultant(null);
    localStorage.removeItem("cumplity_consultant");
  };

  return (
    <AuthContext.Provider value={{ consultant, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
