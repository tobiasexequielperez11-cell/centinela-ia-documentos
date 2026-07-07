'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
import { indexarDocumento } from '@/lib/ai/indexarDocumento';
import {
  canUploadDocument,
  canUseAi,
  isUserRole,
} from '@/lib/permissions/roles';

function denyDocumentAction(action: 'subir' | 'analizar') {
  redirect(`/acceso-denegado?motivo=rol&accion=${action}`);
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadDocument(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canUploadDocument(profile.role)) {
    denyDocumentAction('subir');
  }

  const caseId = String(formData.get('case_id') || '');
  const documentType = String(formData.get('document_type') || '');
  const sensitivityLevel = String(formData.get('sensitivity_level') || 'medium');
  const expiresAtForm = String(formData.get('expires_at') || '');
  const expiresAt = expiresAtForm ? expiresAtForm : null;
  const file = formData.get('file');

  if (!(file instanceof File)) {
    redirect('/documentos/subir?error=missing_file');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    redirect('/documentos/subir?error=invalid_type');
  }

  if (file.size > MAX_FILE_SIZE) {
    redirect('/documentos/subir?error=file_too_large');
  }

  const supabase = await createClient();

  if (caseId) {
    const { data: caseRecord } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!caseRecord) {
      redirect('/documentos/subir?error=invalid_case');
    }
  }

  const documentId = randomUUID();
  const safeFileName = sanitizeFileName(file.name);
  const storagePath = `${profile.organization_id}/${caseId || 'general'}/${documentId}/${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    redirect('/documentos/subir?error=upload_failed');
  }

  const { error: insertError } = await supabase.from('documents').insert({
    id: documentId,
    organization_id: profile.organization_id,
    case_id: caseId || null,
    file_name: file.name,
    file_path: storagePath,
    file_mime_type: file.type,
    file_size: file.size,
    document_type: documentType || null,
    sensitivity_level: sensitivityLevel,
    uploaded_by: user.id,
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error('Metadata error:', insertError);
    await supabase.storage.from('documents').remove([storagePath]);
    redirect('/documentos/subir?error=metadata_failed');
  }

  await createAuditLog({
    organizationId: profile.organization_id,
    userId: user.id,
    action: 'document_uploaded',
    resourceType: 'document',
    resourceId: documentId,
    metadata: {
      file_name: file.name,
      case_id: caseId || null,
      document_type: documentType || null,
      sensitivity_level: sensitivityLevel,
      expires_at: expiresAt,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/documentos');

  if (caseId) {
    revalidatePath(`/expedientes/${caseId}`);
  }

  redirect(`/documentos/${documentId}`);
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim()
    .slice(0, 18000);
}

function hasAny(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function detectDocumentType(text: string, declaredType?: string | null) {
    if (
    hasAny(text, [
      'demanda',
      'demanda laboral',
      'demanda judicial',
      'actor',
      'demandado',
      'juzgado',
      'expediente judicial',
      'objeto de la demanda',
      'petitorio',
    ])
  ) {
    return 'demanda';
  }

  if (
    hasAny(text, [
      'escrito',
      'escrito judicial',
      'presenta escrito',
      'se presenta',
      'solicita',
      'manifiesta',
      'acompaña documentación',
      'tenga presente',
      'provea de conformidad',
    ])
  ) {
    return 'escrito';
  }

  if (
    hasAny(text, [
      'boleto de compraventa',
      'boleto compraventa',
      'compraventa',
      'comprador',
      'vendedor',
      'inmueble',
      'precio de venta',
      'seña',
      'posesión',
      'escritura traslativa',
    ])
  ) {
    return 'boleto_compraventa';
  }

  if (
    hasAny(text, [
      'certificado',
      'constancia',
      'certifica',
      'se certifica',
      'certificación',
      'emitido por',
      'validez',
    ])
  ) {
    return 'certificado';
  }

  if (
    hasAny(text, [
      'poder',
      'poder especial',
      'poder general',
      'apoderado',
      'poderdante',
      'mandato',
      'facultades',
      'representación',
      'representar',
    ])
  ) {
    return 'poder';
  }

  if (
    hasAny(text, [
      'garantía',
      'garante',
      'fiador',
      'aval',
      'garantiza',
      'obligación garantizada',
      'responsable solidario',
    ])
  ) {
    return 'garantia';
  }

  if (
    hasAny(text, [
      'reserva',
      'reserva de inmueble',
      'reserva inmobiliaria',
      'monto de reserva',
      'seña de reserva',
      'operación reservada',
      'interesado',
    ])
  ) {
    return 'reserva';
  }

  if (
    hasAny(text, [
      'contrato',
      'alquiler',
      'locador',
      'locatario',
      'inmueble',
      'compraventa',
      'boleto',
      'escritura',
      'cláusula',
      'partes',
      'acuerdo',
    ])
  ) {
    return 'contrato';
  }

  if (
    hasAny(text, [
      'demanda',
      'actor',
      'demandado',
      'expediente judicial',
      'juzgado',
      'sentencia',
      'escrito judicial',
    ])
  ) {
    return 'otro';
  }

  if (
    hasAny(text, [
      'plan de estudios',
      'asignatura',
      'materia',
      'carrera',
      'facultad',
      'universidad',
      'licenciatura',
    ])
  ) {
    return 'plan_estudios';
  }

  if (hasAny(text, ['factura', 'importe', 'iva', 'total'])) {
    return 'factura';
  }

  if (hasAny(text, ['recibo', 'recibí', 'pago'])) {
    return 'recibo';
  }

  if (hasAny(text, ['escritura', 'inmueble', 'compraventa', 'dominio'])) {
    return 'escritura';
  }

  if (hasAny(text, ['cuit', 'constancia', 'afip', 'monotributo'])) {
    return 'constancia_fiscal';
  }

  return declaredType || 'otro';
}

function detectSensitivity(text: string) {
  if (
    hasAny(text, [
      'dni',
      'cuit',
      'cuil',
      'domicilio',
      'firma',
      'cuenta bancaria',
      'clave',
      'contraseña',
      'historia clínica',
    ])
  ) {
    return 'critical';
  }

  if (
    hasAny(text, [
      'nombre',
      'apellido',
      'legajo',
      'matrícula',
      'contrato',
      'inmueble',
      'calificación',
      'académico',
      'universidad',
      'facultad',
    ])
  ) {
    return 'high';
  }

  if (text.length > 1000) {
    return 'medium';
  }

  return 'low';
}

function buildRelevantData(text: string, documentType?: string) {
  const items: string[] = [];

if (
  documentType === 'plan_estudios' &&
  hasAny(text, ['plan de estudios', 'asignatura', 'materia', 'carrera'])
) {
  items.push('El documento parece contener información académica o curricular.');
}

  if (hasAny(text, ['dni', 'cuit', 'cuil'])) {
    items.push('Se detectan posibles identificadores personales o fiscales.');
  }

if (
  documentType === 'contrato' ||
  hasAny(text, ['contrato', 'alquiler', 'locador', 'locatario', 'inmueble', 'compraventa', 'boleto', 'escritura', 'cláusula', 'acuerdo'])
) {
  items.push('Se detectan elementos compatibles con documentación contractual.');
  items.push('El documento contiene referencias a partes, condiciones, inmueble o cláusulas.');
}

  if (hasAny(text, ['firma', 'firmado'])) {
    items.push('El documento podría contener referencias a firma o validación formal.');
  }

  if (items.length === 0) {
    items.push('Se extrajo texto del documento y quedó disponible para revisión.');
  }

  return items;
}

function buildAlerts(text: string, sensitivity: string) {
  const alerts: string[] = [];

  if (sensitivity === 'critical') {
    alerts.push(
      'Documento con posible información altamente sensible. Revisar permisos de acceso.'
    );
  }

  if (sensitivity === 'high') {
    alerts.push(
      'Documento con posible información sensible. Conviene mantenerlo restringido.'
    );
  }

  if (text.length < 300) {
    alerts.push(
      'El texto extraído es breve. Puede ser un PDF escaneado o con poca información seleccionable.'
    );
  }

  if (alerts.length === 0) {
    alerts.push('No se detectaron alertas críticas en el análisis docuemtanl');
  }

  return alerts;
}

function buildNextActions(documentType: string) {
  if (documentType === 'plan_estudios') {
    return [
      'Verificar carrera, materias y datos institucionales.',
      'Clasificar como documento académico.',
      'Asociar al expediente correspondiente si aplica.',
    ];
  }

  if (documentType === 'contrato') {
    return [
      'Revisar partes involucradas y cláusulas principales.',
      'Verificar firmas y fechas.',
      'Marcar como documento sensible.',
    ];
  }

  if (documentType === 'factura') {
    return [
      'Verificar CUIT, importe y fecha.',
      'Asociar a carpeta contable o administrativa.',
    ];
  }

  if (documentType === 'escritura') {
    return [
      'Verificar datos del inmueble.',
      'Revisar partes intervinientes.',
      'Controlar documentación respaldatoria.',
    ];
  }

  return [
    'Revisar manualmente el contenido extraído.',
    'Confirmar tipo documental.',
    'Definir si requiere checklist o seguimiento.',
  ];
}

async function analizarConIA(texto: string): Promise<{
  model: string;
  resumen: string;
  tipo_documental_detectado: string;
  sensibilidad_detectada: string;
  partes: string[];
  datos_clave: string[];
  clausulas_riesgos: string[];
  alertas: string[];
  proximas_acciones: string[];
  fechas_plazos: { descripcion: string; fecha: string }[];
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = [
    'Sos un asistente jurídico argentino experto en análisis documental.',
    'Analizá el DOCUMENTO y devolvé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    '  "resumen": "3 a 4 líneas explicando qué es y qué dice el documento",',
    '  "tipo_documental_detectado": "tipo en una o dos palabras (ej: demanda, contrato de locación, poder, boleto de compraventa)",',
    '  "sensibilidad_detectada": "uno de: low, medium, high, critical",',
    '  "partes": ["cada parte interviniente y su rol"],',
    '  "datos_clave": ["montos, fechas, plazos, vencimientos, DNI/CUIT, domicilios relevantes"],',
    '  "clausulas_riesgos": ["cláusulas u obligaciones importantes y riesgos detectados"],',
    '  "alertas": ["alertas jurídicas o de sensibilidad"],',
    '  "proximas_acciones": ["acciones concretas sugeridas para el abogado"],',
    '  "fechas_plazos": [{"descripcion": "...", "fecha": "YYYY-MM-DD"}]',
    '}',
    'REGLAS:',
    '- Basáte SOLO en el contenido del documento. NO inventes datos, montos, fechas ni artículos.',
    '- Si algún dato no aparece, devolvé un array vacío para esa clave.',
    '- fechas_plazos: Incluí SOLO fechas concretas y relevantes del documento (vencimientos, audiencias, plazos, fechas de pago, fechas límite). La fecha debe estar en formato ISO YYYY-MM-DD; si el documento da una fecha relativa o ambigua (ej: "dentro de 15 días"), omitila.',
    '- sensibilidad_detectada: "critical" si hay datos personales/financieros fuertes (DNI, CUIT, cuentas, historia clínica); "high" si hay nombres/contratos; "medium" o "low" si es genérico.',
    '',
    'DOCUMENTO:',
    texto,
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!resp.ok) {
      console.error('Gemini análisis error:', resp.status, await resp.text());
      return null;
    }

    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!raw.trim()) return null;

    const parsed = JSON.parse(raw);
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => String(x)) : [];

    const rawFechas = Array.isArray(parsed.fechas_plazos) ? parsed.fechas_plazos : [];
    const fechas_plazos = rawFechas.filter((f: any) => 
      f && typeof f.descripcion === 'string' && typeof f.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.fecha)
    ).map((f: any) => ({ descripcion: f.descripcion, fecha: f.fecha }));

    return {
      model: `analisis-ia-${modelo}`,
      resumen: String(parsed.resumen ?? ''),
      tipo_documental_detectado: String(parsed.tipo_documental_detectado ?? ''),
      sensibilidad_detectada: String(parsed.sensibilidad_detectada ?? '').toLowerCase(),
      partes: arr(parsed.partes),
      datos_clave: arr(parsed.datos_clave),
      clausulas_riesgos: arr(parsed.clausulas_riesgos),
      alertas: arr(parsed.alertas),
      proximas_acciones: arr(parsed.proximas_acciones),
      fechas_plazos,
    };
  } catch (e) {
    console.error('Gemini análisis fetch error:', e);
    return null;
  }
}

async function analizarConIAMultimodal(
  base64Data: string,
  mimeType: string
): Promise<{
  model: string;
  resumen: string;
  tipo_documental_detectado: string;
  sensibilidad_detectada: string;
  partes: string[];
  datos_clave: string[];
  clausulas_riesgos: string[];
  alertas: string[];
  proximas_acciones: string[];
  fechas_plazos: { descripcion: string; fecha: string }[];
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = [
    'Sos un asistente jurídico argentino experto en análisis documental.',
    'Vas a recibir un documento adjunto que puede ser un PDF escaneado, una foto o una imagen (JPG/PNG).',
    'Leé su contenido aplicando OCR si hace falta y devolvé SOLO un objeto JSON válido (sin texto adicional) con esta forma exacta:',
    '{',
    '  "resumen": "3 a 4 líneas explicando qué es y qué dice el documento",',
    '  "tipo_documental_detectado": "tipo en una o dos palabras (ej: demanda, contrato de locación, poder, boleto de compraventa)",',
    '  "sensibilidad_detectada": "uno de: low, medium, high, critical",',
    '  "partes": ["cada parte interviniente y su rol"],',
    '  "datos_clave": ["montos, fechas, plazos, vencimientos, DNI/CUIT, domicilios relevantes"],',
    '  "clausulas_riesgos": ["cláusulas u obligaciones importantes y riesgos detectados"],',
    '  "alertas": ["alertas jurídicas o de sensibilidad"],',
    '  "proximas_acciones": ["acciones concretas sugeridas para el abogado"],',
    '  "fechas_plazos": [{"descripcion": "...", "fecha": "YYYY-MM-DD"}]',
    '}',
    'REGLAS:',
    '- Basáte SOLO en el contenido del documento. NO inventes datos, montos, fechas ni artículos.',
    '- Si algún dato no aparece, devolvé un array vacío para esa clave.',
    '- fechas_plazos: Incluí SOLO fechas concretas y relevantes del documento (vencimientos, audiencias, plazos, fechas de pago, fechas límite). La fecha debe estar en formato ISO YYYY-MM-DD; si el documento da una fecha relativa o ambigua (ej: "dentro de 15 días"), omitila.',
    '- Si el documento está borroso o ilegible, aclaralo en "alertas".',
    '- sensibilidad_detectada: "critical" si hay datos personales/financieros fuertes (DNI, CUIT, cuentas, historia clínica); "high" si hay nombres/contratos; "medium" o "low" si es genérico.',
  ].join('\n');

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!resp.ok) {
      console.error('Gemini multimodal error:', resp.status, await resp.text());
      return null;
    }

    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!raw.trim()) return null;

    const parsed = JSON.parse(raw);
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => String(x)) : [];

    const rawFechas = Array.isArray(parsed.fechas_plazos) ? parsed.fechas_plazos : [];
    const fechas_plazos = rawFechas.filter((f: any) => 
      f && typeof f.descripcion === 'string' && typeof f.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f.fecha)
    ).map((f: any) => ({ descripcion: f.descripcion, fecha: f.fecha }));

    return {
      model: `analisis-ia-mm-${modelo}`,
      resumen: String(parsed.resumen ?? ''),
      tipo_documental_detectado: String(parsed.tipo_documental_detectado ?? ''),
      sensibilidad_detectada: String(parsed.sensibilidad_detectada ?? '').toLowerCase(),
      partes: arr(parsed.partes),
      datos_clave: arr(parsed.datos_clave),
      clausulas_riesgos: arr(parsed.clausulas_riesgos),
      alertas: arr(parsed.alertas),
      proximas_acciones: arr(parsed.proximas_acciones),
      fechas_plazos,
    };
  } catch (e) {
    console.error('Gemini multimodal fetch error:', e);
    return null;
  }
}

export async function analyzeDocument(formData: FormData) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect('/login');
  if (!profile) redirect('/onboarding');

  if (!isUserRole(profile.role) || !canUseAi(profile.role)) {
    denyDocumentAction('analizar');
  }

  const documentId = String(formData.get('document_id') || '');

  if (!documentId) {
    redirect('/documentos?error=missing_document');
  }

  const supabase = await createClient();

  const { data: documentRecord, error: documentError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('organization_id', profile.organization_id)
    .single();

  if (documentError || !documentRecord) {
    redirect('/documentos?error=document_not_found');
  }

  const AI_INLINE_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_INLINE_SIZE = 15 * 1024 * 1024; // límite seguro para enviar inline a Gemini

  if (!AI_INLINE_MIME_TYPES.includes(documentRecord.file_mime_type)) {
    redirect(`/documentos/${documentId}?error=formato_no_soportado`);
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from('documents')
    .download(documentRecord.file_path);

  if (downloadError || !fileBlob) {
    console.error('Download error:', downloadError);
    redirect(`/documentos/${documentId}?error=download_failed`);
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = documentRecord.file_mime_type;
  const isPdf = mimeType === 'application/pdf';

  let extractedText = '';

  // 1) Si es PDF, intentamos extraer texto (rápido y barato).
  if (isPdf) {
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default;
    const parsedPdf = await pdfParse(buffer);
    extractedText = cleanExtractedText(parsedPdf.text || '');
  }

  // La detección por reglas necesita texto; si no hay (imagen o PDF escaneado), queda fallback genérico.
  const detectedType = detectDocumentType(
    extractedText,
    documentRecord.document_type
  );
  const detectedSensitivity = detectSensitivity(extractedText);

  // 2) Estrategia + interruptor:
  //    - PDF con texto suficiente -> IA por texto (barato).
  //    - Imagen o PDF escaneado (poco/nada de texto) -> IA multimodal (OCR + visión).
  const tieneTextoUtil = extractedText.length >= 200;
  const puedeMultimodal = buffer.length <= MAX_INLINE_SIZE;

  let ia: Awaited<ReturnType<typeof analizarConIA>> = null;

  if (isPdf && tieneTextoUtil) {
    ia = await analizarConIA(extractedText);
  } else if (puedeMultimodal) {
    const base64 = buffer.toString('base64');
    ia = await analizarConIAMultimodal(base64, mimeType);
  }

  // Si no hay texto NI resultado de IA, no podemos analizar (ej: imagen sin API key o archivo muy grande).
  if (!ia && !extractedText) {
    redirect(`/documentos/${documentId}?error=analisis_no_disponible`);
  }

  let modelName = 'analisis-documental-beta-v1';
  let sensitivityToSave = detectedSensitivity;
  let typeToSave = detectedType;
  let analysis;

  if (ia) {
    const sensValida = ['low', 'medium', 'high', 'critical'].includes(
      ia.sensibilidad_detectada
    )
      ? ia.sensibilidad_detectada
      : detectedSensitivity;

    modelName = ia.model;
    sensitivityToSave = sensValida;
    typeToSave = ia.tipo_documental_detectado?.trim() || detectedType;

    const datosRelevantes = [
      ...ia.partes.map((p) => `Parte: ${p}`),
      ...ia.datos_clave,
      ...ia.clausulas_riesgos.map((r) => `Cláusula/riesgo: ${r}`),
    ];

    analysis = {
      modo: 'ia',
      resumen: ia.resumen || 'Análisis generado con IA.',
      tipo_documental_detectado: ia.tipo_documental_detectado || detectedType,
      sensibilidad_detectada: sensValida,
      datos_relevantes: datosRelevantes.length
        ? datosRelevantes
        : ['La IA no identificó datos estructurados.'],
      alertas: ia.alertas.length
        ? ia.alertas
        : ['Sin alertas detectadas por la IA.'],
      proximas_acciones: ia.proximas_acciones,
      fechas_plazos: ia.fechas_plazos ?? [],
      texto_extraido_preview: extractedText.slice(0, 1200),
      caracteres_extraidos: extractedText.length,
    };
  } else {
    analysis = {
      modo: 'beta_controlada',
      resumen:
        'Análisis documental generado en modo controlado. El sistema extrajo texto del PDF y aplicó reglas básicas para clasificarlo sin enviar información a proveedores externos.',
      tipo_documental_detectado: detectedType,
      sensibilidad_detectada: detectedSensitivity,
      datos_relevantes: buildRelevantData(extractedText, detectedType),
      alertas: buildAlerts(extractedText, detectedSensitivity),
      proximas_acciones: buildNextActions(detectedType),
      fechas_plazos: [],
      texto_extraido_preview: extractedText.slice(0, 1200),
      caracteres_extraidos: extractedText.length,
    };
  }

  const { error: aiInsertError } = await supabase.from('ai_outputs').insert({
    organization_id: profile.organization_id,
    document_id: documentRecord.id,
    case_id: documentRecord.case_id,
    output_type: 'document_analysis',
    content: analysis.resumen,
    model_name: modelName,
    result_json: analysis,
    created_by: user.id,
  });

if (aiInsertError) {
  console.error('AI analysis insert error:', aiInsertError);
  redirect(`/documentos/${documentId}?error=ai_save_failed`);
}

const { error: documentUpdateError } = await supabase
  .from('documents')
  .update({
    document_type: typeToSave,
    sensitivity_level: sensitivityToSave,
  })
  .eq('id', documentRecord.id)
  .eq('organization_id', profile.organization_id);

if (documentUpdateError) {
  console.error('Document metadata update error:', documentUpdateError);
}

await createAuditLog({
  organizationId: profile.organization_id,
  userId: user.id,
  action: 'document_analyzed_beta',
  resourceType: 'document',
  resourceId: documentRecord.id,
  metadata: {
    file_name: documentRecord.file_name,
    model: 'analisis-documental-beta-v1',
    output_type: 'document_analysis',
  },
});

  // --- Indexación semántica (no bloqueante) ---
  const textoParaIndexar =
    extractedText && extractedText.length >= 200
      ? extractedText
      : ia
        ? [
            ia.resumen ?? '',
            (ia.partes ?? []).join('. '),
            (ia.datos_clave ?? []).join('. '),
            (ia.clausulas_riesgos ?? []).join('. '),
            (ia.proximas_acciones ?? []).join('. '),
          ]
            .filter(Boolean)
            .join('\n')
        : '';

  if (textoParaIndexar.trim().length > 0) {
    try {
      const resIndex = await indexarDocumento(supabase, {
        documentId: documentRecord.id,
        organizationId: profile.organization_id,
        texto: textoParaIndexar,
      });
      console.log('Indexación semántica:', resIndex);
    } catch (e) {
      console.error('Indexación semántica falló (no bloqueante):', e);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/documentos');
  revalidatePath(`/documentos/${documentId}`);

  redirect(`/documentos/${documentId}?analysis=beta`);
}
