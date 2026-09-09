import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Diccionario de clasificación de peligros según GTC 45
function inferRiskType(text: string): {
  riskType: string;
  deficiencyLevel: number;
  exposureLevel: number;
  suggestedControl: string;
} {
  const lower = text.toLowerCase();

  if (
    lower.includes("postura") ||
    lower.includes("carga") ||
    lower.includes("esfuerzo") ||
    lower.includes("lumbar") ||
    lower.includes("repetitivo")
  ) {
    return {
      riskType: "Biomecánico",
      deficiencyLevel: 6,
      exposureLevel: 3,
      suggestedControl: "Ayudas mecánicas de transporte, pausas activas y rediseño ergonómico del puesto.",
    };
  }

  if (
    lower.includes("quimic") ||
    lower.includes("solvente") ||
    lower.includes("vapor") ||
    lower.includes("gas") ||
    lower.includes("polvo") ||
    lower.includes("reactivo")
  ) {
    return {
      riskType: "Químico",
      deficiencyLevel: 6,
      exposureLevel: 2,
      suggestedControl: "Extracción localizada, fichas de datos de seguridad (FDS) según SGA y protección respiratoria.",
    };
  }

  if (
    lower.includes("altura") ||
    lower.includes("caida") ||
    lower.includes("escalera") ||
    lower.includes("andamio") ||
    lower.includes("borde")
  ) {
    return {
      riskType: "Condiciones de Seguridad (Alturas)",
      deficiencyLevel: 10,
      exposureLevel: 3,
      suggestedControl: "Línea de vida certificada, barandas rígidas y permiso de trabajo en alturas (Res. 4272/2021).",
    };
  }

  if (
    lower.includes("cable") ||
    lower.includes("electr") ||
    lower.includes("voltaje") ||
    lower.includes("tablero") ||
    lower.includes("cortocircuito")
  ) {
    return {
      riskType: "Eléctrico",
      deficiencyLevel: 6,
      exposureLevel: 2,
      suggestedControl: "Bloqueo y etiquetado (LOTO), señalización de alta tensión y mantenimiento RETIE.",
    };
  }

  if (
    lower.includes("ruido") ||
    lower.includes("vibracion") ||
    lower.includes("iluminacion") ||
    lower.includes("temperatura")
  ) {
    return {
      riskType: "Físico",
      deficiencyLevel: 2,
      exposureLevel: 3,
      suggestedControl: "Monitoreo ambiental sonométrico/luximétrico y protectores auditivos de copa.",
    };
  }

  return {
    riskType: "Condiciones de Seguridad",
    deficiencyLevel: 2,
    exposureLevel: 2,
    suggestedControl: "Inspección periódica del área y orden y aseo 5S.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, audioTranscript, zoneArea, apiKey } = body;

    // Obtener empresa
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const firstCompany = await prisma.company.findFirst();
      if (!firstCompany) {
        return NextResponse.json({ error: "No hay empresas configuradas" }, { status: 400 });
      }
      targetCompanyId = firstCompany.id;
    }

    if (!audioTranscript) {
      return NextResponse.json(
        { error: "audioTranscript es obligatorio" },
        { status: 400 }
      );
    }

    // Inferencia legal automática con IA de reglas GTC 45
    const inferred = inferRiskType(audioTranscript);
    const nd = inferred.deficiencyLevel;
    const ne = inferred.exposureLevel;
    const riskLevel = nd * ne;

    const finding = await prisma.gtc45Finding.create({
      data: {
        companyId: targetCompanyId,
        zoneArea: zoneArea || "Inspección de Campo por Voz",
        riskType: inferred.riskType,
        dangerDescription: audioTranscript,
        deficiencyLevel: nd,
        exposureLevel: ne,
        riskLevel,
        controlMeasure: inferred.suggestedControl,
        audioTranscript: `[n8n + Whisper AI]: "${audioTranscript}"`,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Hallazgo GTC 45 procesado y clasificado exitosamente desde n8n/Whisper",
      finding,
    });
  } catch (error) {
    console.error("Error en webhook GTC 45:", error);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    description: "Webhook Cumplity AI para integración con n8n y Whisper AI",
    endpoint: "/api/webhooks/gtc45-voice",
    method: "POST",
    expectedPayload: {
      companyId: "UUID_DE_LA_EMPRESA (opcional, por defecto toma la primera)",
      audioTranscript: "Texto transcrito por Whisper AI desde la nota de voz del inspector",
      zoneArea: "Bodega / Obra / Planta (opcional)",
      apiKey: "cumplity-n8n-token (opcional en fase 1)",
    },
    sampleCurl:
      'curl -X POST http://localhost:3000/api/webhooks/gtc45-voice -H "Content-Type: application/json" -d \'{"audioTranscript": "En el taller de soldadura los operarios no usan careta fotosensible y hay olor fuerte a humo metálico", "zoneArea": "Taller de Mantenimiento"}\'',
  });
}
