"use client";

import React from "react";
import { useTenant } from "@/context/TenantContext";
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  Users,
  CheckCircle2,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function CompaniesPage() {
  const {
    companies,
    activeCompany,
    setActiveCompanyId,
    setIsCreateModalOpen,
    refreshCompanies,
  } = useTenant();

  const handleDeleteCompany = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar la empresa "${name}" y todos sus registros del SG-SST?`)) {
      try {
        const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
        if (res.ok) {
          await refreshCompanies();
        } else {
          alert("Error al eliminar la empresa.");
        }
      } catch (e) {
        console.error(e);
        alert("Error de conexión.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            Cartera de Clientes SST (Multi-Tenant)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon tracking-tight mt-1">
            Empresas Administradas
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gestiona la cartera simultánea de empresas asignadas a tu licencia de consultor SST.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nueva Empresa Cliente</span>
        </button>
      </div>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((comp) => {
          const isActive = activeCompany?.id === comp.id;
          const compliancePct = comp.stats?.compliancePercentage || 0;

          return (
            <div
              key={comp.id}
              className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                isActive
                  ? "bg-white border-purple-400 ring-2 ring-purple-500/20 shadow-md"
                  : "bg-white border-soft-200 hover:border-purple-200 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${
                      comp.requiredStandards === 7
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : comp.requiredStandards === 21
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-mint-50 text-mint-600 border-mint-200"
                    }`}
                  >
                    {comp.requiredStandards} Estándares Mínimos
                  </span>

                  {isActive ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-purple-600" />
                      Activa
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveCompanyId(comp.id)}
                      className="text-[11px] text-slate-400 hover:text-purple-600 font-bold transition"
                    >
                      Seleccionar
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-black text-carbon mt-4 truncate" title={comp.companyName}>
                  {comp.companyName}
                </h3>
                <p className="text-xs text-slate-400 font-mono font-semibold mt-0.5">
                  NIT: {comp.nit}
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-soft-50 border border-soft-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] font-medium">Riesgo ARL:</span>
                    <div className="font-extrabold text-carbon">Clase {comp.arlRiskLevel}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] font-medium">Trabajadores:</span>
                    <div className="font-extrabold text-carbon">{comp.workerCount} empleados</div>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-soft-200 flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] font-medium">Cumplimiento Res. 0312:</span>
                    <span className="font-black text-purple-600">{compliancePct}%</span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full bg-soft-200 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${compliancePct}%` }}
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 mt-5 border-t border-soft-200 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteCompany(comp.id, comp.companyName)}
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-soft-100 transition"
                  title="Eliminar empresa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveCompanyId(comp.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                    isActive
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-soft-100 hover:bg-purple-600 hover:text-white text-carbon"
                  }`}
                >
                  {isActive ? "Empresa en uso" : "Seleccionar"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
