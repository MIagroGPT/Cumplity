"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  Check,
  Sparkles,
  Layers,
  X,
} from "lucide-react";

interface WorkPlanItem {
  id: string;
  activityName: string;
  phvaCycle: "PLANEAR" | "HACER" | "VERIFICAR" | "ACTUAR";
  objective: string | null;
  responsible: string;
  resources: string | null;
  targetPercent: number;
  executedPercent: number;
  plannedMonths: string;
  status: "PROGRAMADA" | "EN_PROCESO" | "EJECUTADA" | "CANCELADA";
  year: number;
}

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export default function WorkPlanPage() {
  const { activeCompany } = useTenant();
  const [plans, setPlans] = useState<WorkPlanItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [activityName, setActivityName] = useState("");
  const [phvaCycle, setPhvaCycle] = useState<"PLANEAR" | "HACER" | "VERIFICAR" | "ACTUAR">("PLANEAR");
  const [objective, setObjective] = useState("");
  const [responsible, setResponsible] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>(["ENE", "FEB"]);

  const loadData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workplan?companyId=${activeCompany.id}`);
      const data = await res.json();
      setPlans(data.plans || []);
      setStats(data.stats || {});
    } catch (e) {
      console.error("Error al cargar PTA:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCompany?.id]);

  const toggleMonth = (m: string) => {
    if (selectedMonths.includes(m)) {
      setSelectedMonths(selectedMonths.filter((item) => item !== m));
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          activityName,
          phvaCycle,
          objective,
          responsible,
          plannedMonths: selectedMonths.join(","),
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setActivityName("");
        setObjective("");
        setResponsible("");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, pct: number) => {
    try {
      await fetch("/api/workplan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          executedPercent: pct,
        }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (filterPhase !== "TODOS" && p.phvaCycle !== filterPhase) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            Fase 2: Planear (Estándar 2.6 - Res. 0312 de 2019)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Plan de Trabajo Anual (PTA 2026)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Cronograma integral de actividades del SG-SST firmado y verificado según el Art. 2.2.4.6.17 del Dec. 1072.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agregar Actividad al PTA</span>
        </button>
      </div>

      {/* Métricas de Ejecución */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Actividades Totales</span>
          <div className="text-2xl font-black text-carbon mt-1">{stats.total || 0}</div>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">En cronograma</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Ejecutadas</span>
          <div className="text-2xl font-black text-mint-600 mt-1">{stats.executed || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Con evidencia</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">En Proceso</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.inProgress || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">En ejecución activa</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">% Cumplimiento PTA</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.progressPercent || 0}%</div>
          <div className="w-full bg-soft-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filtros por Ciclo PHVA */}
      <div className="flex items-center gap-2 bg-white border border-soft-200 p-3 rounded-2xl overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <span className="text-xs font-bold text-slate-600 shrink-0">Filtrar Ciclo:</span>
        {["TODOS", "PLANEAR", "HACER", "VERIFICAR", "ACTUAR"].map((phase) => (
          <button
            key={phase}
            onClick={() => setFilterPhase(phase)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterPhase === phase
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-soft-100 text-slate-600 hover:bg-soft-200"
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Cronograma de Actividades */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          <div className="bg-white border border-soft-200 rounded-3xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
            <p className="font-bold text-sm text-carbon">No hay actividades registradas en el PTA</p>
            <p className="text-xs mt-1">Empieza agregando las actividades obligatorias anuales.</p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const plannedArr = plan.plannedMonths ? plan.plannedMonths.split(",") : [];
            return (
              <div
                key={plan.id}
                className="bg-white border border-soft-200 rounded-3xl p-5 hover:border-purple-200 transition shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                        plan.phvaCycle === "PLANEAR"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : plan.phvaCycle === "HACER"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : plan.phvaCycle === "VERIFICAR"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-mint-50 text-mint-700 border-mint-200"
                      }`}
                    >
                      {plan.phvaCycle}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-soft-100 text-slate-600">
                      Resp: {plan.responsible}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        plan.status === "EJECUTADA"
                          ? "bg-mint-50 text-mint-700"
                          : plan.status === "EN_PROCESO"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {plan.status} ({plan.executedPercent}%)
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-carbon">{plan.activityName}</h3>

                  {plan.objective && (
                    <p className="text-xs text-slate-500">
                      <strong>Objetivo:</strong> {plan.objective}
                    </p>
                  )}

                  {/* Matriz de Meses Ene-Dic */}
                  <div className="flex items-center gap-1 pt-2 overflow-x-auto">
                    {MONTHS.map((m) => {
                      const isPlanned = plannedArr.includes(m);
                      return (
                        <span
                          key={m}
                          className={`text-[9px] font-bold px-2 py-1 rounded-md border ${
                            isPlanned
                              ? plan.status === "EJECUTADA"
                                ? "bg-mint-500 text-white border-mint-600"
                                : "bg-purple-600 text-white border-purple-700"
                              : "bg-soft-100 text-slate-400 border-soft-200"
                          }`}
                        >
                          {m}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Acciones de Actualización */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-soft-200 w-full lg:w-auto justify-end">
                  {plan.status !== "EJECUTADA" ? (
                    <button
                      onClick={() => handleUpdateStatus(plan.id, "EJECUTADA", 100)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mint-500 hover:bg-mint-600 text-white text-xs font-bold shadow-xs transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar 100% Ejecutada
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(plan.id, "EN_PROCESO", 50)}
                      className="text-xs text-slate-400 hover:text-carbon underline"
                    >
                      Reabrir Actividad
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Agregar Actividad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-soft-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-carbon">Nueva Actividad PTA 2026</h2>
                  <p className="text-xs text-slate-500 font-medium">Cronograma Anual de Seguridad y Salud</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-carbon p-2 rounded-xl hover:bg-soft-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Nombre de la Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ejecución de Exámenes Médicos Periódicos y Profesiograma"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Fase Ciclo PHVA *</label>
                  <select
                    value={phvaCycle}
                    onChange={(e: any) => setPhvaCycle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="PLANEAR">Planear (Diseño, Recursos, Metas)</option>
                    <option value="HACER">Hacer (Ejecución, Capacitación, EPP)</option>
                    <option value="VERIFICAR">Verificar (Auditorías, Indicadores)</option>
                    <option value="ACTUAR">Actuar (Planes de Mejora ACPM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Responsable *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Responsable SG-SST / Gerencia"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Objetivo de la Actividad</label>
                <input
                  type="text"
                  placeholder="Ej: Evaluar condiciones de salud de todos los trabajadores"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-2">Meses Programados para Ejecución *</label>
                <div className="grid grid-cols-6 gap-2">
                  {MONTHS.map((m) => {
                    const isSelected = selectedMonths.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => toggleMonth(m)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-soft-100 text-slate-600 border-soft-200 hover:bg-soft-200"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-soft-200 text-xs font-bold text-slate-600 hover:bg-soft-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedMonths.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Agregar Actividad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
