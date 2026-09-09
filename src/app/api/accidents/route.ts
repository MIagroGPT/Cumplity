import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addBusinessDays, getBusinessDaysRemaining } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const investigations = await prisma.accidentInvestigation.findMany({
      where: { companyId },
      include: {
        worker: {
          select: {
            id: true,
            fullName: true,
            documentNumber: true,
            jobPosition: true,
          },
        },
      },
      orderBy: { legalDeadline: "asc" },
    });

    const enriched = investigations.map((item) => {
      const remainingBusinessDays = getBusinessDaysRemaining(item.legalDeadline);
      const isOverdue = remainingBusinessDays < 0;
      const isCritical = remainingBusinessDays <= 3 && item.status === "PENDIENTE";

      return {
        ...item,
        remainingBusinessDays,
        isOverdue,
        isCritical,
      };
    });

    return NextResponse.json({
      investigations: enriched,
      pendingCount: enriched.filter((i) => i.status === "PENDIENTE").length,
    });
  } catch (error) {
    console.error("Error al obtener investigaciones de accidentes:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, workerId, eventDate, severity, description } = body;

    if (!companyId || !severity || !description) {
      return NextResponse.json(
        { error: "companyId, severidad y descripción son obligatorios" },
        { status: 400 }
      );
    }

    const event = eventDate ? new Date(eventDate) : new Date();
    // Resolución 1401 de 2007: 15 días hábiles contados a partir del evento
    const legalDeadline = addBusinessDays(event, 15);

    const investigation = await prisma.accidentInvestigation.create({
      data: {
        companyId,
        workerId: workerId || null,
        eventDate: event,
        severity,
        legalDeadline,
        description,
        status: "PENDIENTE",
      },
    });

    return NextResponse.json({
      success: true,
      investigation,
      message: `Investigación registrada. Plazo legal máximo: 15 días hábiles (Vence: ${legalDeadline.toLocaleDateString("es-CO")})`,
    });
  } catch (error) {
    console.error("Error al registrar investigación:", error);
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id y status son requeridos" }, { status: 400 });
    }

    const updated = await prisma.accidentInvestigation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, investigation: updated });
  } catch (error) {
    console.error("Error al actualizar investigación:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
