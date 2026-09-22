import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const actions = await prisma.improvementAction.findMany({
      where: { companyId },
      orderBy: { plannedDate: "asc" },
    });

    const stats = {
      total: actions.length,
      corrective: actions.filter((a) => a.actionType === "CORRECTIVA").length,
      preventive: actions.filter((a) => a.actionType === "PREVENTIVA").length,
      improvement: actions.filter((a) => a.actionType === "MEJORA").length,
      inProgress: actions.filter((a) => a.status === "EN_PROCESO").length,
      executed: actions.filter((a) => a.status === "EJECUTADO").length,
      effective: actions.filter((a) => a.efficacy === "EFICAZ").length,
      highPriority: actions.filter((a) => a.priority === "ALTA").length,
    };

    return NextResponse.json({ actions, stats });
  } catch (error) {
    console.error("Error al obtener matriz ACPM:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      actionType,
      source,
      findingDescription,
      rootCause,
      riskFactor,
      actionPlan,
      responsible,
      plannedDate,
      priority,
      resources,
      evidenceNotes,
    } = body;

    if (!companyId || !findingDescription || !actionPlan || !responsible) {
      return NextResponse.json(
        { error: "Empresa, descripción, plan de acción y responsable son obligatorios" },
        { status: 400 }
      );
    }

    const action = await prisma.improvementAction.create({
      data: {
        companyId,
        actionType: actionType || "CORRECTIVA",
        source: source || "INSPECCIÓN",
        findingDescription,
        rootCause: rootCause || null,
        riskFactor: riskFactor || "LOCATIVO",
        actionPlan,
        responsible,
        plannedDate: plannedDate ? new Date(plannedDate) : new Date(),
        priority: priority || "MEDIA",
        resources: resources || "HUMANOS_Y_TECNICOS",
        evidenceNotes: evidenceNotes || null,
        status: "EN_PROCESO",
        efficacy: "PENDIENTE",
      },
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Error al registrar acción ACPM:", error);
    return NextResponse.json({ error: "Error al crear la acción de mejora" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, efficacy, evidenceNotes, followUpDate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de la acción es requerido" }, { status: 400 });
    }

    const updated = await prisma.improvementAction.update({
      where: { id },
      data: {
        status: status || undefined,
        efficacy: efficacy || undefined,
        evidenceNotes: evidenceNotes || undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : new Date(),
      },
    });

    return NextResponse.json({ success: true, action: updated });
  } catch (error) {
    console.error("Error al actualizar acción ACPM:", error);
    return NextResponse.json({ error: "Error al actualizar la acción" }, { status: 500 });
  }
}
