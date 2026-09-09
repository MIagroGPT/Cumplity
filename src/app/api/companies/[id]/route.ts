import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            workers: true,
            gtc45Findings: true,
            vaultDocuments: true,
            accidentAlerts: true,
          },
        },
        standardEvaluations: true,
        workers: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        accidentAlerts: {
          orderBy: { legalDeadline: "asc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error al obtener detalle de empresa:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.company.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Empresa eliminada" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
