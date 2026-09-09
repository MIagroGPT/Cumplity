"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertOctagon,
  FolderLock,
  Flame,
  Users,
  Webhook,
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { activeCompany } = useTenant();

  const navItems = [
    {
      name: "Dashboard PHVA",
      href: "/",
      icon: LayoutDashboard,
      badge: "360°",
      badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
    },
    {
      name: "Cartera de Empresas",
      href: "/companies",
      icon: Building2,
      badge: null,
    },
    {
      name: "Estándares Res. 0312",
      href: "/standards",
      icon: ClipboardCheck,
      badge: activeCompany ? `${activeCompany.requiredStandards} Est.` : null,
      badgeColor: "bg-mint-50 text-mint-600 border border-mint-200",
    },
    {
      name: "Matriz GTC 45 (Peligros)",
      href: "/gtc45",
      icon: AlertOctagon,
      badge: "IA Voz",
      badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
    },
    {
      name: "Bóveda 20 Años (Dec. 1072)",
      href: "/vault",
      icon: FolderLock,
      badge: "Legal",
      badgeColor: "bg-soft-200 text-carbon font-semibold border border-soft-300",
    },
    {
      name: "Accidentes (Res. 1401)",
      href: "/accidents",
      icon: Flame,
      badge: "15 Días",
      badgeColor: "bg-rose-50 text-rose-700 border border-rose-200",
    },
    {
      name: "Trabajadores (Res. 1843)",
      href: "/workers",
      icon: Users,
      badge: null,
    },
    {
      name: "Webhooks & n8n / IA",
      href: "/n8n",
      icon: Webhook,
      badge: "API",
      badgeColor: "bg-mint-50 text-mint-600 border border-mint-200",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-soft-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] shadow-sm">
      {/* Resumen del Tenant Activo */}
      {activeCompany && (
        <div className="p-4 border-b border-soft-200 bg-soft-50">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Empresa Seleccionada
          </div>
          <div className="font-extrabold text-sm text-carbon truncate mt-0.5">
            {activeCompany.companyName}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-white border border-soft-300 text-carbon font-mono font-bold shadow-2xs">
              NIT: {activeCompany.nit}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-extrabold">
              ARL {activeCompany.arlRiskLevel}
            </span>
          </div>
        </div>
      )}

      {/* Menú de Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition duration-150 ${
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                  : "text-slate-600 hover:text-carbon hover:bg-soft-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Marco Legal Footer */}
      <div className="p-3.5 m-3 rounded-2xl bg-soft-50 border border-soft-200 text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-[10px] uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" />
          Marco Normativo MinTrabajo
        </div>
        <p className="text-[10px] leading-tight text-slate-500 font-medium">
          • Dec. 1072/2015 (Ciclo PHVA)
          <br />• Res. 0312/2019 (Estándares Mínimos)
          <br />• Res. 1843/2025 (Salud Ocupacional)
          <br />• Res. 1401/2007 (Investigación AT)
        </p>
      </div>
    </aside>
  );
}
