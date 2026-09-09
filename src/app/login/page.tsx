"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, Award, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("consultor@cumplity.com");
  const [licenseNumber, setLicenseNumber] = useState("SST-LIC-2024-88910");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await login({ email, licenseNumber, password });
    if (success) {
      router.push("/");
    } else {
      setError("Credenciales no válidas. Puedes usar los datos de prueba sugeridos.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8 bg-white border border-soft-200 p-8 sm:p-10 rounded-3xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/25 mb-4">
            <ShieldCheck className="w-8 h-8 text-white font-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight">
            CUMPLITY <span className="text-purple-600">AI</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Ingreso de Especialistas y Consultores en SG-SST (Colombia)
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-carbon mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              placeholder="consultor@cumplity.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-carbon mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              Número de Licencia SST MinTrabajo
            </label>
            <input
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
              placeholder="SST-LIC-2024-88910"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-carbon mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Verificando credenciales..." : "Ingresar a mi Cartera de Empresas"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-soft-200 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Usuario de demostración cargado por defecto (Licencia MinTrabajo válida).
          </p>
        </div>
      </div>
    </div>
  );
}
