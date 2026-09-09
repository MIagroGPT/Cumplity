"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import {
  ShieldCheck,
  Building2,
  PlusCircle,
  UserCheck,
  ChevronDown,
  LogOut,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const { consultant, logout } = useAuth();
  const {
    companies,
    activeCompany,
    setActiveCompanyId,
    setIsCreateModalOpen,
  } = useTenant();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md text-carbon border-b border-soft-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-5 h-5 text-white font-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-carbon">
                  CUMPLITY <span className="text-purple-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  SST SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                SG-SST Colombia • Dec. 1072 & Res. 0312
              </p>
            </div>
          </Link>
        </div>

        {/* Multi-Tenant Selector Central */}
        <div className="flex items-center gap-2.5 max-w-md w-full justify-center">
          <div className="relative flex items-center bg-soft-100 border border-soft-300 rounded-2xl px-3.5 py-1.5 shadow-sm w-full max-w-xs sm:max-w-sm hover:border-purple-300 transition">
            <Building2 className="w-4 h-4 text-purple-600 shrink-0 mr-2" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Empresa Cliente Activa
              </div>
              <select
                value={activeCompany?.id || ""}
                onChange={(e) => setActiveCompanyId(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-carbon focus:outline-none truncate cursor-pointer mt-0.5"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-carbon">
                    {c.companyName} ({c.requiredStandards} Est. • ARL {c.arlRiskLevel})
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none ml-1" />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition transform hover:-translate-y-0.5 whitespace-nowrap"
            title="Crear Nueva Empresa Cliente"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Nueva Empresa</span>
          </button>
        </div>

        {/* Perfil del Consultor SST con Licencia MinTrabajo */}
        <div className="flex items-center gap-3">
          {consultant ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-extrabold text-carbon flex items-center justify-end gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  {consultant.fullName}
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-600">
                  Lic. MinTrabajo: {consultant.licenseNumber}
                </span>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xs font-black text-purple-600 shadow-sm">
                {consultant.fullName.substring(0, 2).toUpperCase()}
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-soft-100 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm"
            >
              Ingreso Consultor
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
