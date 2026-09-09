import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const findings = await prisma.gtc45Finding.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      total: findings.length,
      open: findings.filter((f) => f.status === "OPEN").length,
      inProgress: findings.filter((f) => f.status === "IN_PROGRESS").length,
      closed: findings.filter((f) => f.status === "CLOSED").length,
    };

    return NextResponse.json({ findings, counts });
  } catch (error) {
    console.error("Error al obtener hallazgos GTC 45:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      zoneArea,
      riskType,
      dangerDescription,
      deficiencyLevel,
      exposureLevel,
      controlMeasure,
      audioTranscript,
    } = body;

    if (!companyId || !dangerDescription) {
      return NextResponse.json(
        { error: "companyId y descripción del peligro son obligatorios" },
        { status: 400 }
      );
    }

    const nd = deficiencyLevel ? parseInt(deficiencyLevel, 10) : 2;
    const ne = exposureLevel ? parseInt(exposureLevel, 10) : 2;
    const riskLevel = nd * ne; // Nivel de Probabilidad preliminar según GTC 45

    const finding = await prisma.gtc45Finding.create({
      data: {
        companyId,
        zoneArea: zoneArea || "Área General",
        riskType: riskType || "Condiciones de Seguridad",
        dangerDescription,
        deficiencyLevel: nd,
        exposureLevel: ne,
        riskLevel,
        controlMeasure: controlMeasure || "Definir medidas según jerarquía de controles",
        audioTranscript: audioTranscript || null,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, finding });
  } catch (error) {
    console.error("Error al crear hallazgo GTC 45:", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, controlMeasure } = body;

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    const updated = await prisma.gtc45Finding.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(controlMeasure && { controlMeasure }),
      },
    });

    return NextResponse.json({ success: true, finding: updated });
  } catch (error) {
    console.error("Error al actualizar hallazgo GTC 45:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
