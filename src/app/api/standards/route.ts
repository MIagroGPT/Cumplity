import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const standards = await prisma.standardEvaluation.findMany({
      where: { companyId },
      orderBy: { standardCode: "asc" },
    });

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        companyName: true,
        requiredStandards: true,
        arlRiskLevel: true,
        workerCount: true,
      },
    });

    const totalWeight = standards.reduce((sum, s) => sum + s.weightPercent, 0);
    const earnedWeight = standards
      .filter((s) => s.status === "CUMPLE")
      .reduce((sum, s) => sum + s.weightPercent, 0);

    const compliancePercent =
      totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    const counts = {
      total: standards.length,
      cumple: standards.filter((s) => s.status === "CUMPLE").length,
      noCumple: standards.filter((s) => s.status === "NO_CUMPLE").length,
      noAplica: standards.filter((s) => s.status === "NO_APLICA").length,
    };

    return NextResponse.json({
      company,
      standards,
      metrics: {
        compliancePercent,
        earnedWeight,
        totalWeight,
        counts,
      },
    });
  } catch (error) {
    console.error("Error al obtener estándares:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes, evidenceUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    const updated = await prisma.standardEvaluation.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(evidenceUrl !== undefined && { evidenceUrl }),
      },
    });

    return NextResponse.json({ success: true, standard: updated });
  } catch (error) {
    console.error("Error al actualizar estándar:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
