import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculate20YearRetention } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId es requerido" }, { status: 400 });
    }

    const documents = await prisma.vaultDocument.findMany({
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
      orderBy: { uploadedAt: "desc" },
    });

    const now = new Date();
    const enriched = documents.map((doc) => {
      const msRemaining = new Date(doc.expiresAt).getTime() - now.getTime();
      const yearsRemaining = Math.max(0, Math.round(msRemaining / (1000 * 60 * 60 * 24 * 365.25)));
      return {
        ...doc,
        yearsRemaining,
        isExpired: msRemaining <= 0,
      };
    });

    return NextResponse.json({ documents: enriched });
  } catch (error) {
    console.error("Error al obtener documentos de la bóveda:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      workerId,
      documentType,
      fileName,
      fileUrl,
      retentionYears = 20,
    } = body;

    if (!companyId || !documentType || !fileName) {
      return NextResponse.json(
        { error: "companyId, tipo de documento y nombre de archivo son obligatorios" },
        { status: 400 }
      );
    }

    const uploadedAt = new Date();
    const expiresAt = calculate20YearRetention(uploadedAt);

    const document = await prisma.vaultDocument.create({
      data: {
        companyId,
        workerId: workerId || null,
        documentType,
        fileName,
        fileUrl: fileUrl || `https://boveda.cumplity.com/storage/${fileName}`,
        retentionYears: parseInt(retentionYears, 10),
        uploadedAt,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      document,
      message: `Documento archivado en bóveda con custodia obligatoria por 20 años hasta ${expiresAt.getFullYear()}.`,
    });
  } catch (error) {
    console.error("Error al archivar documento en bóveda:", error);
    return NextResponse.json({ error: "Error al archivar" }, { status: 500 });
  }
}
