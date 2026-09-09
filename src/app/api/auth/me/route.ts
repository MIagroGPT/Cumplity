import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const consultant = await prisma.consultant.findFirst();
    if (!consultant) {
      return NextResponse.json(
        { error: "No hay consultor registrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      consultant: {
        id: consultant.id,
        fullName: consultant.fullName,
        licenseNumber: consultant.licenseNumber,
        email: consultant.email,
      },
    });
  } catch (error) {
    console.error("Error al obtener sesión:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
