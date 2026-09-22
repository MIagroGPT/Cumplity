import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    let consultant = await prisma.consultant.findFirst();
    if (!consultant) {
      consultant = await prisma.consultant.create({
        data: {
          fullName: "Dra. Carolina Méndez Silva",
          licenseNumber: "SST-LIC-2024-88910",
          email: "consultor@cumplity.com",
          password: "admin",
        },
      });
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
