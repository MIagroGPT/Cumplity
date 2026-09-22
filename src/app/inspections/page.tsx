"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Plus,
  Filter,
  Layers,
  X,
  Check,
} from "lucide-react";

interface InspectionItem {
  id: string;
  inspectionType: string;
  equipmentOrArea: string;
  inspectorName: string;
  inspectionDate: string;
  status: "CONFORME" | "NO_CONFORME" | "CRITICO";
  findingsCount: number;
  observations: string | null;
  correctiveAction: string | null;
}

const EQUIPMENT_OPTIONS = [
  "Pulidora y Esmeril",
  "Taladro y Demoledor",
  "Andamios y Sistemas de Acceso",
  "Sierra Eléctrica Circular",
  "Concretadora / Mezcladora",
  "Compresor y Motobomba",
  "Minicargador / Retroexcavadora",
  "Equipos de Soldadura",
  "Kit de Rescate en Alturas",
  "Extintores Portátiles",
  "Botiquín de Primeros Auxilios",
  "Camilla de Emergencia",
  "Elementos de Protección Personal (EPP)",
  "Inspección Locativa y Orden/Aseo",
];

export default function InspectionsPage() {
  const { activeCompany } = useTenant();
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [inspectionType, setInspectionType] = useState("PREOPERACIONAL");
  const [equipmentOrArea, setEquipmentOrArea] = useState(EQUIPMENT_OPTIONS[0]);
  const [inspectorName, setInspectorName] = useState("");
  const [status, setStatus] = useState<"CONFORME" | "NO_CONFORME" | "CRITICO">("CONFORME");
  const [findingsCount, setFindingsCount] = useState(0);
  const [observations, setObservations] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");

  const loadData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inspections?companyId=${activeCompany.id}`);
      const json = await res.json();
      setInspections(json.inspections || []);
      setStats(json.stats || {});
    } catch (e) {
      console.error(e);
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
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          inspectionType,
          equipmentOrArea,
          inspectorName,
          status,
          findingsCount,
          observations,
          correctiveAction,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setObservations("");
        setCorrectiveAction("");
        setFindingsCount(0);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = inspections.filter((i) => {
    if (filterType === "TODOS") return true;
    if (filterType === "PREOPERACIONAL" && i.inspectionType === "PREOPERACIONAL") return true;
    if (filterType === "EMERGENCIAS" && ["EXTINTORES", "BOTIQUIN", "CAMILLAS"].includes(i.inspectionType)) return true;
    if (filterType === "LOCATIVA" && i.inspectionType === "LOCATIVA") return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <ClipboardCheck className="w-4 h-4" />
            Fase 3: Hacer (Inspecciones & Preoperacionales)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Inspecciones de Seguridad & Preoperacionales
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Control de equipos críticos, análisis de trabajo seguro (ATS) y elementos de emergencia.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Inspección</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Inspecciones Totales</span>
          <div className="text-2xl font-black text-carbon mt-1">{stats.total || 0}</div>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">Realizadas</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Conformes</span>
          <div className="text-2xl font-black text-mint-600 mt-1">{stats.conforming || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Aptos para operar</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Con Hallazgos</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.nonConforming || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Requieren ajuste</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Críticos / Parados</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.critical || 0}</div>
          <span className="text-[11px] text-rose-600 font-bold mt-1 block">Fuera de servicio</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 bg-white border border-soft-200 p-3 rounded-2xl overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <span className="text-xs font-bold text-slate-600 shrink-0">Categoría:</span>
        {["TODOS", "PREOPERACIONAL", "EMERGENCIAS", "LOCATIVA"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterType === cat
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-soft-100 text-slate-600 hover:bg-soft-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Inspecciones */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-soft-200 rounded-3xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
            <p className="font-bold text-sm text-carbon">No hay inspecciones registradas</p>
            <p className="text-xs mt-1">Registra la primera inspección preoperacional o de seguridad.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-soft-200 rounded-3xl p-5 hover:border-purple-200 transition shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      item.status === "CONFORME"
                        ? "bg-mint-50 text-mint-700 border-mint-200"
                        : item.status === "NO_CONFORME"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-soft-100 text-slate-600">
                    Tipo: {item.inspectionType}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700">
                    Fecha: {formatColDate(item.inspectionDate)}
                  </span>
                </div>

                <h3 className="text-sm font-black text-carbon">{item.equipmentOrArea}</h3>

                <p className="text-xs text-slate-500">
                  <strong>Inspector:</strong> {item.inspectorName}
                </p>

                {item.observations && (
                  <p className="text-xs text-slate-600">
                    <strong>Hallazgo:</strong> {item.observations}
                  </p>
                )}

                {item.correctiveAction && (
                  <p className="text-xs text-purple-700 font-medium">
                    <strong>Medida Inmediata:</strong> {item.correctiveAction}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.status === "CONFORME" ? (
                  <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-mint-50 text-mint-700 border border-mint-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" />
                    Equipo Seguro
                  </span>
                ) : (
                  <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Requiere Acción ACPM
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Registrar Inspección */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-soft-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-carbon">Registrar Inspección de Seguridad</h2>
                  <p className="text-xs text-slate-500 font-medium">Control preoperacional y locativo</p>
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
                  <label className="block text-xs font-bold text-carbon mb-1">Tipo de Inspección *</label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="PREOPERACIONAL">Preoperacional de Maquinaria</option>
                    <option value="LOCATIVA">Locativa (Orden y Aseo)</option>
                    <option value="EXTINTORES">Extintores de Emergencia</option>
                    <option value="BOTIQUIN">Botiquín de Primeros Auxilios</option>
                    <option value="CAMILLAS">Camillas de Rescate</option>
                    <option value="EPP">Dotación y Elementos de Protección</option>
                    <option value="ATS">Análisis de Trabajo Seguro (ATS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Estado de Seguridad *</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="CONFORME">Conforme (Apto para operar)</option>
                    <option value="NO_CONFORME">No Conforme (Hallazgos menores)</option>
                    <option value="CRITICO">Crítico (Parada inmediata de labor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Equipo o Área Inspeccionada *</label>
                <select
                  value={equipmentOrArea}
                  onChange={(e) => setEquipmentOrArea(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Nombre del Inspector *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Camilo Ospina (Vigía SST)"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Observaciones o Hallazgos</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre estado de cables, guardas, freno, fugas o vigencia de recarga..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Medida Correctiva Inmediata</label>
                <input
                  type="text"
                  placeholder="Ej: Cambio inmediato de disco o envío a mantenimiento correctivo"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
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
                  {submitting ? "Guardando..." : "Guardar Inspección"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
