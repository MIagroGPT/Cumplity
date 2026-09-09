"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { formatColDate } from "@/lib/utils";
import { RecordVoiceModal } from "@/components/modals/RecordVoiceModal";
import {
  AlertTriangle,
  Mic,
  Plus,
  Volume2,
  ShieldAlert,
  Search,
} from "lucide-react";

interface GtcFinding {
  id: string;
  zoneArea: string;
  riskType: string;
  dangerDescription: string;
  deficiencyLevel: number;
  exposureLevel: number;
  riskLevel: number;
  controlMeasure: string;
  audioTranscript?: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
}

export default function Gtc45Page() {
  const { activeCompany } = useTenant();
  const [findings, setFindings] = useState<GtcFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario manual
  const [zoneArea, setZoneArea] = useState("");
  const [riskType, setRiskType] = useState("Biomecánico");
  const [dangerDescription, setDangerDescription] = useState("");
  const [deficiencyLevel, setDeficiencyLevel] = useState<number>(6);
  const [exposureLevel, setExposureLevel] = useState<number>(3);
  const [controlMeasure, setControlMeasure] = useState("");

  const fetchFindings = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gtc45?companyId=${activeCompany.id}`);
      const data = await res.json();
      setFindings(data.findings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [activeCompany?.id]);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;

    try {
      const res = await fetch("/api/gtc45", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          zoneArea,
          riskType,
          dangerDescription,
          deficiencyLevel,
          exposureLevel,
          controlMeasure,
        }),
      });

      if (res.ok) {
        setIsManualModalOpen(false);
        setDangerDescription("");
        setZoneArea("");
        setControlMeasure("");
        fetchFindings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, status: "OPEN" | "IN_PROGRESS" | "CLOSED") => {
    try {
      const res = await fetch("/api/gtc45", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchFindings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = findings.filter(
    (f) =>
      f.dangerDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.riskType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.zoneArea?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeCompany) {
    return (
      <div className="text-center py-20 bg-white border border-soft-200 rounded-3xl p-8 max-w-lg mx-auto text-slate-500 shadow-sm">
        Selecciona una empresa para gestionar su Matriz GTC 45.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Metodología Legal GTC 45 (Icontec / MinTrabajo)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Matriz de Identificación de Peligros y Riesgos
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Empresa: <strong className="text-carbon">{activeCompany.companyName}</strong> • {findings.length} Hallazgos registrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition transform hover:-translate-y-0.5"
          >
            <Mic className="w-4 h-4" />
            <span>Dictar por Voz (IA / n8n)</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-soft-100 hover:bg-soft-200 text-carbon text-xs font-bold border border-soft-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Registro Manual</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por zona, tipo de riesgo (Físico, Químico, Biomecánico, Alturas) o descripción..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-soft-200 text-xs text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Tabla de Hallazgos GTC 45 */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-soft-200 rounded-3xl p-8 text-slate-500 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-bold text-carbon">No se encontraron peligros registrados</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Usa el botón de nota de voz o agrega un registro manual según la metodología GTC 45.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            let riskCategory = "I - Crítico (No Aceptable)";
            let riskBadge = "bg-rose-50 text-rose-700 border-rose-200";

            if (item.riskLevel < 10) {
              riskCategory = "III / IV - Aceptable";
              riskBadge = "bg-mint-50 text-mint-600 border-mint-200";
            } else if (item.riskLevel < 20) {
              riskCategory = "II - Mejorar si es posible";
              riskBadge = "bg-amber-50 text-amber-800 border-amber-200";
            }

            return (
              <div
                key={item.id}
                className="bg-white border border-soft-200 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4 hover:border-purple-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {item.riskType}
                    </span>
                    <span className="text-xs text-slate-600 font-bold">
                      Zona: {item.zoneArea}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${riskBadge}`}>
                      NR: {item.riskLevel} • {riskCategory}
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleUpdateStatus(item.id, e.target.value as any)
                      }
                      className="bg-soft-100 text-xs font-bold text-carbon border border-soft-200 rounded-xl px-2.5 py-1 cursor-pointer focus:outline-none"
                    >
                      <option value="OPEN">ABIERTO</option>
                      <option value="IN_PROGRESS">EN PROCESO</option>
                      <option value="CLOSED">CERRADO</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400">Descripción del Peligro:</div>
                  <p className="text-sm font-medium text-carbon leading-relaxed">
                    {item.dangerDescription}
                  </p>
                </div>

                {/* Transcripción de Audio si existe */}
                {item.audioTranscript && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900 flex items-start gap-2.5">
                    <Volume2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[10px] uppercase text-purple-600 block">
                        Transcripción de Voz (Whisper AI / n8n):
                      </span>
                      <p className="text-purple-800 italic mt-0.5 font-medium">{item.audioTranscript}</p>
                    </div>
                  </div>
                )}

                {/* Medidas de Control */}
                <div className="p-4 rounded-2xl bg-soft-50 border border-soft-200 text-xs">
                  <span className="text-slate-500 font-bold block text-[11px] mb-1">
                    Medida de Intervención y Control Sugerida:
                  </span>
                  <span className="text-purple-700 font-bold">{item.controlMeasure}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-soft-200 font-medium">
                  <span>
                    ND (Deficiencia): {item.deficiencyLevel} • NE (Exposición): {item.exposureLevel}
                  </span>
                  <span>Registrado el {formatColDate(item.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-soft-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-carbon">Registrar Peligro (GTC 45)</h3>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="block text-carbon font-bold mb-1">Área o Puesto de Trabajo *</label>
                <input
                  type="text"
                  required
                  value={zoneArea}
                  onChange={(e) => setZoneArea(e.target.value)}
                  placeholder="Ej: Planta de Producción, Bodega..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Clasificación del Peligro *</label>
                <select
                  value={riskType}
                  onChange={(e) => setRiskType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="Biomecánico">Biomecánico (Posturas, Cargas, Movimientos repetitivos)</option>
                  <option value="Condiciones de Seguridad (Alturas)">Condiciones de Seguridad (Alturas / Caídas)</option>
                  <option value="Condiciones de Seguridad (Mecánico)">Condiciones de Seguridad (Mecánico / Atrapamiento)</option>
                  <option value="Eléctrico">Eléctrico (Alta / Baja tensión)</option>
                  <option value="Químico">Químico (Gases, Vapores, Polvos, Solventes)</option>
                  <option value="Físico">Físico (Ruido, Iluminación, Temperatura, Vibración)</option>
                  <option value="Biológico">Biológico (Virus, Bacterias, Hongos)</option>
                  <option value="Psicosocial">Psicosocial (Carga laboral, Estrés)</option>
                  <option value="Fenómenos Naturales">Fenómenos Naturales (Sismos, Inundación)</option>
                </select>
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Descripción del Peligro *</label>
                <textarea
                  rows={3}
                  required
                  value={dangerDescription}
                  onChange={(e) => setDangerDescription(e.target.value)}
                  placeholder="Describe la condición o acto inseguro detectado..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-carbon font-bold mb-1">Nivel de Deficiencia (ND)</label>
                  <select
                    value={deficiencyLevel}
                    onChange={(e) => setDeficiencyLevel(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-soft-300 text-carbon"
                  >
                    <option value={2}>2 - Medio (Peligro menor)</option>
                    <option value={6}>6 - Alto (Peligro significativo detectado)</option>
                    <option value={10}>10 - Muy Alto (Peligros graves sin control)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-carbon font-bold mb-1">Nivel de Exposición (NE)</label>
                  <select
                    value={exposureLevel}
                    onChange={(e) => setExposureLevel(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-soft-300 text-carbon"
                  >
                    <option value={1}>1 - Esporádica</option>
                    <option value={2}>2 - Ocasional</option>
                    <option value={3}>3 - Frecuente</option>
                    <option value={4}>4 - Continua</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-carbon font-bold mb-1">Medida de Control / Plan de Acción</label>
                <input
                  type="text"
                  value={controlMeasure}
                  onChange={(e) => setControlMeasure(e.target.value)}
                  placeholder="Ej: Instalación de guardas, capacitación, dotación de EPP..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-soft-300 text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-soft-100 text-slate-600 hover:bg-soft-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/25"
                >
                  Guardar en Matriz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Voz */}
      <RecordVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={() => {
          fetchFindings();
          setIsVoiceModalOpen(false);
        }}
      />
    </div>
  );
}
