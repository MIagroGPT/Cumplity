"use client";

import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import {
  Webhook,
  Sparkles,
  Server,
  Cpu,
  FileCode,
  Copy,
  Check,
  Send,
} from "lucide-react";

export default function N8nIntegrationPage() {
  const { activeCompany } = useTenant();
  const [copied, setCopied] = useState(false);
  const [testText, setTestText] = useState(
    "Operario en prensa troqueladora sin resguardo de seguridad ni pulsador bimanual, riesgo inminente de atrapamiento en manos."
  );
  const [testZone, setTestZone] = useState("Línea 2 - Troquelado");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/gtc45-voice`
      : "http://localhost:3000/api/webhooks/gtc45-voice";

  const copyCurl = () => {
    const curl = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "companyId": "${activeCompany?.id || "UUID_EMPRESA"}",
    "audioTranscript": "${testText}",
    "zoneArea": "${testZone}"
  }'`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWebhook = async () => {
    if (!activeCompany) return;
    setTesting(true);
    setTestResponse(null);

    try {
      const res = await fetch("/api/webhooks/gtc45-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: activeCompany.id,
          audioTranscript: testText,
          zoneArea: testZone,
        }),
      });
      const data = await res.json();
      setTestResponse(data);
    } catch (e: any) {
      setTestResponse({ error: e.message || "Error al llamar webhook" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
          <Webhook className="w-4 h-4" />
          Automatización Externa & Despliegue en Producción (Fase 2)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight">
          Integración con n8n, Whisper AI y EasyPanel VPS
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed font-medium">
          Cumplity AI está diseñado con arquitectura modular lista para ser orquestada en un VPS de Hostinger vía EasyPanel. Las notas de voz de inspección en campo son procesadas por Whisper AI en n8n y enviadas automáticamente a este webhook para poblar la matriz GTC 45.
        </p>
      </div>

      {/* Grid de Arquitectura: Fase 1 vs Fase 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-soft-200 p-6 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase">
            <Cpu className="w-4 h-4" /> FASE 1: Entorno Local (Activo)
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            • App Next.js 14 (App Router) corriendo en <code>localhost:3000</code>.
            <br />• Base de datos SQLite local espejo de Postgres (Prisma ORM).
            <br />• Webhooks simulados en tiempo real con motor de reglas GTC 45.
            <br />• Modales con soporte para Web Speech API y presets de audio.
          </p>
        </div>

        <div className="bg-white border border-soft-200 p-6 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-mint-600 font-extrabold text-xs uppercase">
            <Server className="w-4 h-4" /> FASE 2: VPS Hostinger & EasyPanel
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            • Contenedor Web App conectado al repositorio GitHub (CI/CD automático).
            <br />• Contenedor n8n para flujos de WhatsApp / Telegram $\rightarrow$ Whisper AI.
            <br />• Instancia nativa PostgreSQL con el script <code>database_schema.sql</code>.
            <br />• Bóveda de archivos conectada a Supabase Storage o AWS S3.
          </p>
        </div>
      </div>

      {/* Probador en Vivo del Webhook de Voz n8n */}
      <div className="bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-soft-200">
          <div>
            <h2 className="text-base font-black text-carbon flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Probador Interactivo del Webhook de n8n
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Endpoint: <code className="text-purple-600 font-mono text-[11px] font-bold">{webhookUrl}</code>
            </p>
          </div>

          <button
            onClick={copyCurl}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-soft-100 hover:bg-soft-200 text-xs font-bold text-carbon border border-soft-200 self-start sm:self-auto transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Copiado!" : "Copiar cURL"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-carbon mb-1">
                Transcripción simulada de Whisper AI (Audio a Texto)
              </label>
              <textarea
                rows={3}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbon mb-1">
                Zona / Frente de Inspección
              </label>
              <input
                type="text"
                value={testZone}
                onChange={(e) => setTestZone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testing || !testText.trim()}
                className="w-full mt-3 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testing ? (
                  "Inyectando a GTC 45..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Enviar a Webhook
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Respuesta del Webhook */}
          {testResponse && (
            <div className="mt-4 p-4 rounded-2xl bg-soft-50 border border-soft-200 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold text-purple-600 mb-2 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> Respuesta JSON del Endpoint:
              </div>
              <pre className="text-carbon overflow-x-auto whitespace-pre-wrap text-[11px] font-bold">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
