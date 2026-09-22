import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const inspections = await prisma.safetyInspection.findMany({
      where: { companyId },
      orderBy: { inspectionDate: "desc" },
    });

    const stats = {
      total: inspections.length,
      conforming: inspections.filter((i) => i.status === "CONFORME").length,
      nonConforming: inspections.filter((i) => i.status === "NO_CONFORME").length,
      critical: inspections.filter((i) => i.status === "CRITICO").length,
      preop: inspections.filter((i) => i.inspectionType === "PREOPERACIONAL").length,
      locative: inspections.filter((i) => i.inspectionType === "LOCATIVA").length,
      emergencies: inspections.filter((i) => ["EXTINTORES", "BOTIQUIN", "CAMILLAS"].includes(i.inspectionType)).length,
    };

    return NextResponse.json({ inspections, stats });
  } catch (error) {
    console.error("Error al obtener inspecciones:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      inspectionType,
      equipmentOrArea,
      inspectorName,
      status,
      findingsCount,
      observations,
      correctiveAction,
    } = body;

    if (!companyId || !equipmentOrArea || !inspectorName) {
      return NextResponse.json(
        { error: "Empresa, equipo/área e inspector son obligatorios" },
        { status: 400 }
      );
    }

    const inspection = await prisma.safetyInspection.create({
      data: {
        companyId,
        inspectionType: inspectionType || "PREOPERACIONAL",
        equipmentOrArea,
        inspectorName,
        status: status || "CONFORME",
        findingsCount: findingsCount ? parseInt(findingsCount, 10) : 0,
        observations: observations || null,
        correctiveAction: correctiveAction || null,
      },
    });

    return NextResponse.json({ success: true, inspection });
  } catch (error) {
    console.error("Error al registrar inspección:", error);
    return NextResponse.json({ error: "Error al crear la inspección" }, { status: 500 });
  }
}
