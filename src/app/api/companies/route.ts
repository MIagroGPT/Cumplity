import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateRequiredStandards, getStandardsForGroup } from "@/lib/constants/standards-0312";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            workers: true,
            gtc45Findings: true,
            vaultDocuments: true,
            accidentAlerts: true,
          },
        },
        standardEvaluations: {
          select: {
            status: true,
            weightPercent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = companies.map((c) => {
      // Calcular porcentaje de cumplimiento Res. 0312
      // Solo suman los que tienen status === 'CUMPLE'
      // Los 'NO_APLICA' se descuentan de la base o no restan según criterio
      const totalEvaluations = c.standardEvaluations.length;
      const complies = c.standardEvaluations.filter((s) => s.status === "CUMPLE");
      const noApplies = c.standardEvaluations.filter((s) => s.status === "NO_APLICA");

      let compliancePercentage = 0;
      if (totalEvaluations > 0) {
        // Ponderación por peso si existe o proporcional
        const totalWeight = c.standardEvaluations.reduce((acc, curr) => acc + curr.weightPercent, 0);
        if (totalWeight > 0) {
          const earnedWeight = complies.reduce((acc, curr) => acc + curr.weightPercent, 0);
          compliancePercentage = Math.round((earnedWeight / totalWeight) * 100);
        } else {
          compliancePercentage = Math.round((complies.length / totalEvaluations) * 100);
        }
      }

      return {
        id: c.id,
        companyName: c.companyName,
        nit: c.nit,
        arlRiskLevel: c.arlRiskLevel,
        workerCount: c.workerCount,
        requiredStandards: c.requiredStandards,
        economicSector: c.economicSector,
        createdAt: c.createdAt,
        stats: {
          workers: c._count.workers,
          findings: c._count.gtc45Findings,
          documents: c._count.vaultDocuments,
          accidents: c._count.accidentAlerts,
          compliancePercentage,
          totalStandards: totalEvaluations,
          compliesCount: complies.length,
          noAppliesCount: noApplies.length,
        },
      };
    });

    return NextResponse.json({ companies: enriched });
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, nit, arlRiskLevel, workerCount, economicSector } = body;

    if (!companyName || !nit || !arlRiskLevel || !workerCount) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben ser diligenciados" },
        { status: 400 }
      );
    }

    const consultant = await prisma.consultant.findFirst();
    if (!consultant) {
      return NextResponse.json({ error: "No hay consultor configurado" }, { status: 400 });
    }

    // Regla legal estricta de la Resolución 0312 de 2019:
    const requiredStandards = calculateRequiredStandards(
      parseInt(workerCount, 10),
      parseInt(arlRiskLevel, 10)
    );

    // Crear la empresa
    const company = await prisma.company.create({
      data: {
        consultantId: consultant.id,
        companyName,
        nit,
        arlRiskLevel: parseInt(arlRiskLevel, 10),
        workerCount: parseInt(workerCount, 10),
        requiredStandards,
        economicSector: economicSector || "Servicios Generales",
      },
    });

    // Inyectar automáticamente los estándares normativos correspondientes
    const standardsToAssign = getStandardsForGroup(requiredStandards);
    const standardRecords = standardsToAssign.map((std) => {
      const weight =
        requiredStandards === 7
          ? std.weight7
          : requiredStandards === 21
          ? std.weight21
          : std.weight60;

      return {
        companyId: company.id,
        standardCode: std.code,
        standardTitle: std.title,
        cyclePhase: std.cyclePhase,
        weightPercent: weight,
        status: "NO_CUMPLE",
        notes: `Estándar asignado automáticamente según Res. 0312/2019 (Grupo de ${requiredStandards} estándares).`,
      };
    });

    await prisma.standardEvaluation.createMany({
      data: standardRecords,
    });

    return NextResponse.json({
      success: true,
      company,
      standardsAssigned: standardRecords.length,
      message: `Empresa creada con éxito bajo el marco de ${requiredStandards} Estándares Mínimos (Res. 0312).`,
    });
  } catch (error: any) {
    console.error("Error al crear empresa:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una empresa registrada con ese NIT." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error al crear la empresa" }, { status: 500 });
  }
}
