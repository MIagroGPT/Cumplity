"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { getComplianceRating } from "@/lib/utils";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
} from "lucide-react";

interface StandardItem {
  id: string;
  standardCode: string;
  standardTitle: string;
  cyclePhase: string;
  weightPercent: number;
  status: "CUMPLE" | "NO_CUMPLE" | "NO_APLICA";
  notes?: string;
  evidenceUrl?: string;
}

export default function StandardsPage() {
  const { activeCompany } = useTenant();
  const [standards, setStandards] = useState<StandardItem[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingStandard, setEditingStandard] = useState<StandardItem | null>(null);

  const fetchStandards = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/standards?companyId=${activeCompany.id}`);
      const data = await res.json();
      setStandards(data.standards || []);
      setMetrics(data.metrics || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, [activeCompany?.id]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "CUMPLE" | "NO_CUMPLE" | "NO_APLICA"
  ) => {
    setStandards((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await fetch("/api/standards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchStandards();
      }
    } catch (e) {
      console.error("Error al actualizar estándar:", e);
    }
  };

  const handleSaveNotes = async () => {
    if (!editingStandard) return;
    try {
      const res = await fetch("/api/standards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingStandard.id,
          notes: editingStandard.notes,
          evidenceUrl: editingStandard.evidenceUrl,
        }),
      });
      if (res.ok) {
        setEditingStandard(null);
        fetchStandards();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = standards.filter((s) => {
    const matchesPhase = phaseFilter === "ALL" || s.cyclePhase === phaseFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesPhase && matchesStatus;
  });

  const rating = getComplianceRating(metrics.compliancePercent || 0);

  if (!activeCompany) {
    return (
      <div className="text-center py-20 bg-white border border-soft-200 rounded-3xl p-8 max-w-lg mx-auto text-slate-500 shadow-sm">
        Por favor selecciona una empresa activa para ver su matriz de estándares.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera & Métricas de Autoevaluación */}
      <div className="bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4" />
                Resolución 0312 de 2019
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                {activeCompany.requiredStandards} Estándares Aplicables
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
              Autoevaluación de Estándares Mínimos
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Empresa: <strong className="text-carbon">{activeCompany.companyName}</strong> • Riesgo ARL {activeCompany.arlRiskLevel} • {activeCompany.workerCount} Trabajadores
            </p>
          </div>

          <div className="flex items-center gap-4 bg-soft-50 p-4 rounded-2xl border border-soft-200 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Cumplimiento Ponderado</div>
              <div className="text-3xl font-black text-carbon">
                {metrics.compliancePercent || 0}%
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${rating.badgeClass}`}>
              {rating.level}
            </span>
          </div>
        </div>

        {/* Barra de Progreso y Clasificación Legal */}
        <div className="space-y-2">
          <div className="w-full bg-soft-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${rating.barColor} transition-all duration-500`}
              style={{ width: `${metrics.compliancePercent || 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            <strong className="text-carbon font-bold">Dictamen Legal:</strong> {rating.recommendation}
          </p>
        </div>

        {/* Filtros PHVA y Estado */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-soft-200">
          {/* Fases PHVA */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5 text-purple-600" /> Fase:
            </span>
            {["ALL", "PLANEAR", "HACER", "VERIFICAR", "ACTUAR"].map((phase) => (
              <button
                key={phase}
                onClick={() => setPhaseFilter(phase)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  phaseFilter === phase
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-soft-100 text-slate-600 hover:text-carbon hover:bg-soft-200"
                }`}
              >
                {phase === "ALL" ? "Todas las fases" : phase}
              </button>
            ))}
          </div>

          {/* Estados */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-semibold">Estado:</span>
            {["ALL", "CUMPLE", "NO_CUMPLE", "NO_APLICA"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-carbon text-white shadow-xs"
                    : "bg-soft-100 text-slate-600 hover:text-carbon"
                }`}
              >
                {st === "ALL" ? "Todos" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Estándares Mínimos */}
      <div className="space-y-3">
        {filtered.map((std) => (
          <div
            key={std.id}
            className="bg-white border border-soft-200 hover:border-purple-200 p-5 sm:p-6 rounded-3xl shadow-sm transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  {std.standardCode}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-soft-100 text-slate-600 font-mono">
                  {std.cyclePhase}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Peso: <strong className="text-carbon">{std.weightPercent}%</strong>
                </span>
              </div>

              {/* Botones de Calificación Interactiva */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleUpdateStatus(std.id, "CUMPLE")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    std.status === "CUMPLE"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-soft-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cumple
                </button>

                <button
                  onClick={() => handleUpdateStatus(std.id, "NO_CUMPLE")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    std.status === "NO_CUMPLE"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-soft-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  No cumple
                </button>

                <button
                  onClick={() => handleUpdateStatus(std.id, "NO_APLICA")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    std.status === "NO_APLICA"
                      ? "bg-slate-600 text-white"
                      : "bg-soft-100 text-slate-500 hover:text-carbon"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  No aplica
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-carbon leading-snug">
              {std.standardTitle}
            </h3>

            {/* Observaciones y Evidencia */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-soft-200">
              <div className="text-slate-500 truncate max-w-lg font-medium">
                {std.notes ? (
                  <span>
                    <strong className="text-carbon">Evidencia:</strong> {std.notes}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Sin observaciones registradas</span>
                )}
              </div>

              <button
                onClick={() => setEditingStandard(std)}
                className="text-purple-600 hover:text-purple-700 text-xs font-bold shrink-0 ml-2"
              >
                Editar notas y evidencia
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar notas y evidencia del estándar */}
      {editingStandard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-base font-black text-carbon">
              Evidencia del Estándar {editingStandard.standardCode}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{editingStandard.standardTitle}</p>

            <div>
              <label className="block text-xs font-bold text-carbon mb-1">
                Observaciones y Hallazgos de Auditoría
              </label>
              <textarea
                rows={3}
                value={editingStandard.notes || ""}
                onChange={(e) =>
                  setEditingStandard({ ...editingStandard, notes: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                placeholder="Escribe los soportes, actas o documentos que respaldan este estándar..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbon mb-1">
                URL o Enlace de Evidencia Digital
              </label>
              <input
                type="text"
                value={editingStandard.evidenceUrl || ""}
                onChange={(e) =>
                  setEditingStandard({ ...editingStandard, evidenceUrl: e.target.value })
                }
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                placeholder="https://drive.google.com/... o enlace de bóveda"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingStandard(null)}
                className="px-4 py-2 rounded-xl bg-soft-100 text-xs font-bold text-slate-600 hover:bg-soft-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 shadow-md shadow-purple-600/25"
              >
                Guardar Evidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
