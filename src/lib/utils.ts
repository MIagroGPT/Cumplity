import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula la fecha límite sumando N días hábiles (lunes a viernes).
 * Resolución 1401 de 2007 exige 15 días hábiles para investigación de accidentes graves/mortales.
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // 0 = Domingo, 6 = Sábado
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  return result;
}

/**
 * Retorna los días hábiles restantes entre hoy y una fecha límite.
 */
export function getBusinessDaysRemaining(deadlineDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(deadlineDate);
  target.setHours(0, 0, 0, 0);

  if (target < today) {
    // Ya venció
    return -Math.ceil((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  }

  let current = new Date(today);
  let businessDays = 0;

  while (current < target) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }

  return businessDays;
}

/**
 * Retorna el estado legal según el porcentaje de cumplimiento de la Res. 0312:
 * - < 60%: CRÍTICO (Plan de mejoramiento inmediato + envío a MinTrabajo/ARL)
 * - 60% a 85%: MODERADAMENTE ACEPTABLE (Plan de mejoramiento con ARL)
 * - > 85%: ACEPTABLE (Mantener calificación e incluir en Plan Anual)
 */
export function getComplianceRating(percentage: number): {
  level: "CRÍTICO" | "MODERADAMENTE_ACEPTABLE" | "ACEPTABLE";
  label: string;
  badgeClass: string;
  barColor: string;
  recommendation: string;
} {
  if (percentage < 60) {
    return {
      level: "CRÍTICO",
      label: "Crítico (< 60%)",
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-200 font-bold",
      barColor: "bg-rose-500",
      recommendation: "Acción inmediata: Formular plan de mejora a disposición de MinTrabajo y enviar reporte de avances a los 3 meses a la ARL.",
    };
  } else if (percentage <= 85) {
    return {
      level: "MODERADAMENTE_ACEPTABLE",
      label: "Moderadamente Aceptable (60% - 85%)",
      badgeClass: "bg-amber-50 text-amber-800 border border-amber-200 font-bold",
      barColor: "bg-amber-500",
      recommendation: "Plan de mejora a disposición del MinTrabajo y reporte de seguimiento a los 6 meses a la ARL.",
    };
  } else {
    return {
      level: "ACEPTABLE",
      label: "Aceptable (> 85%)",
      badgeClass: "bg-purple-50 text-purple-700 border border-purple-200 font-bold",
      barColor: "bg-[#6045F4]",
      recommendation: "Mantener la calificación e incorporar las acciones preventivas y correctivas en el Plan Anual de Trabajo.",
    };
  }
}

/**
 * Formato de fecha legal colombiana (DD/MM/AAAA)
 */
export function formatColDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Calcula la fecha de expiración legal de 20 años (Decreto 1072 de 2015 Art. 2.2.4.6.13)
 */
export function calculate20YearRetention(fromDate: Date = new Date()): Date {
  const expiry = new Date(fromDate);
  expiry.setFullYear(expiry.getFullYear() + 20);
  return expiry;
}

/**
 * Calcula el dígito de verificación de un NIT en Colombia
 */
export function calculateNITVerificationDigit(nitStr: string): string {
  const cleanNit = nitStr.replace(/\D/g, "");
  if (!cleanNit) return "";
  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;
  const digits = cleanNit.split("").reverse();
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i], 10) * primes[i];
  }
  const mod = sum % 11;
  if (mod === 0 || mod === 1) return `${cleanNit}-${mod}`;
  return `${cleanNit}-${11 - mod}`;
}
