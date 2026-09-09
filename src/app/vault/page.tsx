"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import {
  FolderLock,
  UploadCloud,
  ShieldCheck,
  User,
  Clock,
  Search,
  Lock,
} from "lucide-react";

interface VaultDoc {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  retentionYears: number;
  uploadedAt: string;
  expiresAt: string;
  yearsRemaining: number;
  worker?: {
    id: string;
    fullName: string;
    documentNumber: string;
    jobPosition: string;
  };
}

export default function VaultPage() {
  const { activeCompany } = useTenant();
  const [documents, setDocuments] = useState<VaultDoc[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario
  const [documentType, setDocumentType] = useState("EVALUACION_MEDICA");
  const [fileName, setFileName] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  const fetchData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const [vltRes, wrkRes] = await Promise.all([
        fetch(`/api/vault?companyId=${activeCompany.id}`),
        fetch(`/api/workers?companyId=${activeCompany.id}`),
      ]);
      const [vltData, wrkData] = await Promise.all([vltRes.json(), wrkRes.json()]);
      setDocuments(vltData.documents || []);
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !fileName.trim()) return;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          workerId: selectedWorkerId || null,
          documentType,
          fileName,
          retentionYears: 20,
        }),
      });

      if (res.ok) {
        setIsUploadModalOpen(false);
        setFileName("");
        setSelectedWorkerId("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = documents.filter(
    (d) =>
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.worker?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeCompany) {
    return (
      <div className="text-center py-20 bg-white border border-soft-200 rounded-3xl p-8 max-w-lg mx-auto text-slate-500 shadow-sm">
        Selecciona una empresa para gestionar su Bóveda Digital.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            Custodia Legal: Artículo 2.2.4.6.13 del Decreto 1072 de 2015
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Bóveda Digital con Retención de 20 Años
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Garantiza la conservación inalterable de historias ocupacionales, capacitaciones y registros SST durante dos décadas.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition transform hover:-translate-y-0.5"
        >
          <UploadCloud className="w-4 h-4" />
          <span>+ Archivar en Bóveda</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar documento, tipo de registro o nombre del trabajador..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-soft-200 text-xs text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-soft-200 rounded-3xl p-8 text-slate-500 shadow-sm">
            <FolderLock className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-bold text-carbon">Bóveda vacía para esta empresa</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Archiva los exámenes médicos, actas de COPASST o certificados de capacitación.
            </p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-soft-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-200 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {doc.documentType.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-soft-100 text-carbon font-extrabold flex items-center gap-1 border border-soft-200">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    20 Años
                  </span>
                </div>

                <h3 className="text-sm font-bold text-carbon mt-3 line-clamp-1" title={doc.fileName}>
                  {doc.fileName}
                </h3>

                {doc.worker && (
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 bg-soft-50 p-2.5 rounded-2xl border border-soft-200 font-medium">
                    <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">
                      {doc.worker.fullName} ({doc.worker.jobPosition})
                    </span>
                  </div>
                )}
              </div>

              {/* Información de Custodia y Vencimiento */}
              <div className="pt-3 border-t border-soft-200 text-[11px] text-slate-500 space-y-1 font-medium">
                <div className="flex items-center justify-between">
                  <span>Archivado:</span>
                  <span className="text-carbon font-mono font-bold">{formatColDate(doc.uploadedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Caducidad legal:</span>
                  <span className="text-purple-600 font-mono font-bold">
                    Año {new Date(doc.expiresAt).getFullYear()} ({doc.yearsRemaining} años restantes)
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Carga a Bóveda */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-carbon">Archivar en Bóveda Digital (20 Años)</h3>
            <p className="text-xs text-slate-500 font-medium">
              Conforme al Art. 2.2.4.6.13 del Decreto 1072, este registro contará con una política de custodia automática calculada a 20 años desde hoy.
            </p>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-carbon font-bold mb-1">Tipo de Documento *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon font-medium"
                >
                  <option value="EVALUACION_MEDICA">Evaluación Médica Ocupacional (Res. 1843/2025)</option>
                  <option value="HISTORIA_CLINICA_OCUPACIONAL">Historia Clínica Ocupacional (Confidencial)</option>
                  <option value="CAPACITACION">Certificado de Capacitación / Inducción en SST</option>
                  <option value="INVESTIGACION_ACCIDENTE">Informe de Investigación de Accidente (Res. 1401)</option>
                  <option value="MATRIZ_GTC45">Matriz de Peligros y Riesgos GTC 45</option>
                  <option value="MEDICION_HIGIENE">Monitoreo Ambiental / Higiene Ocupacional</option>
                  <option value="ACTA_COPASST">Actas de Conformación y Reunión del COPASST / Vigía</option>
                </select>
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Nombre o Título del Archivo *</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Ej: Examen_Ingreso_Juan_Perez_2024.pdf"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon"
                />
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Vincular a Trabajador (Opcional)</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon font-medium"
                >
                  <option value="">-- No vincular a un trabajador individual (Documento General) --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} - C.C. {w.documentNumber} ({w.jobPosition})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-purple-900 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-purple-700">
                  <Clock className="w-3.5 h-3.5" /> Retención Legal Calculada:
                </div>
                <p className="font-medium">
                  Vencimiento calculado para el año <strong>{new Date().getFullYear() + 20}</strong>. Cumple con la trazabilidad ante auditorías del Ministerio del Trabajo.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-soft-100 text-slate-600 hover:bg-soft-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/25"
                >
                  Custodiar en Bóveda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
