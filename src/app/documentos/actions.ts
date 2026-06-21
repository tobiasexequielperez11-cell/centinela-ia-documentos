'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { createAuditLog } from '@/lib/audit/createAuditLog';
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

  if (documentRecord.file_mime_type !== 'application/pdf') {
    redirect(`/documentos/${documentId}?error=only_pdf_supported`);
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

  const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
  const pdfParse = pdfParseModule.default;

  const parsedPdf = await pdfParse(buffer);
  const extractedText = cleanExtractedText(parsedPdf.text || '');

  if (!extractedText) {
    redirect(`/documentos/${documentId}?error=empty_pdf_text`);
  }

  const detectedType = detectDocumentType(
    extractedText,
    documentRecord.document_type
  );

  const detectedSensitivity = detectSensitivity(extractedText);

  const analysis = {
modo: 'beta_controlada',
    resumen:
'Análisis documental generado en modo controlado. El sistema extrajo texto del PDF y aplicó reglas básicas para clasificarlo sin enviar información a proveedores externos.',
    tipo_documental_detectado: detectedType,
    sensibilidad_detectada: detectedSensitivity,
datos_relevantes: buildRelevantData(extractedText, detectedType),
    alertas: buildAlerts(extractedText, detectedSensitivity),
    proximas_acciones: buildNextActions(detectedType),
    texto_extraido_preview: extractedText.slice(0, 1200),
    caracteres_extraidos: extractedText.length,
  };

  const { error: aiInsertError } = await supabase.from('ai_outputs').insert({
    organization_id: profile.organization_id,
    document_id: documentRecord.id,
    case_id: documentRecord.case_id,
    output_type: 'document_analysis',
    content: analysis.resumen,
model_name: 'analisis-documental-beta-v1',
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
    document_type: detectedType,
    sensitivity_level: detectedSensitivity,
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
  revalidatePath('/dashboard');
  revalidatePath('/documentos');
  revalidatePath(`/documentos/${documentId}`);

  redirect(`/documentos/${documentId}?analysis=beta`);
}
