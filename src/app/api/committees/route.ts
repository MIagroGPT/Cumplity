import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const records = await prisma.committeeRecord.findMany({
      where: { companyId },
      orderBy: { meetingDate: "desc" },
    });

    const stats = {
      total: records.length,
      copasstCount: records.filter((r) => r.committeeType === "COPASST" || r.committeeType === "VIGIA").length,
      cclCount: records.filter((r) => r.committeeType === "CONVIVENCIA").length,
    };

    return NextResponse.json({ records, stats });
  } catch (error) {
    console.error("Error al obtener registros de comités:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      committeeType,
      period,
      meetingNumber,
      meetingDate,
      attendees,
      topicsDiscussed,
      commitments,
    } = body;

    if (!companyId || !attendees || !topicsDiscussed) {
      return NextResponse.json(
        { error: "Empresa, asistentes y temas tratados son obligatorios" },
        { status: 400 }
      );
    }

    const record = await prisma.committeeRecord.create({
      data: {
        companyId,
        committeeType: committeeType || "COPASST",
        period: period || "2024-2026",
        meetingNumber: meetingNumber ? parseInt(meetingNumber, 10) : 1,
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
        attendees,
        topicsDiscussed,
        commitments: commitments || "Sin compromisos pendientes",
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Error al registrar acta de comité:", error);
    return NextResponse.json({ error: "Error al registrar acta" }, { status: 500 });
  }
}
