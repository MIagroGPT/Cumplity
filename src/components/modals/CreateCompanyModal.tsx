"use client";

import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { calculateRequiredStandards } from "@/lib/constants/standards-0312";
import { X, Building2, ShieldCheck, Users, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

export function CreateCompanyModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, refreshCompanies, setActiveCompanyId } = useTenant();

  const [companyName, setCompanyName] = useState("");
  const [nit, setNit] = useState("");
  const [arlRiskLevel, setArlRiskLevel] = useState<number>(2);
  const [workerCount, setWorkerCount] = useState<number>(8);
  const [economicSector, setEconomicSector] = useState("Servicios y Comercio");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCreateModalOpen) return null;

  // Cálculo en tiempo real según Resolución 0312 de 2019
  const requiredStandards = calculateRequiredStandards(workerCount, arlRiskLevel);

  let legalJustification = "";
  if (arlRiskLevel >= 4) {
    legalJustification = `Empresa con Nivel de Riesgo ARL ${arlRiskLevel} (Alto/Máximo). Por ley, aplica automáticamente el grupo completo de 60 Estándares Mínimos sin importar el número de trabajadores.`;
  } else if (workerCount <= 10) {
    legalJustification = `Microempresa con ${workerCount} trabajadores y Riesgo ARL ${arlRiskLevel} (I, II o III). Aplica Grupo 1: 7 Estándares Mínimos simplificados.`;
  } else if (workerCount <= 50) {
    legalJustification = `Pequeña/Mediana empresa con ${workerCount} trabajadores y Riesgo ARL ${arlRiskLevel} (I, II o III). Aplica Grupo 2: 21 Estándares Mínimos intermedios.`;
  } else {
    legalJustification = `Empresa con más de 50 trabajadores (${workerCount}). Aplica Grupo 3: 60 Estándares Mínimos completos.`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          nit,
          arlRiskLevel,
          workerCount,
          economicSector,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear la empresa");
      }

      await refreshCompanies();
      if (data.company?.id) {
        setActiveCompanyId(data.company.id);
      }
      setIsCreateModalOpen(false);

      // Limpiar formulario
      setCompanyName("");
      setNit("");
      setWorkerCount(8);
      setArlRiskLevel(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar la empresa");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-soft-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-soft-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-carbon">
                Registrar Nueva Empresa Cliente
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Multi-Tenant: Configuración y cálculo legal de estándares (Res. 0312/2019)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="text-slate-400 hover:text-carbon p-2 rounded-xl hover:bg-soft-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-carbon mb-1">
              Razón Social o Nombre de la Empresa *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Distribuciones Andinas del Norte S.A.S."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-carbon mb-1">
                NIT (con Dígito de Verificación) *
              </label>
              <input
                type="text"
                required
                placeholder="900.123.456-7"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbon mb-1">
                Sector Económico
              </label>
              <input
                type="text"
                placeholder="Manufactura, Transporte, etc."
                value={economicSector}
                onChange={(e) => setEconomicSector(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-carbon mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Número de Trabajadores *
              </label>
              <input
                type="number"
                min={1}
                max={50000}
                required
                value={workerCount}
                onChange={(e) => setWorkerCount(Math.max(1, parseInt(e.target.value || "1", 10)))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbon mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Nivel de Riesgo ARL (Clase 1 a 5) *
              </label>
              <select
                value={arlRiskLevel}
                onChange={(e) => setArlRiskLevel(parseInt(e.target.value, 10))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-soft-300 bg-white text-carbon focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value={1}>Clase I - Riesgo Mínimo (Comercio, Finanzas, Oficinas)</option>
                <option value={2}>Clase II - Riesgo Bajo (Textil, Calzado, Almacén)</option>
                <option value={3}>Clase III - Riesgo Medio (Manufactura, Alimentos)</option>
                <option value={4}>Clase IV - Riesgo Alto (Transporte, Químicos, Metalmecánica)</option>
                <option value={5}>Clase V - Riesgo Máximo (Minería, Construcción, Petróleo)</option>
              </select>
            </div>
          </div>

          {/* Panel de Cálculo Legal Automático */}
          <div className="p-4 sm:p-5 rounded-2xl bg-soft-50 border border-soft-200 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-black text-carbon uppercase tracking-wider">
                  Cálculo Legal Automático (Res. 0312 / 2019)
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black shadow-2xs ${
                requiredStandards === 7
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : requiredStandards === 21
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-mint-50 text-mint-600 border border-mint-200"
              }`}>
                {requiredStandards} Estándares Mínimos
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
              {legalJustification}
            </p>

            <div className="mt-3 pt-2.5 border-t border-soft-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Ciclo PHVA completo</span>
              <span className="flex items-center gap-1 text-purple-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                Inicialización automática de matriz
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-soft-200 text-xs font-bold text-slate-600 hover:bg-soft-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Creando empresa..." : "Crear Empresa y Configurar SG-SST"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
