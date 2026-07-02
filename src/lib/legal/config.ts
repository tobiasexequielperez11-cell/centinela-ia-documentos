// ⚖️ Constantes legales — Justicia Nacional / Federal (Argentina)
// ⚠️ Verificar y actualizar periódicamente.
// Fuentes: argentina.gob.ar/jefatura/feriados-nacionales-2026 · csjn.gov.ar · cpacf.org.ar

// Valor de la UMA (Unidad de Medida Arancelaria) — Ley 27.423
export const UMA_VALOR = 98112; // vigente desde 01/04/2026 (Res. CSJN 1352/26)
export const UMA_VIGENCIA = 'abril 2026';

// Tasa de justicia (Ley 23.898) — Nación
export const TASA_JUSTICIA_PORCENTAJE = 3; // % del monto del proceso

// Feriados nacionales (no laborables/judiciales)
export const FERIADOS: string[] = [
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-03-23', '2026-03-24',
  '2026-04-02', '2026-04-03', '2026-05-01', '2026-05-25', '2026-06-15',
  '2026-06-20', '2026-07-09', '2026-07-10', '2026-08-17', '2026-10-12',
  '2026-11-23', '2026-12-07', '2026-12-08', '2026-12-25',
];

// Feria judicial (receso) — Justicia Nacional/Federal, Capital Federal
export const FERIAS_JUDICIALES: Array<{ desde: string; hasta: string; nombre: string }> = [
  { desde: '2026-01-01', hasta: '2026-01-31', nombre: 'Feria de verano 2026' },
  { desde: '2026-07-20', hasta: '2026-07-31', nombre: 'Feria de invierno 2026 (Ac. CSJN 11/2026)' },
];
