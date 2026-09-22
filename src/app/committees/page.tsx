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
  Printer,
  FileDown,
  Building2,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface CommitmentRow {
  actividad: string;
  responsable: string;
  fecha: string;
  evidencia: string;
}

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

function parseCommitmentsData(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        items: parsed as CommitmentRow[],
        presidentName: "",
        presidentId: "",
        secretaryName: "",
        secretaryId: "",
      };
    }
    if (parsed && typeof parsed === "object") {
      return {
        items: (Array.isArray(parsed.items) ? parsed.items : []) as CommitmentRow[],
        presidentName: parsed.presidentName || "",
        presidentId: parsed.presidentId || "",
        secretaryName: parsed.secretaryName || "",
        secretaryId: parsed.secretaryId || "",
      };
    }
  } catch (e) {}

  if (raw && raw.trim()) {
    return {
      items: [
        {
          actividad: raw,
          responsable: "Comité",
          fecha: "Pendiente",
          evidencia: "Informe / Registro",
        },
      ] as CommitmentRow[],
      presidentName: "",
      presidentId: "",
      secretaryName: "",
      secretaryId: "",
    };
  }

  return {
    items: [] as CommitmentRow[],
    presidentName: "",
    presidentId: "",
    secretaryName: "",
    secretaryId: "",
  };
}

export default function CommitteesPage() {
  const { activeCompany } = useTenant();
  const [records, setRecords] = useState<CommitteeItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedActa, setSelectedActa] = useState<CommitteeItem | null>(null);

  // Formulario
  const [committeeType, setCommitteeType] = useState<"COPASST" | "VIGIA" | "CONVIVENCIA">("COPASST");
  const [period, setPeriod] = useState("2024-2026");
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendees, setAttendees] = useState("");
  const [topicsDiscussed, setTopicsDiscussed] = useState("");

  // Tabla dinámica de Compromisos (Imagen 1)
  const [commitmentRows, setCommitmentRows] = useState<CommitmentRow[]>([
    { actividad: "", responsable: "", fecha: "", evidencia: "" },
  ]);

  // Firmas Presidente y Secretario (Imagen 1)
  const [presidentName, setPresidentName] = useState("");
  const [presidentId, setPresidentId] = useState("");
  const [secretaryName, setSecretaryName] = useState("");
  const [secretaryId, setSecretaryId] = useState("");

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

  const addCommitmentRow = () => {
    setCommitmentRows([
      ...commitmentRows,
      { actividad: "", responsable: "", fecha: "", evidencia: "" },
    ]);
  };

  const removeCommitmentRow = (index: number) => {
    if (commitmentRows.length > 1) {
      setCommitmentRows(commitmentRows.filter((_, i) => i !== index));
    } else {
      setCommitmentRows([{ actividad: "", responsable: "", fecha: "", evidencia: "" }]);
    }
  };

  const updateCommitmentRow = (index: number, field: keyof CommitmentRow, value: string) => {
    const updated = [...commitmentRows];
    updated[index][field] = value;
    setCommitmentRows(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setSubmitting(true);

    const filteredItems = commitmentRows.filter((r) => r.actividad.trim() !== "");
    const commitmentsPayload = JSON.stringify({
      presidentName,
      presidentId,
      secretaryName,
      secretaryId,
      items: filteredItems.length > 0 ? filteredItems : commitmentRows,
    });

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
          commitments: commitmentsPayload,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setAttendees("");
        setTopicsDiscussed("");
        setCommitmentRows([{ actividad: "", responsable: "", fecha: "", evidencia: "" }]);
        setPresidentName("");
        setPresidentId("");
        setSecretaryName("");
        setSecretaryId("");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = records.filter((r) => {
    if (filterType === "TODOS") return true;
    if (filterType === "COPASST" && (r.committeeType === "COPASST" || r.committeeType === "VIGIA")) return true;
    if (filterType === "CONVIVENCIA" && r.committeeType === "CONVIVENCIA") return true;
    return false;
  });

  const parsedActiveActa = selectedActa ? parseCommitmentsData(selectedActa.commitments) : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm print:hidden">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:hidden">
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
      <div className="flex items-center gap-2 bg-white border border-soft-200 p-3 rounded-2xl overflow-x-auto print:hidden">
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
      <div className="space-y-3 print:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white border border-soft-200 rounded-3xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-600" />
            <p className="font-bold text-sm text-carbon">No hay actas registradas</p>
            <p className="text-xs mt-1">Registra la primera reunión del comité.</p>
          </div>
        ) : (
          filtered.map((r) => {
            const parsed = parseCommitmentsData(r.commitments);
            return (
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

                  {parsed.items.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-purple-700 block">
                        Compromisos ({parsed.items.length}):
                      </span>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5 mt-0.5">
                        {parsed.items.slice(0, 3).map((item, idx) => (
                          <li key={idx}>
                            <strong>{item.actividad}</strong> ({item.responsable} • {item.fecha})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botón Descargar Acta PDF Oficial */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedActa(r)}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 transition shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Descargar Acta PDF</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL / VISTA OFICIAL DE IMPRESIÓN Y DESCARGA DE ACTA PDF */}
      {selectedActa && parsedActiveActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[92vh] border border-soft-200 print:border-none print:shadow-none print:max-w-none print:p-0 print:max-h-none">
            {/* Barra de Acciones del Modal (Oculta al imprimir) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-soft-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Vista Previa Oficial PDF
                </span>
                <span className="text-xs text-slate-500 font-medium">Formato Institucional MinTrabajo</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar como PDF</span>
                </button>
                <button
                  onClick={() => setSelectedActa(null)}
                  className="p-2 text-slate-400 hover:text-carbon rounded-xl hover:bg-soft-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENTO FORMAL: FORMATO OFICIAL DE ACTA SEGÚN MODELO SG-SST */}
            <div className="border border-slate-900 bg-white text-slate-900 font-sans text-xs print:border-slate-900 print:text-black">
              {/* 1. ENCABEZADO DE CONTROL DOCUMENTAL (Art. 2.2.4.6.12 Dec. 1072) */}
              <div className="grid grid-cols-4 border-b border-slate-900 text-center">
                <div className="p-3 border-r border-slate-900 flex flex-col justify-center items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 mb-1">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-black text-[11px] uppercase tracking-tight">
                    {activeCompany?.companyName || "EMPRESA CLIENTE"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">NIT: {activeCompany?.nit}</span>
                </div>

                <div className="col-span-2 p-3 border-r border-slate-900 flex flex-col justify-center items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                    SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO (SG-SST)
                  </span>
                  <span className="text-sm font-black uppercase text-slate-950 mt-1">
                    ACTA DE REUNIÓN ORDINARIA {selectedActa.committeeType}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Res. 2013/1986 • Res. 0312/2019 • Dec. 1072/2015
                  </span>
                </div>

                <div className="p-2.5 text-[10px] text-left flex flex-col justify-center space-y-1 bg-slate-50 font-mono">
                  <div><strong>CÓDIGO:</strong> FT-SST-018</div>
                  <div><strong>VERSIÓN:</strong> 01</div>
                  <div><strong>FECHA:</strong> 2026-01-15</div>
                  <div><strong>PÁGINA:</strong> 1 de 1</div>
                </div>
              </div>

              {/* 2. DATOS GENERALES DE LA SESIÓN */}
              <div className="p-3 bg-slate-100 border-b border-slate-900 font-bold text-[11px] uppercase tracking-wide">
                1. INFORMACIÓN GENERAL DE LA REUNIÓN
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-900 text-[11px]">
                <div className="p-2.5 border-r border-b sm:border-b-0 border-slate-900">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Acta Número</span>
                  <span className="font-black text-sm">Nº {selectedActa.meetingNumber}</span>
                </div>
                <div className="p-2.5 border-r border-b sm:border-b-0 border-slate-900">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Fecha de Sesión</span>
                  <span className="font-bold">{formatColDate(selectedActa.meetingDate)}</span>
                </div>
                <div className="p-2.5 border-r border-slate-900">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Periodo Vigencia</span>
                  <span className="font-bold">{selectedActa.period}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Tipo de Sesión</span>
                  <span className="font-bold text-purple-700">Ordinaria Mensual</span>
                </div>
              </div>

              {/* 3. MIEMBROS ASISTENTES Y QUÓRUM */}
              <div className="p-3 bg-slate-100 border-b border-slate-900 font-bold text-[11px] uppercase tracking-wide">
                2. ASISTENCIA Y VERIFICACIÓN DE QUÓRUM
              </div>
              <div className="p-3 border-b border-slate-900 text-xs leading-relaxed">
                <p className="font-semibold text-slate-800">
                  En la fecha y hora indicadas se reunieron los siguientes integrantes para dar inicio formal a la sesión ordinaria:
                </p>
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-300 font-medium">
                  {selectedActa.attendees}
                </div>
                <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" />
                  Se verifica quórum deliberatorio y decisorio de acuerdo con la Resolución 2013 de 1986.
                </div>
              </div>

              {/* 4. ORDEN DEL DÍA & TEMAS TRATADOS */}
              <div className="p-3 bg-slate-100 border-b border-slate-900 font-bold text-[11px] uppercase tracking-wide">
                3. ORDEN DEL DÍA Y TEMAS TRATADOS
              </div>
              <div className="p-4 border-b border-slate-900 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedActa.topicsDiscussed}
              </div>

              {/* 5. TABLA OFICIAL: COMPROMISOS DE LA REUNIÓN (EXACTAMENTE COMO IMAGEN 1) */}
              <div className="p-3 bg-slate-100 border-b border-slate-900 font-black text-[11px] uppercase tracking-wider">
                COMPROMISOS DE LA REUNION:
              </div>
              <table className="w-full border-collapse border-b border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-900 text-center font-bold text-[10px] uppercase">
                    <th className="p-2 border-r border-slate-900 w-2/5">ACTIVIDAD</th>
                    <th className="p-2 border-r border-slate-900 w-1/5">RESPONSABLE</th>
                    <th className="p-2 border-r border-slate-900 w-1/5">FECHA</th>
                    <th className="p-2 w-1/5">EVIDENCIA</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedActiveActa.items.length > 0 ? (
                    parsedActiveActa.items.map((c, idx) => (
                      <tr key={idx} className="border-b border-slate-300">
                        <td className="p-2.5 border-r border-slate-900 font-medium">{c.actividad}</td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-medium">{c.responsable}</td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-mono">{c.fecha}</td>
                        <td className="p-2.5 font-medium">{c.evidencia}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                        Sin compromisos registrados para esta reunión.
                      </td>
                    </tr>
                  )}
                  {/* Filas vacías adicionales de presentación si hay pocas */}
                  {parsedActiveActa.items.length < 3 &&
                    Array.from({ length: 3 - parsedActiveActa.items.length }).map((_, i) => (
                      <tr key={`empty-${i}`} className="border-b border-slate-200 h-8">
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td className="border-r border-slate-900"></td>
                        <td></td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* 6. CONSTANCIA Y REGISTRO DE FIRMAS (EXACTAMENTE COMO IMAGEN 1) */}
              <div className="p-10 pt-16 grid grid-cols-2 gap-12 text-xs">
                {/* Firma Presidente */}
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-2 w-72 mx-auto">
                    <div className="font-bold text-xs uppercase">Firma presidente</div>
                    <div className="text-slate-700 mt-1">
                      Cedula: {parsedActiveActa.presidentId || "____________________"}
                    </div>
                    {parsedActiveActa.presidentName && (
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {parsedActiveActa.presidentName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Firma Secretario */}
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-2 w-72 mx-auto">
                    <div className="font-bold text-xs uppercase">Firma secretario</div>
                    <div className="text-slate-700 mt-1">
                      Cedula: {parsedActiveActa.secretaryId || "____________________"}
                    </div>
                    {parsedActiveActa.secretaryName && (
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {parsedActiveActa.secretaryName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pie de Página Legal */}
              <div className="p-2 border-t border-slate-900 bg-slate-50 text-[9px] text-center text-slate-500">
                Documento oficial del SG-SST. Sujeto a retención legal de 20 años según el Artículo 2.2.4.6.13 del Decreto 1072 de 2015.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Nueva Acta (Con tabla dinámica de compromisos y firmas de Imagen 1) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto print:hidden">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
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

            <form onSubmit={handleCreate} className="mt-5 space-y-5">
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
                  placeholder="Ej: Carolina Betancourt y clara salazar"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-carbon mb-1">Temas Tratados *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Revisión del plan de trabajo, inspección a puestos de trabajo, campaña de salud mental..."
                  value={topicsDiscussed}
                  onChange={(e) => setTopicsDiscussed(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* SECCIÓN DINÁMICA: COMPROMISOS DE LA REUNIÓN (IMAGEN 1) */}
              <div className="p-4 bg-soft-50 border border-soft-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-carbon uppercase tracking-wider">
                      Compromisos de la Reunión (Actividad, Responsable, Fecha, Evidencia)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Ingresa cada una de las tareas pactadas durante la sesión
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCommitmentRow}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Agregar Fila
                  </button>
                </div>

                <div className="space-y-2">
                  {commitmentRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-soft-200 rounded-xl space-y-2 relative shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          Compromiso #{idx + 1}
                        </span>
                        {commitmentRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCommitmentRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Actividad *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Hacer baterías del riesgo psicosocial"
                            value={row.actividad}
                            onChange={(e) => updateCommitmentRow(idx, "actividad", e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Responsable</label>
                          <input
                            type="text"
                            placeholder="Ej: Carolina Betancourt"
                            value={row.responsable}
                            onChange={(e) => updateCommitmentRow(idx, "responsable", e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Fecha Límite</label>
                          <input
                            type="date"
                            value={row.fecha}
                            onChange={(e) => updateCommitmentRow(idx, "fecha", e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Evidencia de Cumplimiento</label>
                          <input
                            type="text"
                            placeholder="Ej: Informe / Fotos / Registro"
                            value={row.evidencia}
                            onChange={(e) => updateCommitmentRow(idx, "evidencia", e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN FIRMAS: PRESIDENTE Y SECRETARIO (IMAGEN 1) */}
              <div className="p-4 bg-soft-50 border border-soft-200 rounded-2xl space-y-3">
                <label className="block text-xs font-black text-carbon uppercase tracking-wider">
                  Datos de Firmas (Presidente y Secretario)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 bg-white border border-soft-200 rounded-xl">
                    <span className="text-[11px] font-bold text-purple-700 block">Firma Presidente</span>
                    <input
                      type="text"
                      placeholder="Nombre del presidente"
                      value={presidentName}
                      onChange={(e) => setPresidentName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Cédula del presidente"
                      value={presidentId}
                      onChange={(e) => setPresidentId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>

                  <div className="space-y-2 p-3 bg-white border border-soft-200 rounded-xl">
                    <span className="text-[11px] font-bold text-purple-700 block">Firma Secretario</span>
                    <input
                      type="text"
                      placeholder="Nombre del secretario"
                      value={secretaryName}
                      onChange={(e) => setSecretaryName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Cédula del secretario"
                      value={secretaryId}
                      onChange={(e) => setSecretaryId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>
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
