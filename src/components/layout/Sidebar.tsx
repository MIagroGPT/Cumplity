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
  CalendarDays,
  TrendingUp,
  Activity,
  Wrench,
  Users2,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { activeCompany } = useTenant();

  const navSections = [
    {
      title: "PANEL PRINCIPAL",
      items: [
        {
          name: "Dashboard 360°",
          href: "/",
          icon: LayoutDashboard,
          badge: "PHVA",
          badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
        },
        {
          name: "Cartera de Empresas",
          href: "/companies",
          icon: Building2,
          badge: null,
        },
      ],
    },
    {
      title: "1. CONTEXTO & PERSONAL",
      items: [
        {
          name: "Trabajadores (Res. 1843)",
          href: "/workers",
          icon: Users,
          badge: null,
        },
      ],
    },
    {
      title: "2. PLANEAR",
      items: [
        {
          name: "Estándares Res. 0312",
          href: "/standards",
          icon: ClipboardCheck,
          badge: activeCompany ? `${activeCompany.requiredStandards} Est.` : null,
          badgeColor: "bg-mint-50 text-mint-600 border border-mint-200",
        },
        {
          name: "Plan de Trabajo (PTA)",
          href: "/workplan",
          icon: CalendarDays,
          badge: "2026",
          badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
        },
      ],
    },
    {
      title: "3. HACER",
      items: [
        {
          name: "Matriz GTC 45 (Peligros)",
          href: "/gtc45",
          icon: AlertOctagon,
          badge: "IA Voz",
          badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
        },
        {
          name: "Inspecciones & Preop.",
          href: "/inspections",
          icon: Wrench,
          badge: null,
        },
        {
          name: "Comités & COPASST",
          href: "/committees",
          icon: Users2,
          badge: null,
        },
      ],
    },
    {
      title: "4. VERIFICAR",
      items: [
        {
          name: "Indicadores Dec. 1072",
          href: "/indicators",
          icon: Activity,
          badge: "Legal",
          badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
        },
        {
          name: "Accidentes (Res. 1401)",
          href: "/accidents",
          icon: Flame,
          badge: "15 Días",
          badgeColor: "bg-rose-50 text-rose-700 border border-rose-200",
        },
      ],
    },
    {
      title: "5. ACTUAR",
      items: [
        {
          name: "Matriz de Mejoras ACPM",
          href: "/acpm",
          icon: TrendingUp,
          badge: "Mejora",
          badgeColor: "bg-mint-50 text-mint-700 border border-mint-200",
        },
      ],
    },
    {
      title: "CUSTODIA & CONEXIÓN",
      items: [
        {
          name: "Bóveda 20 Años (Dec. 1072)",
          href: "/vault",
          icon: FolderLock,
          badge: null,
        },
        {
          name: "Webhooks & n8n / IA",
          href: "/n8n",
          icon: Webhook,
          badge: "API",
          badgeColor: "bg-mint-50 text-mint-600 border border-mint-200",
        },
      ],
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

      {/* Menú de Navegación Estructurado por Ciclo PHVA */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[9px] font-black tracking-wider text-slate-400 uppercase px-3 py-1">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition duration-150 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                      : "text-slate-600 hover:text-carbon hover:bg-soft-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        isActive ? "bg-white/20 text-white" : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Marco Legal Footer */}
      <div className="p-3.5 m-3 rounded-2xl bg-soft-50 border border-soft-200 text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-[10px] uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" />
          Marco Normativo MinTrabajo
        </div>
        <p className="text-[10px] leading-tight text-slate-500 font-medium">
          • Dec. 1072/2015 (Ciclo PHVA)
          <br />• Res. 0312/2019 (Estándares)
          <br />• Res. 1401/2007 (Investigación AT)
          <br />• Actualizado normatividad 2026
        </p>
      </div>
    </aside>
  );
}
