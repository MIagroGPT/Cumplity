import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, licenseNumber } = await req.json();

    let consultant = null;

    if (licenseNumber) {
      consultant = await prisma.consultant.findUnique({
        where: { licenseNumber },
      });
    } else if (email) {
      consultant = await prisma.consultant.findUnique({
        where: { email },
      });
    }

    if (!consultant) {
      // Si no existe, buscamos el primero o creamos uno de prueba
      consultant = await prisma.consultant.findFirst();
    }

    if (!consultant) {
      return NextResponse.json(
        { error: "Consultor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      consultant: {
        id: consultant.id,
        fullName: consultant.fullName,
        licenseNumber: consultant.licenseNumber,
        email: consultant.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
