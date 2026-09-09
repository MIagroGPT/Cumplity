import { PrismaClient } from "@prisma/client";
import { getStandardsForGroup } from "../src/lib/constants/standards-0312";
import { addBusinessDays, calculate20YearRetention } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando Seed de Cumplity AI (SG-SST Colombia)...");

  // 1. Crear Consultor SST Maestro
  const consultant = await prisma.consultant.upsert({
    where: { email: "consultor@cumplity.com" },
    update: {},
    create: {
      fullName: "Dra. Carolina Méndez Silva",
      licenseNumber: "SST-LIC-2024-88910",
      email: "consultor@cumplity.com",
      password: "admin", // En producción se usa bcrypt
    },
  });

  console.log(`Consultor registrado: ${consultant.fullName} (Lic: ${consultant.licenseNumber})`);

  // 2. Empresas Cliente de Muestra

  // Empresa 1: 7 Estándares (Pymes <= 10 trabajadores, Riesgo II)
  const comp1 = await prisma.company.upsert({
    where: { nit: "901.445.890-1" },
    update: {},
    create: {
      consultantId: consultant.id,
      companyName: "Logística & Envíos Andina S.A.S.",
      nit: "901.445.890-1",
      arlRiskLevel: 2,
      workerCount: 8,
      requiredStandards: 7,
      economicSector: "Transporte y Almacenamiento",
    },
  });

  // Empresa 2: 21 Estándares (11 a 50 trabajadores, Riesgo III)
  const comp2 = await prisma.company.upsert({
    where: { nit: "900.832.115-4" },
    update: {},
    create: {
      consultantId: consultant.id,
      companyName: "Constructora del Valle Ltda.",
      nit: "900.832.115-4",
      arlRiskLevel: 3,
      workerCount: 38,
      requiredStandards: 21,
      economicSector: "Construcción y Obras Civiles",
    },
  });

  // Empresa 3: 60 Estándares (> 50 trabajadores o Riesgo IV/V)
  const comp3 = await prisma.company.upsert({
    where: { nit: "860.034.992-8" },
    update: {},
    create: {
      consultantId: consultant.id,
      companyName: "Industrias Químicas de Colombia S.A.",
      nit: "860.034.992-8",
      arlRiskLevel: 5,
      workerCount: 145,
      requiredStandards: 60,
      economicSector: "Manufactura de Sustancias Químicas",
    },
  });

  console.log("Empresas creadas: Logística Andina (7), Constructora del Valle (21), Industrias Químicas (60)");

  // 3. Crear Estándares para cada Empresa
  const companies = [comp1, comp2, comp3];
  for (const comp of companies) {
    const existingCount = await prisma.standardEvaluation.count({
      where: { companyId: comp.id },
    });

    if (existingCount === 0) {
      const standards = getStandardsForGroup(comp.requiredStandards as 7 | 21 | 60);
      for (let i = 0; i < standards.length; i++) {
        const std = standards[i];
        const weight =
          comp.requiredStandards === 7
            ? std.weight7
            : comp.requiredStandards === 21
            ? std.weight21
            : std.weight60;

        // Simulamos algunos cumplidos para tener datos realistas
        const status = i % 3 === 0 ? "CUMPLE" : i % 3 === 1 ? "NO_CUMPLE" : "NO_APLICA";

        await prisma.standardEvaluation.create({
          data: {
            companyId: comp.id,
            standardCode: std.code,
            standardTitle: std.title,
            cyclePhase: std.cyclePhase,
            weightPercent: weight,
            status: status,
            notes: `Verificación inicial según Res. 0312 para estándar ${std.code}`,
          },
        });
      }
    }
  }

  // 4. Trabajadores de Muestra
  const worker1 = await prisma.worker.create({
    data: {
      companyId: comp1.id,
      fullName: "Carlos Eduardo Ruiz Gómez",
      documentNumber: "1024567890",
      jobPosition: "Operario de Despacho",
      isActive: true,
      medicalExamDate: new Date("2024-02-15"),
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      companyId: comp2.id,
      fullName: "Ing. Mariana Restrepo Duque",
      documentNumber: "1017894562",
      jobPosition: "Residente de Obra",
      isActive: true,
      medicalExamDate: new Date("2024-05-10"),
    },
  });

  const worker3 = await prisma.worker.create({
    data: {
      companyId: comp3.id,
      fullName: "Jorge Enrique Morales",
      documentNumber: "79845123",
      jobPosition: "Técnico de Reactores Químicos",
      isActive: true,
      medicalExamDate: new Date("2024-01-20"),
    },
  });

  // 5. Hallazgos GTC 45 (Inspecciones con Transcripción de Voz n8n / Whisper)
  await prisma.gtc45Finding.createMany({
    data: [
      {
        companyId: comp1.id,
        zoneArea: "Bodega Principal - Pasillo 3",
        riskType: "Biomecánico",
        dangerDescription: "Manipulación manual de cargas superiores a 25 kg en postura forzada de flexión de tronco prolongada.",
        deficiencyLevel: 6, // ND Alto
        exposureLevel: 3,   // NE Frecuente
        riskLevel: 18,      // ND * NE
        controlMeasure: "Implementación de carretilla elevadora hidráulica y capacitación técnica de levantamiento de cargas.",
        audioTranscript: "Inspector SST vía nota de voz: Se observa en pasillo 3 que los estibadores están levantando bultos pesados sin ayuda mecánica, generando riesgo lumbar severo.",
        status: "OPEN",
      },
      {
        companyId: comp2.id,
        zoneArea: "Frente de Obra Torre B - Piso 4",
        riskType: "Condiciones de Seguridad",
        dangerDescription: "Trabajo en alturas sin línea de vida perimetral fija en borde de losa desprotegido.",
        deficiencyLevel: 10, // ND Muy Alto
        exposureLevel: 4,   // NE Continuo
        riskLevel: 40,
        controlMeasure: "Paralización preventiva inmediata del frente e instalación de barandas rígidas perimetrales según Res. 4272/2021.",
        audioTranscript: "Nota de voz de supervisión de campo: Atención, borde de losa en piso 4 sin rodapié ni línea de vida para los ferrallistas. Requiere corrección urgente.",
        status: "IN_PROGRESS",
      },
      {
        companyId: comp3.id,
        zoneArea: "Planta de Síntesis - Tanque V-102",
        riskType: "Químico",
        dangerDescription: "Exposición a vapores de solventes aromáticos durante purga de reactor sin sistema de extracción localizada.",
        deficiencyLevel: 6,
        exposureLevel: 2,
        riskLevel: 12,
        controlMeasure: "Mantenimiento al extractor de flujo laminar y dotación obligatoria de respirador media cara con cartuchos para vapores orgánicos.",
        audioTranscript: "Inspección de higiene ambiental por audio: Reportamos fuga leve de vapores en brida del reactor V-102. La cuadrilla requiere mascarillas con filtro mixto.",
        status: "OPEN",
      },
    ],
  });

  // 6. Bóveda Digital con Retención Legal de 20 Años (Art. 2.2.4.6.13 Dec. 1072)
  const uploadedDate = new Date();
  const expires20Years = calculate20YearRetention(uploadedDate);

  await prisma.vaultDocument.createMany({
    data: [
      {
        companyId: comp1.id,
        workerId: worker1.id,
        documentType: "EVALUACION_MEDICA",
        fileName: "Certificado_Aptitud_Ingreso_Ruiz_2024.pdf",
        fileUrl: "https://boveda.cumplity.com/docs/comp1/med_carlos_ruiz.pdf",
        retentionYears: 20,
        uploadedAt: uploadedDate,
        expiresAt: expires20Years,
      },
      {
        companyId: comp1.id,
        documentType: "MATRIZ_GTC45",
        fileName: "Matriz_Identificacion_Peligros_2024_Firmada.pdf",
        fileUrl: "https://boveda.cumplity.com/docs/comp1/matriz_gtc45_2024.pdf",
        retentionYears: 20,
        uploadedAt: uploadedDate,
        expiresAt: expires20Years,
      },
      {
        companyId: comp2.id,
        workerId: worker2.id,
        documentType: "CAPACITACION",
        fileName: "Certificado_Avanzado_Alturas_Restrepo.pdf",
        fileUrl: "https://boveda.cumplity.com/docs/comp2/alturas_mariana.pdf",
        retentionYears: 20,
        uploadedAt: uploadedDate,
        expiresAt: expires20Years,
      },
      {
        companyId: comp3.id,
        workerId: worker3.id,
        documentType: "HISTORIA_CLINICA_OCUPACIONAL",
        fileName: "Examen_Periodico_Toxicologia_Morales_2024.pdf",
        fileUrl: "https://boveda.cumplity.com/docs/comp3/examen_tox_jorge.pdf",
        retentionYears: 20,
        uploadedAt: uploadedDate,
        expiresAt: expires20Years,
      },
    ],
  });

  // 7. Alerta de Investigación de Accidente (Res. 1401/2007 - 15 Días Hábiles)
  // Simulamos un evento ocurrido hace 4 días hábiles
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() - 5);
  const legalDeadline = addBusinessDays(eventDate, 15);

  await prisma.accidentInvestigation.create({
    data: {
      companyId: comp2.id,
      workerId: worker2.id,
      eventDate: eventDate,
      severity: "GRAVE",
      legalDeadline: legalDeadline,
      status: "PENDIENTE",
      description: "Fractura de radio en miembro superior izquierdo por atrapamiento con formaleta metálica al descimbrar.",
    },
  });

  console.log("Seed completado exitosamente con cumplimiento de normativas colombianas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
