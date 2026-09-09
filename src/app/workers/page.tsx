"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import {
  Users,
  UserPlus,
  HeartPulse,
  Search,
  Calendar,
} from "lucide-react";

interface WorkerItem {
  id: string;
  fullName: string;
  documentNumber: string;
  jobPosition: string;
  isActive: boolean;
  medicalExamDate?: string;
  createdAt: string;
  _count?: {
    documents: number;
    accidents: number;
  };
}

export default function WorkersPage() {
  const { activeCompany, refreshCompanies } = useTenant();
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario
  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [medicalExamDate, setMedicalExamDate] = useState("");

  const fetchWorkers = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workers?companyId=${activeCompany.id}`);
      const data = await res.json();
      setWorkers(data.workers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [activeCompany?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;

    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          fullName,
          documentNumber,
          jobPosition,
          medicalExamDate: medicalExamDate || null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFullName("");
        setDocumentNumber("");
        setJobPosition("");
        setMedicalExamDate("");
        fetchWorkers();
        refreshCompanies();
      } else {
        const data = await res.json();
        alert(data.error || "Error al registrar");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = workers.filter(
    (w) =>
      w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.documentNumber.includes(searchTerm) ||
      w.jobPosition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeCompany) {
    return (
      <div className="text-center py-20 bg-white border border-soft-200 rounded-3xl p-8 max-w-lg mx-auto text-slate-500 shadow-sm">
        Selecciona una empresa para gestionar sus trabajadores.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            Censo de Personal & Resolución 1843 de 2025
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Registro de Trabajadores y Salud Ocupacional
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Empresa: <strong className="text-carbon">{activeCompany.companyName}</strong> • {workers.length} Trabajadores vinculados
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Vincular Trabajador</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, cédula o cargo del empleado..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-soft-200 text-xs text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Grid de Trabajadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-soft-200 rounded-3xl p-8 text-slate-500 shadow-sm">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-bold text-carbon">Sin trabajadores registrados</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Vincula los empleados para llevar el control de exámenes médicos y custodia documental.
            </p>
          </div>
        ) : (
          filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-soft-200 p-6 rounded-3xl shadow-sm space-y-3.5 hover:border-purple-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-carbon">{w.fullName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 font-bold">C.C. {w.documentNumber}</p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-mint-50 text-mint-600 border border-mint-200">
                  Activo
                </span>
              </div>

              <div className="p-3.5 bg-soft-50 border border-soft-200 rounded-2xl text-xs space-y-1.5">
                <div className="text-carbon font-bold">{w.jobPosition}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-soft-200 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    Examen Ocupacional:{" "}
                    <strong className="text-carbon">
                      {w.medicalExamDate ? formatColDate(w.medicalExamDate) : "Pendiente"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-soft-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>{w._count?.documents || 0} docs en bóveda</span>
                <span className="text-purple-600 font-bold">Res. 1843/2025</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear Trabajador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-carbon flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Vincular Trabajador al SG-SST
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-carbon font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Andrés Felipe Morales"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon"
                />
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Cédula de Ciudadanía *</label>
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: 1020304050"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon"
                />
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Cargo u Ocupación *</label>
                <input
                  type="text"
                  required
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="Ej: Conductor de Camión, Operario..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon"
                />
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">
                  Fecha Último Examen Ocupacional (Res. 1843/2025)
                </label>
                <input
                  type="date"
                  value={medicalExamDate}
                  onChange={(e) => setMedicalExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon font-medium"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/25"
                >
                  Registrar Trabajador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
