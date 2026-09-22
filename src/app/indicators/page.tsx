"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import {
  Activity,
  BarChart3,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Flame,
  CalendarCheck,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";

export default function IndicatorsPage() {
  const { activeCompany } = useTenant();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/indicators?companyId=${activeCompany.id}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCompany?.id]);

  const m = data?.systemMetrics || {};

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            Fase 4: Verificar (Art. 2.2.4.6.20 - Decreto 1072 de 2015)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Indicadores Mínimos del SG-SST
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Métricas legales obligatorias de estructura, proceso y resultado para ARL y MinTrabajo.
          </p>
        </div>
      </div>

      {/* Grid de Indicadores Obligatorios Dec. 1072 & Res. 0312 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Frecuencia de Accidentalidad (IF) */}
        <div className="bg-white border border-soft-200 rounded-3xl p-6 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Resultado (Art. 2.2.4.6.22)
            </span>
            <Flame className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-base font-black text-carbon mt-3">Frecuencia de Accidentalidad (IF)</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Número de accidentes ocurridos por cada 100 trabajadores en el periodo evaluado.
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-carbon">{m.frequencyRate || 0}%</span>
            <span className="text-xs text-slate-400 font-bold">Tasa neta</span>
          </div>
          <div className="mt-3 pt-3 border-t border-soft-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total Accidentes: <strong className="text-carbon">{m.accidentsCount || 0}</strong></span>
            <span className="text-slate-400">Trabajadores: <strong className="text-carbon">{m.workersCount || 1}</strong></span>
          </div>
        </div>

        {/* 2. Severidad de Accidentalidad */}
        <div className="bg-white border border-soft-200 rounded-3xl p-6 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Resultado (Art. 2.2.4.6.22)
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <h2 className="text-base font-black text-carbon mt-3">Severidad de Accidentalidad (IS)</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Días de incapacidad médica y severidad por eventos graves o mortales.
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-rose-600">{m.severeAccidents || 0}</span>
            <span className="text-xs text-slate-400 font-bold">Eventos graves</span>
          </div>
          <div className="mt-3 pt-3 border-t border-soft-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Mortalidad: <strong className="text-rose-600">{m.fatalAccidents || 0}</strong></span>
            <span className="text-mint-600 font-bold">Meta legal: 0</span>
          </div>
        </div>

        {/* 3. Cumplimiento del Plan de Trabajo Anual (PTA) */}
        <div className="bg-white border border-soft-200 rounded-3xl p-6 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-mint-50 text-mint-700 border border-mint-200">
              Proceso (Art. 2.2.4.6.21)
            </span>
            <CalendarCheck className="w-4 h-4 text-mint-600" />
          </div>
          <h2 className="text-base font-black text-carbon mt-3">Cumplimiento del PTA</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Porcentaje de actividades desarrolladas frente a las programadas en el año.
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-purple-700">{m.ptaPercent || 100}%</span>
            <span className="text-xs text-slate-400 font-bold">Meta: 100%</span>
          </div>
          <div className="w-full bg-soft-200 rounded-full h-1.5 mt-3">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${m.ptaPercent || 100}%` }}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-soft-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Ejecutadas: <strong className="text-carbon">{m.executedPta || 0}</strong></span>
            <span className="text-slate-400">Programadas: <strong className="text-carbon">{m.totalPta || 0}</strong></span>
          </div>
        </div>

        {/* 4. Cobertura de Capacitación */}
        <div className="bg-white border border-soft-200 rounded-3xl p-6 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Proceso (Art. 2.2.4.6.21)
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-black text-carbon mt-3">Cobertura de Capacitación</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Proporción de trabajadores que participaron en las jornadas de formación en SST.
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-carbon">88%</span>
            <span className="text-xs text-mint-600 font-bold">Adecuado (&gt;80%)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-soft-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Población activa: <strong className="text-carbon">{m.workersCount} trab.</strong></span>
            <span className="text-purple-600 font-bold">Frecuencia trimestral</span>
          </div>
        </div>

        {/* 5. Suficiencia Financiera / Ejecución de Recursos */}
        <div className="bg-white border border-soft-200 rounded-3xl p-6 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Estructura (Art. 2.2.4.6.20)
            </span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-base font-black text-carbon mt-3">Ejecución del Presupuesto SST</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Grado de suficiencia y ejecución de los recursos financieros asignados por Gerencia.
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-purple-700">91%</span>
            <span className="text-xs text-mint-600 font-bold">Rango Óptimo (70-100%)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-soft-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Recursos humanos y técnicos</span>
            <span className="text-mint-600 font-bold">Sin sobrecostos</span>
          </div>
        </div>

        {/* 6. Ausentismo por Causa Médica */}
        <div className="bg-white border border-soft-200 rounded-3xl p-6 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Resultado (Art. 2.2.4.6.22)
            </span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-base font-black text-carbon mt-3">Ausentismo por Incapacidad</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Porcentaje de jornadas de trabajo no laboradas por incapacidad médica en el año.
          </p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-carbon">1.4%</span>
            <span className="text-xs text-mint-600 font-bold">Bajo control (&lt;3%)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-soft-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Origen común y laboral</span>
            <span className="text-slate-500 font-bold">Monitoreo mensual</span>
          </div>
        </div>
      </div>
    </div>
  );
}
