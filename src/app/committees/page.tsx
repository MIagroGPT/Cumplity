"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import {
  Users2,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Plus,
  Filter,
  Layers,
  X,
  Calendar,
} from "lucide-react";

interface CommitteeItem {
  id: string;
  committeeType: "COPASST" | "VIGIA" | "CONVIVENCIA";
  period: string;
  meetingNumber: number;
  meetingDate: string;
  attendees: string;
  topicsDiscussed: string;
  commitments: string;
}

export default function CommitteesPage() {
  const { activeCompany } = useTenant();
  const [records, setRecords] = useState<CommitteeItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [committeeType, setCommitteeType] = useState<"COPASST" | "VIGIA" | "CONVIVENCIA">("COPASST");
  const [period, setPeriod] = useState("2024-2026");
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendees, setAttendees] = useState("");
  const [topicsDiscussed, setTopicsDiscussed] = useState("");
  const [commitments, setCommitments] = useState("");

  const loadData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/committees?companyId=${activeCompany.id}`);
      const json = await res.json();
      setRecords(json.records || []);
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
      const res = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          committeeType,
          period,
          meetingNumber,
          meetingDate,
          attendees,
          topicsDiscussed,
          commitments,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setAttendees("");
        setTopicsDiscussed("");
        setCommitments("");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = records.filter((r) => {
    if (filterType === "TODOS") return true;
    if (filterType === "COPASST" && (r.committeeType === "COPASST" || r.committeeType === "VIGIA")) return true;
    if (filterType === "CONVIVENCIA" && r.committeeType === "CONVIVENCIA") return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <Users2 className="w-4 h-4" />
            Fase 3: Hacer (Comités Paritarios & Convivencia)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            COPASST / Vigía & Comité de Convivencia
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Actas de reuniones periódicas, seguimiento de compromisos y prevención del acoso laboral.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Acta de Reunión</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Actas Totales</span>
          <div className="text-2xl font-black text-carbon mt-1">{stats.total || 0}</div>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">Periodo actual</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">COPASST / Vigía</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.copasstCount || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Obligatorio mensual</span>
        </div>

        <div className="bg-white border border-soft-200 p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Comité de Convivencia</span>
          <div className="text-2xl font-black text-mint-600 mt-1">{stats.cclCount || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Trimestral (Res. 652/2012)</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 bg-white border border-soft-200 p-3 rounded-2xl overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <span className="text-xs font-bold text-slate-600 shrink-0">Comité:</span>
        {["TODOS", "COPASST", "CONVIVENCIA"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterType === t
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-soft-100 text-slate-600 hover:bg-soft-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Lista de Actas */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-soft-200 rounded-3xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
            <p className="font-bold text-sm text-carbon">No hay actas registradas</p>
            <p className="text-xs mt-1">Registra la primera reunión del comité.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-soft-200 rounded-3xl p-5 hover:border-purple-200 transition shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      r.committeeType === "CONVIVENCIA"
                        ? "bg-mint-50 text-mint-700 border-mint-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {r.committeeType}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-soft-100 text-slate-600">
                    Acta Nº {r.meetingNumber}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700">
                    Fecha: {formatColDate(r.meetingDate)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium">
                  <strong>Asistentes:</strong> {r.attendees}
                </p>

                <p className="text-xs text-slate-600">
                  <strong>Temas Tratados:</strong> {r.topicsDiscussed}
                </p>

                {r.commitments && (
                  <p className="text-xs text-purple-700 font-semibold">
                    <strong>Compromisos:</strong> {r.commitments}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-soft-100 text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Acta Digital
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Registrar Acta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-soft-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-carbon">Registrar Acta de Reunión</h2>
                  <p className="text-xs text-slate-500 font-medium">COPASST, Vigía o Convivencia Laboral</p>
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
                  <label className="block text-xs font-bold text-carbon mb-1">Tipo de Comité *</label>
                  <select
                    value={committeeType}
                    onChange={(e: any) => setCommitteeType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="COPASST">COPASST (&gt;10 trabajadores)</option>
                    <option value="VIGIA">Vigía SST (&le;10 trabajadores)</option>
                    <option value="CONVIVENCIA">Comité de Convivencia Laboral (CCL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-carbon mb-1">Nº de Acta y Fecha *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      required
                      value={meetingNumber}
                      onChange={(e) => setMeetingNumber(parseInt(e.target.value || "1", 10))}
                      className="w-20 text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                    <input
                      type="date"
                      required
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Asistentes a la Reunión *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carolina Méndez (Presidente), Carlos Ruiz (Secretario), Jorge Morales"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Temas Tratados *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Revisión de inspecciones, reporte de novedades, análisis de condiciones de trabajo..."
                  value={topicsDiscussed}
                  onChange={(e) => setTopicsDiscussed(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Compromisos Adquiridos</label>
                <textarea
                  rows={2}
                  placeholder="Acciones acordadas, responsables y fechas de verificación..."
                  value={commitments}
                  onChange={(e) => setCommitments(e.target.value)}
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
                  {submitting ? "Guardando..." : "Guardar Acta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
