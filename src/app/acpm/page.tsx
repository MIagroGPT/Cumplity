"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  Layers,
  ChevronRight,
  Sparkles,
  Search,
  Check,
  X,
} from "lucide-react";

interface ActionItem {
  id: string;
  actionType: "CORRECTIVA" | "PREVENTIVA" | "MEJORA";
  source: string;
  findingDescription: string;
  rootCause: string | null;
  riskFactor: string | null;
  actionPlan: string;
  responsible: string;
  plannedDate: string;
  priority: "ALTA" | "MEDIA" | "BAJA";
  resources: string | null;
  status: "EN_PROCESO" | "EJECUTADO" | "NO_REALIZADO" | "CANCELADO";
  efficacy: "EFICAZ" | "NO_EFICAZ" | "PENDIENTE";
  evidenceNotes: string | null;
}

export default function AcpmPage() {
  const { activeCompany } = useTenant();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("TODOS");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [actionType, setActionType] = useState<"CORRECTIVA" | "PREVENTIVA" | "MEJORA">("CORRECTIVA");
  const [source, setSource] = useState("INSPECCIÓN DE SEGURIDAD");
  const [riskFactor, setRiskFactor] = useState("LOCATIVO");
  const [findingDescription, setFindingDescription] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [responsible, setResponsible] = useState("");
  const [priority, setPriority] = useState<"ALTA" | "MEDIA" | "BAJA">("MEDIA");
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split("T")[0]);

  const loadData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/acpm?companyId=${activeCompany.id}`);
      const data = await res.json();
      setActions(data.actions || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Error al cargar matriz ACPM:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCompany?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/acpm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          actionType,
          source,
          riskFactor,
          findingDescription,
          rootCause,
          actionPlan,
          responsible,
          priority,
          plannedDate,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFindingDescription("");
        setRootCause("");
        setActionPlan("");
        setResponsible("");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, newEfficacy?: string) => {
    try {
      await fetch("/api/acpm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          efficacy: newEfficacy,
        }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredActions = actions.filter((a) => {
    if (filterType !== "TODOS" && a.actionType !== filterType) return false;
    if (filterStatus !== "TODOS" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Fase 5: Actuar (Mejora Continua - SG-SST)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Matriz de Mejoras ACPM
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Acciones Correctivas, Preventivas y de Mejora conforme al Dec. 1072/2015 y Res. 0312.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Acción ACPM</span>
        </button>
      </div>

      {/* Tarjetas de Métricas (Derivadas de Matriz de Mejoras ACPM.xlsm) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Planes</span>
          <div className="text-2xl font-black text-carbon mt-1">{stats.total || 0}</div>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">Registrados en ciclo</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">En Proceso</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.inProgress || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Con fecha límite</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Ejecutadas</span>
          <div className="text-2xl font-black text-mint-600 mt-1">{stats.executed || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Implementadas</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Eficacia Verificada</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.effective || 0}</div>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">Medidas exitosas</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-soft-200 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Tipo de Acción:</span>
          {["TODOS", "CORRECTIVA", "PREVENTIVA", "MEJORA"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterType === t
                  ? "bg-purple-600 text-white"
                  : "bg-soft-100 text-slate-600 hover:bg-soft-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Estado:</span>
          {["TODOS", "EN_PROCESO", "EJECUTADO"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterStatus === s
                  ? "bg-carbon text-white"
                  : "bg-soft-100 text-slate-600 hover:bg-soft-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Acciones ACPM */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="bg-white border border-soft-200 rounded-3xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
            <p className="font-bold text-sm text-carbon">No hay acciones registradas en la matriz</p>
            <p className="text-xs mt-1">Crea la primera acción correctiva, preventiva o de mejora.</p>
          </div>
        ) : (
          filteredActions.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-soft-200 rounded-3xl p-5 hover:border-purple-200 transition shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      item.actionType === "CORRECTIVA"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : item.actionType === "PREVENTIVA"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {item.actionType}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-soft-100 text-slate-600">
                    Fuente: {item.source}
                  </span>

                  {item.riskFactor && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700">
                      Factor: {item.riskFactor}
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                      item.priority === "ALTA"
                        ? "bg-rose-50 text-rose-700"
                        : item.priority === "MEDIA"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Prioridad {item.priority}
                  </span>
                </div>

                <h3 className="text-sm font-black text-carbon">{item.findingDescription}</h3>

                {item.rootCause && (
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Causa Raíz:</strong> {item.rootCause}
                  </p>
                )}

                <p className="text-xs text-purple-700 font-medium">
                  <strong>Plan de Acción:</strong> {item.actionPlan}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center gap-4 pt-1">
                  <span>Responsable: <strong className="text-slate-600">{item.responsible}</strong></span>
                  <span>Fecha Planeada: <strong className="text-slate-600">{formatColDate(item.plannedDate)}</strong></span>
                </div>
              </div>

              {/* Botones de Gestión de Estado */}
              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-soft-200 w-full lg:w-auto justify-end">
                {item.status === "EN_PROCESO" ? (
                  <button
                    onClick={() => handleUpdateStatus(item.id, "EJECUTADO", "EFICAZ")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mint-500 hover:bg-mint-600 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Marcar Ejecutado
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-mint-50 text-mint-700 border border-mint-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" />
                      {item.efficacy === "EFICAZ" ? "Ejecutada y Eficaz" : "Ejecutada"}
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(item.id, "EN_PROCESO", "PENDIENTE")}
                      className="text-xs text-slate-400 hover:text-carbon underline"
                    >
                      Reabrir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nueva Acción ACPM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-soft-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-carbon">Nueva Acción de Mejora (ACPM)</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Modelo de Seguimiento de Acciones Correctivas y Preventivas
                  </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Tipo de Acción *</label>
                  <select
                    value={actionType}
                    onChange={(e: any) => setActionType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="CORRECTIVA">Correctiva (Elimina causa de no conformidad)</option>
                    <option value="PREVENTIVA">Preventiva (Anticipa potencial riesgo)</option>
                    <option value="MEJORA">Mejora (Optimización voluntaria)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Fuente del Hallazgo *</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="INSPECCIÓN DE SEGURIDAD">Inspección de Seguridad</option>
                    <option value="AUDITORIA">Auditoría Interna / Externa</option>
                    <option value="INVESTIGACIÓN AT O INCIDENTE">Investigación AT o Incidente</option>
                    <option value="COPASST">Reunión COPASST / Vigía</option>
                    <option value="REVISIÓN ALTA DIRECCIÓN">Revisión por Alta Dirección</option>
                    <option value="AUTOEVALUACIÓN ESTÁNDARES">Autoevaluación Res. 0312</option>
                    <option value="REPORTE DE UN EMPLEADO">Reporte de Acto / Condición Insegura</option>
                    <option value="SIMULACRO">Simulacro de Evacuación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Factor de Riesgo *</label>
                  <select
                    value={riskFactor}
                    onChange={(e) => setRiskFactor(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="LOCATIVO">Locativo</option>
                    <option value="MECÁNICO">Mecánico</option>
                    <option value="FÍSICO">Físico</option>
                    <option value="QUÍMICO">Químico</option>
                    <option value="BIOLÓGICO">Biológico</option>
                    <option value="BIOMECÁNICO">Biomecánico / Ergonómico</option>
                    <option value="PSICOSOCIAL">Psicosocial</option>
                    <option value="ELÉCTRICO">Eléctrico</option>
                    <option value="TRÁNSITO">Tránsito / Vial</option>
                    <option value="PÚBLICO">Público</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Prioridad *</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="ALTA">Alta (Intervención inmediata)</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Descripción del Hallazgo *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detalla qué situación o condición insegura se identificó..."
                  value={findingDescription}
                  onChange={(e) => setFindingDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Análisis de Causa Raíz (Por qué ocurrió)</label>
                <input
                  type="text"
                  placeholder="Ej: Falta de procedimiento escrito o ausencia de mantenimiento preventivo"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Plan de Acción / Medida Correctiva *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Qué acción concreta se va a implementar para solucionar el hallazgo..."
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Responsable de Ejecución *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ing. Residente de Obra / Jefe de Mantenimiento"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Fecha Límite Planeada *</label>
                  <input
                    type="date"
                    required
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Registrar Acción ACPM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
