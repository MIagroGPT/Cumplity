"use client";

import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { Mic, MicOff, X, Sparkles, Volume2, CheckCircle2 } from "lucide-react";

const PRESET_AUDIOS = [
  {
    label: "Peligro en Alturas (Obra)",
    text: "Reporte de inspección en torre 3: operarios en piso 6 desarmando formaleta sin arnés de seguridad anclado a línea de vida y borde desprotegido.",
    zone: "Torre 3 - Frente de Estructura",
  },
  {
    label: "Riesgo Químico (Bodega)",
    text: "En el área de almacenamiento químico hay derrame de solvente industrial sin kit de absorción y los operarios no tienen respirador con cartucho adecuado.",
    zone: "Bodega de Químicos - Zona de Descargue",
  },
  {
    label: "Riesgo Biomecánico (Logística)",
    text: "En el muelle de carga los auxiliares están levantando cajas de 30 kilos de forma manual y repetitiva sin pausas activas ni faja lumbar.",
    zone: "Muelle de Carga #2",
  },
  {
    label: "Riesgo Eléctrico (Taller)",
    text: "Tablero eléctrico principal con cables energizados expuestos y sin señalización RETIE de peligro alta tensión.",
    zone: "Taller Central de Mantenimiento",
  },
];

export function RecordVoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { activeCompany } = useTenant();
  const [transcript, setTranscript] = useState("");
  const [zoneArea, setZoneArea] = useState("Área Operativa");
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<any>(null);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "El reconocimiento de voz nativo del navegador no está disponible en este entorno. Puedes usar los presets rápidos o escribir tu nota."
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-CO";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsRecording(true);

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript((prev) => (prev ? `${prev} ${text}` : text));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() || !activeCompany) return;

    setProcessing(true);
    setResultMsg(null);

    try {
      const res = await fetch("/api/webhooks/gtc45-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          audioTranscript: transcript,
          zoneArea: zoneArea || "Inspección SST",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar audio");
      }

      setResultMsg(data.finding);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || "Error al procesar");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-soft-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-soft-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-carbon flex items-center gap-2">
                Inspección por Voz & Asistente IA (GTC 45)
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200">
                  n8n + Whisper
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Empresa: <strong className="text-carbon">{activeCompany?.companyName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-carbon p-2 rounded-xl hover:bg-soft-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Grabación y Audio Presets */}
        <div className="mt-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-soft-50 border border-soft-200">
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
              isRecording
                ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/40"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30"
            }`}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
          <span className="text-xs font-bold text-carbon mt-3">
            {isRecording ? "Escuchando... Haz clic para detener" : "Haz clic para dictar nota de voz"}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            O selecciona una nota de audio típica de inspección en campo:
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 w-full">
            {PRESET_AUDIOS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTranscript(item.text);
                  setZoneArea(item.zone);
                }}
                className="text-left px-3 py-2 rounded-xl bg-white border border-soft-200 hover:border-purple-300 text-[11px] text-carbon font-semibold transition flex items-center gap-2 shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-carbon mb-1">
              Área o Zona de la Inspección
            </label>
            <input
              type="text"
              value={zoneArea}
              onChange={(e) => setZoneArea(e.target.value)}
              placeholder="Ej: Planta de Producción, Almacén..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-carbon mb-1">
              Transcripción de Voz / Descripción del Peligro
            </label>
            <textarea
              rows={3}
              required
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Escribe o dicta el hallazgo de peligro detectado en campo..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          {resultMsg && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-purple-700 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>¡Hallazgo procesado e insertado en la Matriz GTC 45!</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1 font-medium">
                <div>
                  <span className="font-bold text-carbon">Clasificación:</span> {resultMsg.riskType}
                </div>
                <div>
                  <span className="font-bold text-carbon">Nivel de Riesgo (NR):</span> {resultMsg.riskLevel}
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-carbon">Control Sugerido:</span> {resultMsg.controlMeasure}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-soft-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-soft-200 text-xs font-bold text-slate-600 hover:bg-soft-100"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={processing || !transcript.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                "Procesando con IA..."
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Procesar e Insertar en GTC 45
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
