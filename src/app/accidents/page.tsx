"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import {
  Flame,
  Clock,
  Plus,
  CheckCircle2,
  User,
} from "lucide-react";

interface AccidentItem {
  id: string;
  workerId?: string;
  eventDate: string;
  severity: "GRAVE" | "MORTAL" | "LEVE";
  legalDeadline: string;
  status: "PENDIENTE" | "ENVIADO_ARL" | "CERRADO";
  description: string;
  remainingBusinessDays: number;
  isOverdue: boolean;
  isCritical: boolean;
  worker?: {
    id: string;
    fullName: string;
    documentNumber: string;
    jobPosition: string;
  };
}

export default function AccidentsPage() {
  const { activeCompany } = useTenant();
  const [investigations, setInvestigations] = useState<AccidentItem[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [severity, setSeverity] = useState<"GRAVE" | "MORTAL" | "LEVE">("GRAVE");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const [accRes, wrkRes] = await Promise.all([
        fetch(`/api/accidents?companyId=${activeCompany.id}`),
        fetch(`/api/workers?companyId=${activeCompany.id}`),
      ]);
      const [accData, wrkData] = await Promise.all([accRes.json(), wrkRes.json()]);
      setInvestigations(accData.investigations || []);
      setWorkers(wrkData.workers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCompany?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;

    try {
      const res = await fetch("/api/accidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          workerId: selectedWorkerId || null,
          eventDate,
          severity,
          description,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setDescription("");
        setSelectedWorkerId("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "PENDIENTE" | "ENVIADO_ARL" | "CERRADO"
  ) => {
    try {
      const res = await fetch("/api/accidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!activeCompany) {
    return (
      <div className="text-center py-20 bg-white border border-soft-200 rounded-3xl p-8 max-w-lg mx-auto text-slate-500 shadow-sm">
        Selecciona una empresa para gestionar la investigación de accidentes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            Resolución 1401 de 2007 (Ministerio de la Protección Social)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Investigación de Accidentes de Trabajo
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Temporizador legal estricto de <strong className="text-carbon font-bold">15 días hábiles</strong> para remitir el informe a la ARL y Dirección Territorial del MinTrabajo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Reportar Accidente</span>
        </button>
      </div>

      {/* Lista de Investigaciones y Temporizadores */}
      <div className="space-y-4">
        {investigations.length === 0 ? (
          <div className="text-center py-16 bg-white border border-soft-200 rounded-3xl p-8 text-slate-500 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-mint-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-carbon">Cero accidentes reportados pendientes</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              La empresa no tiene investigaciones de accidentes en curso.
            </p>
          </div>
        ) : (
          investigations.map((item) => {
            const isAlert = item.isCritical || item.isOverdue;

            return (
              <div
                key={item.id}
                className={`bg-white border p-6 sm:p-7 rounded-3xl shadow-sm space-y-4 transition ${
                  isAlert
                    ? "border-rose-300 bg-rose-50/40"
                    : "border-soft-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item.severity === "MORTAL"
                          ? "bg-carbon text-white font-black"
                          : item.severity === "GRAVE"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      ACCIDENTE {item.severity}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      Ocurrido: <strong className="text-carbon">{formatColDate(item.eventDate)}</strong>
                    </span>
                  </div>

                  {/* Temporizador Regresivo de 15 Días Hábiles */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Vencimiento Legal (15 Días Hábiles)
                      </div>
                      <div
                        className={`text-xs font-mono font-black flex items-center justify-end gap-1 ${
                          item.status !== "PENDIENTE"
                            ? "text-purple-600"
                            : item.isOverdue
                            ? "text-rose-600 animate-pulse"
                            : item.isCritical
                            ? "text-amber-600 animate-pulse"
                            : "text-carbon"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {item.status !== "PENDIENTE"
                          ? "Completado a tiempo"
                          : item.isOverdue
                          ? `¡VENCIDO! (${Math.abs(item.remainingBusinessDays)} días de mora)`
                          : `Quedan ${item.remainingBusinessDays} días hábiles (Vence: ${formatColDate(item.legalDeadline)})`}
                      </div>
                    </div>

                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                      className="bg-soft-100 text-xs font-bold text-carbon border border-soft-200 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
                    >
                      <option value="PENDIENTE">PENDIENTE (En investigación)</option>
                      <option value="ENVIADO_ARL">ENVIADO A ARL / MINTRABAJO</option>
                      <option value="CERRADO">CERRADO (Con controles)</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm font-medium text-carbon leading-relaxed">
                  {item.description}
                </p>

                {item.worker && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-soft-50 border border-soft-200 text-xs text-slate-600 font-medium">
                    <User className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      Trabajador Afectado: <strong className="text-carbon">{item.worker.fullName}</strong> • C.C. {item.worker.documentNumber} • Cargo: {item.worker.jobPosition}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-soft-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Resolución 1401/2007: Obligatorio equipo investigador</span>
                  <span className="text-purple-600 font-bold">Trazabilidad Legal 20 Años</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Registro de Accidente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-carbon flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              Reportar Evento / Accidente de Trabajo
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              El sistema calculará automáticamente el plazo legal improrrogable de 15 días hábiles contados a partir de la fecha del suceso.
            </p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-carbon font-bold mb-1">Fecha del Evento *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon"
                  />
                </div>

                <div>
                  <label className="block text-carbon font-bold mb-1">Severidad del Evento *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon font-medium"
                  >
                    <option value="GRAVE">GRAVE (Amputación, fractura, etc.)</option>
                    <option value="MORTAL">MORTAL (Fallecimiento del trabajador)</option>
                    <option value="LEVE">LEVE (Incapacidad temporal simple)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Trabajador Accidentado</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon font-medium"
                >
                  <option value="">-- Seleccionar trabajador de la empresa --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} - {w.jobPosition} (C.C. {w.documentNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Descripción del Accidente *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla qué ocurrió, maquinaria o herramienta involucrada..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <Clock className="w-3.5 h-3.5" /> Recordatorio Legal MinTrabajo:
                </div>
                <p className="font-medium">
                  Debe remitirse a la ARL dentro de los 15 días hábiles siguientes al evento para evitar sanciones legales.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-soft-100 text-slate-600 hover:bg-soft-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/25"
                >
                  Iniciar Cronómetro de 15 Días
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
