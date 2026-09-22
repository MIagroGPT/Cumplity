import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const plans = await prisma.annualWorkPlan.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });

    const totalActivities = plans.length;
    const executedActivities = plans.filter((p) => p.status === "EJECUTADA").length;
    const progressPercent = totalActivities > 0 ? Math.round((executedActivities / totalActivities) * 100) : 0;

    return NextResponse.json({
      plans,
      stats: {
        total: totalActivities,
        executed: executedActivities,
        inProgress: plans.filter((p) => p.status === "EN_PROCESO").length,
        scheduled: plans.filter((p) => p.status === "PROGRAMADA").length,
        progressPercent,
      },
    });
  } catch (error) {
    console.error("Error al obtener Plan de Trabajo:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      activityName,
      phvaCycle,
      objective,
      responsible,
      resources,
      plannedMonths,
      targetPercent,
    } = body;

    if (!companyId || !activityName || !responsible) {
      return NextResponse.json(
        { error: "companyId, nombre de actividad y responsable son requeridos" },
        { status: 400 }
      );
    }

    const plan = await prisma.annualWorkPlan.create({
      data: {
        companyId,
        activityName,
        phvaCycle: phvaCycle || "PLANEAR",
        objective: objective || "Cumplimiento normativo Dec. 1072 y Res. 0312",
        responsible,
        resources: resources || "TÉCNICOS, HUMANOS, FINANCIEROS",
        plannedMonths: plannedMonths || "ENE,FEB,MAR,ABR,MAY,JUN,JUL,AGO,SEP,OCT,NOV,DIC",
        targetPercent: targetPercent ? parseFloat(targetPercent) : 100,
        status: "PROGRAMADA",
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error al crear actividad del PTA:", error);
    return NextResponse.json({ error: "Error al crear actividad" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, executedPercent, executedMonths, evidenceNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    const updated = await prisma.annualWorkPlan.update({
      where: { id },
      data: {
        status: status || undefined,
        executedPercent: executedPercent !== undefined ? parseFloat(executedPercent) : undefined,
        executedMonths: executedMonths || undefined,
        evidenceNotes: evidenceNotes || undefined,
      },
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error) {
    console.error("Error al actualizar actividad del PTA:", error);
    return NextResponse.json({ error: "Error al actualizar actividad" }, { status: 500 });
  }
}
