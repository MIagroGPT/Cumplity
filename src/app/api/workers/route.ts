import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const workers = await prisma.worker.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            documents: true,
            accidents: true,
          },
        },
      },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("Error al obtener trabajadores:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, fullName, documentNumber, jobPosition, medicalExamDate } = body;

    if (!companyId || !fullName || !documentNumber || !jobPosition) {
      return NextResponse.json(
        { error: "Nombre, documento y cargo son requeridos" },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.create({
      data: {
        companyId,
        fullName,
        documentNumber,
        jobPosition,
        medicalExamDate: medicalExamDate ? new Date(medicalExamDate) : null,
      },
    });

    // Actualizar conteo de trabajadores en la empresa
    const currentCount = await prisma.worker.count({ where: { companyId } });
    await prisma.company.update({
      where: { id: companyId },
      data: { workerCount: currentCount },
    });

    return NextResponse.json({ success: true, worker });
  } catch (error: any) {
    console.error("Error al crear trabajador:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un trabajador con esa cédula en esta empresa." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error al registrar trabajador" }, { status: 500 });
  }
}
