"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CompanyStats {
  workers: number;
  findings: number;
  documents: number;
  accidents: number;
  compliancePercentage: number;
  totalStandards: number;
  compliesCount: number;
  noAppliesCount: number;
}

export interface CompanyTenant {
  id: string;
  companyName: string;
  nit: string;
  arlRiskLevel: number;
  workerCount: number;
  requiredStandards: number;
  economicSector: string | null;
  createdAt: string;
  stats?: CompanyStats;
}

interface TenantContextType {
  companies: CompanyTenant[];
  activeCompany: CompanyTenant | null;
  loading: boolean;
  setActiveCompanyId: (id: string) => void;
  refreshCompanies: () => Promise<void>;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<CompanyTenant[]>([]);
  const [activeCompany, setActiveCompany] = useState<CompanyTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);

        // Seleccionar empresa activa
        const storedActiveId = localStorage.getItem("cumplity_active_company_id");
        let current = data.companies.find((c: CompanyTenant) => c.id === storedActiveId);
        if (!current && data.companies.length > 0) {
          current = data.companies[0];
        }
        if (current) {
          setActiveCompany(current);
          localStorage.setItem("cumplity_active_company_id", current.id);
        }
      }
    } catch (err) {
      console.error("Error al cargar empresas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const setActiveCompanyId = (id: string) => {
    const found = companies.find((c) => c.id === id);
    if (found) {
      setActiveCompany(found);
      localStorage.setItem("cumplity_active_company_id", found.id);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        companies,
        activeCompany,
        loading,
        setActiveCompanyId,
        refreshCompanies: fetchCompanies,
        isCreateModalOpen,
        setIsCreateModalOpen,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant debe usarse dentro de un TenantProvider");
  }
  return context;
}
