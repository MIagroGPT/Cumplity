import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            workers: true,
            accidentAlerts: true,
            annualWorkPlans: true,
          },
        },
        annualWorkPlans: true,
        accidentAlerts: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const workersCount = company.workerCount || company._count.workers || 1;
    const accidentsCount = company._count.accidentAlerts;
    const fatalAccidents = company.accidentAlerts.filter((a) => a.severity === "MORTAL").length;
    const severeAccidents = company.accidentAlerts.filter((a) => a.severity === "GRAVE").length;

    // Métricas del PTA
    const totalPta = company.annualWorkPlans.length;
    const executedPta = company.annualWorkPlans.filter((p) => p.status === "EJECUTADA").length;
    const ptaPercent = totalPta > 0 ? Math.round((executedPta / totalPta) * 100) : 100;

    // Frecuencia e Incidencia estimada según estándares colombianos
    const frequencyRate = Math.round((accidentsCount / workersCount) * 100);
    const mortalityRate = accidentsCount > 0 ? Math.round((fatalAccidents / accidentsCount) * 100) : 0;

    // Guardar / Consultar indicadores registrados
    const indicators = await prisma.indicatorRecord.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      systemMetrics: {
        workersCount,
        accidentsCount,
        severeAccidents,
        fatalAccidents,
        frequencyRate,
        mortalityRate,
        ptaPercent,
        totalPta,
        executedPta,
      },
      indicators,
    });
  } catch (error) {
    console.error("Error al obtener indicadores:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      indicatorType,
      indicatorCode,
      indicatorName,
      period,
      targetValue,
      actualValue,
      numerator,
      denominator,
      analysis,
    } = body;

    if (!companyId || !indicatorCode || !indicatorName) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const record = await prisma.indicatorRecord.create({
      data: {
        companyId,
        indicatorType: indicatorType || "RESULTADO",
        indicatorCode,
        indicatorName,
        period: period || "ANUAL",
        targetValue: parseFloat(targetValue || "100"),
        actualValue: parseFloat(actualValue || "0"),
        numerator: numerator ? parseFloat(numerator) : null,
        denominator: denominator ? parseFloat(denominator) : null,
        analysis: analysis || null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Error al guardar indicador:", error);
    return NextResponse.json({ error: "Error al registrar indicador" }, { status: 500 });
  }
}
