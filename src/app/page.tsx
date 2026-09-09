"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { getComplianceRating, formatColDate } from "@/lib/utils";
import { RecordVoiceModal } from "@/components/modals/RecordVoiceModal";
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  FolderLock,
  Flame,
  Users,
  Mic,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const { activeCompany, isCreateModalOpen, setIsCreateModalOpen } = useTenant();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    standards: any[];
    metrics: any;
    accidents: any[];
    findings: any[];
    documents: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    if (!activeCompany) return;
    setLoading(true);
    try {
      const [stdRes, accRes, gtcRes, vltRes] = await Promise.all([
        fetch(`/api/standards?companyId=${activeCompany.id}`),
        fetch(`/api/accidents?companyId=${activeCompany.id}`),
        fetch(`/api/gtc45?companyId=${activeCompany.id}`),
        fetch(`/api/vault?companyId=${activeCompany.id}`),
      ]);

      const [stdData, accData, gtcData, vltData] = await Promise.all([
        stdRes.json(),
        accRes.json(),
        gtcRes.json(),
        vltRes.json(),
      ]);

      setDashboardData({
        standards: stdData.standards || [],
        metrics: stdData.metrics || {},
        accidents: accData.investigations || [],
        findings: gtcData.findings || [],
        documents: vltData.documents || [],
      });
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeCompany?.id]);

  if (!activeCompany) {
    return (
      <div className="text-center py-20 bg-white border border-soft-200 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
        <Building2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-xl font-black text-carbon">No hay ninguna empresa seleccionada</h2>
        <p className="text-xs text-slate-500 mt-2">
          Crea tu primera empresa cliente para comenzar a gestionar el SG-SST bajo la normativa colombiana.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-6 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition"
        >
          + Registrar Primera Empresa
        </button>
      </div>
    );
  }

  const compliancePercent = dashboardData?.metrics?.compliancePercent || 0;
  const rating = getComplianceRating(compliancePercent);

  // Desglose del ciclo PHVA
  const phases = ["PLANEAR", "HACER", "VERIFICAR", "ACTUAR"];
  const phaseStats = phases.map((phase) => {
    const list = dashboardData?.standards.filter((s) => s.cyclePhase === phase) || [];
    const total = list.length;
    const complies = list.filter((s) => s.status === "CUMPLE").length;
    const pct = total > 0 ? Math.round((complies / total) * 100) : 0;
    return { phase, total, complies, pct };
  });

  // Alerta de accidente más urgente (15 días hábiles Res. 1401)
  const urgentAccident = dashboardData?.accidents?.find(
    (a) => a.status === "PENDIENTE"
  );

  return (
    <div className="space-y-6">
      {/* Cabecera del Tenant con fondo blanco luminoso */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-soft-200 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
              Tenant Activo
            </span>
            <span className="px-2.5 py-1 rounded-full bg-soft-100 text-carbon text-xs font-mono font-bold border border-soft-200">
              NIT: {activeCompany.nit}
            </span>
            <span className="px-3 py-1 rounded-full bg-mint-50 text-mint-600 text-xs font-extrabold border border-mint-200">
              ARL Riesgo {activeCompany.arlRiskLevel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-3">
            {activeCompany.companyName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2 sm:gap-3 font-medium">
            <span>{activeCompany.economicSector || "Actividad Económica General"}</span>
            <span>•</span>
            <span className="font-bold text-carbon">
              {activeCompany.workerCount} Trabajadores vinculados
            </span>
            <span>•</span>
            <span className="text-purple-600 font-bold">
              Marco Legal: {activeCompany.requiredStandards} Estándares (Res. 0312/2019)
            </span>
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition transform hover:-translate-y-0.5"
          >
            <Mic className="w-4 h-4 text-purple-600" />
            <span>Inspección por Voz (GTC 45)</span>
          </button>

          <Link
            href="/standards"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition transform hover:-translate-y-0.5"
          >
            <FileCheck className="w-4 h-4" />
            <span>Evaluar Estándares</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Urgencia Legal: Investigación de Accidente (Res. 1401) */}
      {urgentAccident && (
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
          urgentAccident.isCritical || urgentAccident.isOverdue
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase tracking-wider text-rose-700">
                  Alerta Legal MinTrabajo (Res. 1401 de 2007)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-bold">
                  {urgentAccident.severity}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 font-medium line-clamp-1">
                {urgentAccident.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-rose-600/80 font-medium">Plazo legal improrrogable:</div>
              <div className="text-sm font-black text-rose-700 font-mono">
                {urgentAccident.remainingBusinessDays > 0
                  ? `Quedan ${urgentAccident.remainingBusinessDays} días hábiles`
                  : "¡TÉRMINO LEGAL VENCIDO!"}
              </div>
            </div>
            <Link
              href="/accidents"
              className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
            >
              Gestionar
            </Link>
          </div>
        </div>
      )}

      {/* Grid de Semáforo de Cumplimiento & Ciclo PHVA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Semáforo Legal Res. 0312 */}
        <div className="bg-white border border-soft-200 p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Autoevaluación Res. 0312
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${rating.badgeClass}`}>
                {rating.level}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-black text-carbon tracking-tight">
                {compliancePercent}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                de {dashboardData?.metrics?.counts?.total || activeCompany.requiredStandards} estándares
              </span>
            </div>

            <div className="w-full bg-soft-200 h-3 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full ${rating.barColor} transition-all duration-500`}
                style={{ width: `${compliancePercent}%` }}
              />
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-soft-50 border border-soft-200">
              <div className="text-[11px] font-extrabold text-carbon">
                Obligación Legal MinTrabajo:
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                {rating.recommendation}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-soft-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {dashboardData?.metrics?.counts?.cumple || 0} Cumplen • {dashboardData?.metrics?.counts?.noCumple || 0} No cumplen
            </span>
            <Link
              href="/standards"
              className="text-purple-600 hover:text-purple-700 font-extrabold flex items-center gap-1"
            >
              Ver matriz <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ciclo PHVA (Planear, Hacer, Verificar, Actuar) */}
        <div className="lg:col-span-2 bg-white border border-soft-200 p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-carbon flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Ciclo PHVA del SG-SST (Decreto 1072 de 2015)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Progreso por etapas de mejora continua según la legislación colombiana
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {phaseStats.map((item) => (
                <div
                  key={item.phase}
                  className="p-4 rounded-2xl bg-soft-50 border border-soft-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider text-carbon">
                      {item.phase}
                    </span>
                    <span className="text-xs font-mono font-black text-purple-600">
                      {item.complies}/{item.total} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-soft-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {item.phase === "PLANEAR" && "Política, recursos, objetivos y matriz legal"}
                    {item.phase === "HACER" && "Gestión de peligros, salud ocupacional y brigadas"}
                    {item.phase === "VERIFICAR" && "Investigación de accidentes e indicadores"}
                    {item.phase === "ACTUAR" && "Planes de mejora y acciones correctivas"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-soft-200 flex items-center justify-between text-xs text-slate-500">
            <span>Marco: Libro 2, Parte 2, Título 4, Capítulo 6 (Decreto 1072)</span>
            <span className="text-purple-600 font-bold">100% Trazabilidad Legal</span>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Clave */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/workers"
          className="p-5 rounded-3xl bg-white border border-soft-200 hover:border-purple-300 hover:shadow-md transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Trabajadores</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-carbon mt-2">
            {activeCompany.workerCount}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Res. 1843/2025 Salud</p>
        </Link>

        <Link
          href="/gtc45"
          className="p-5 rounded-3xl bg-white border border-soft-200 hover:border-purple-300 hover:shadow-md transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Matriz GTC 45</span>
            <div className="w-8 h-8 rounded-xl bg-mint-50 flex items-center justify-center text-mint-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-carbon mt-2">
            {dashboardData?.findings?.length || 0}
          </div>
          <p className="text-[10px] text-purple-600 font-bold mt-1">
            {dashboardData?.findings?.filter((f) => f.status === "OPEN").length || 0} Hallazgos abiertos
          </p>
        </Link>

        <Link
          href="/vault"
          className="p-5 rounded-3xl bg-white border border-soft-200 hover:border-purple-300 hover:shadow-md transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Bóveda 20 Años</span>
            <div className="w-8 h-8 rounded-xl bg-soft-100 flex items-center justify-center text-carbon group-hover:scale-110 transition-transform">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-carbon mt-2">
            {dashboardData?.documents?.length || 0}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Art. 2.2.4.6.13 Dec. 1072</p>
        </Link>

        <Link
          href="/accidents"
          className="p-5 rounded-3xl bg-white border border-soft-200 hover:border-purple-300 hover:shadow-md transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Investigación AT</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-carbon mt-2">
            {dashboardData?.accidents?.length || 0}
          </div>
          <p className="text-[10px] text-rose-600 font-bold mt-1">Término 15 días hábiles</p>
        </Link>
      </div>

      {/* Listas Rápidas: Hallazgos GTC 45 y Bóveda Documental */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hallazgos GTC 45 Recientes con Transcripción de Audio */}
        <div className="bg-white border border-soft-200 p-6 sm:p-7 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-soft-200">
            <div>
              <h3 className="text-sm font-black text-carbon flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                Inspecciones & Peligros GTC 45
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Alimentado por voz (Whisper AI / n8n) y valorado según GTC 45
              </p>
            </div>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-bold border border-purple-200"
            >
              + Dictar Voz
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {dashboardData?.findings?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-medium">
                No hay hallazgos registrados aún. Dicta uno por nota de voz.
              </p>
            ) : (
              dashboardData?.findings.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-soft-50 border border-soft-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-carbon">
                      {f.zoneArea || "Área General"}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        f.status === "OPEN"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : f.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-mint-50 text-mint-600 border border-mint-200"
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug font-medium">
                    {f.dangerDescription}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="text-purple-600 font-bold">
                      Tipo: {f.riskType} • NR: {f.riskLevel}
                    </span>
                    <span className="font-mono">{formatColDate(f.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bóveda Digital con Retención de 20 Años */}
        <div className="bg-white border border-soft-200 p-6 sm:p-7 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-soft-200">
            <div>
              <h3 className="text-sm font-black text-carbon flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-purple-600" />
                Bóveda Digital Legal (Retención 20 Años)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Custodia obligatoria (Art. 2.2.4.6.13 Decreto 1072)
              </p>
            </div>
            <Link
              href="/vault"
              className="text-xs px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-bold border border-purple-200"
            >
              Ver Bóveda
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {dashboardData?.documents?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-medium">
                No hay documentos archivados aún en la bóveda de 20 años.
              </p>
            ) : (
              dashboardData?.documents.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-soft-50 border border-soft-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-carbon truncate">
                      {d.fileName}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Tipo: <span className="text-carbon font-bold">{d.documentType}</span>
                      {d.worker && ` • ${d.worker.fullName}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-soft-300 text-purple-700 shadow-2xs">
                      Expira: {new Date(d.expiresAt).getFullYear()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Registro por Voz */}
      <RecordVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
          setIsVoiceModalOpen(false);
        }}
      />
    </div>
  );
}
