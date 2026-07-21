// src/lib/legal/liquidacion.ts
// Motor de liquidación para el fuero civil/laboral.
// Espeja EXACTAMENTE la matemática de las calculadoras (CalculadorasClient.tsx),
// pero sin React, para poder reusarlo desde el Agente IA (servidor) y la UI.
// Nota: es independiente del "tasador" inmobiliario (src/lib/ai/tasador.ts).

export type MetodoIncapacidad = "mendez" | "vuoto"

export interface IncapacidadInput {
	metodo: MetodoIncapacidad
	ingresoMensual: number // $ mensual de la víctima
	edad: number // años al momento del hecho
	incapacidad: number // porcentaje 0-100
}

export interface IncapacidadResult {
	ok: boolean
	motivo?: string
	metodo: MetodoIncapacidad
	capital: number // indemnización por incapacidad (renta capitalizada)
	ingresoAnualAjustado: number // "a" en la fórmula
	aniosComputables: number // "n"
	tasaDescuento: number // "i"
}

// Vuoto (1978) y Méndez (2008): renta capitalizada.
export function calcularIncapacidad(input: IncapacidadInput): IncapacidadResult {
	const metodo = input.metodo
	const ing = Number(input.ingresoMensual)
	const ed = Math.trunc(Number(input.edad))
	const inc = Number(input.incapacidad) / 100
	const base = {
		metodo,
		capital: 0,
		ingresoAnualAjustado: 0,
		aniosComputables: 0,
		tasaDescuento: 0,
	}
	if (!Number.isFinite(ing) || ing <= 0)
		return { ...base, ok: false, motivo: "ingreso_invalido" }
	if (!Number.isFinite(ed) || ed <= 0)
		return { ...base, ok: false, motivo: "edad_invalida" }
	if (!Number.isFinite(inc) || inc <= 0)
		return { ...base, ok: false, motivo: "incapacidad_invalida" }

	const i = metodo === "mendez" ? 0.04 : 0.06
	const tope = metodo === "mendez" ? 75 : 65
	const n = tope - ed
	if (n <= 0)
		return { ...base, tasaDescuento: i, ok: false, motivo: "edad_supera_tope" }

	let a = ing * 13 * inc
	if (metodo === "mendez") a = a * (60 / ed)
	const Vn = 1 / Math.pow(1 + i, n)
	const capital = (a * (1 - Vn)) / i

	return {
		ok: true,
		metodo,
		capital,
		ingresoAnualAjustado: a,
		aniosComputables: n,
		tasaDescuento: i,
	}
}

export interface InteresInput {
	capital: number
	tasaAnual: number // % anual
	dias: number
}

export interface InteresResult {
	ok: boolean
	motivo?: string
	dias: number
	interes: number
	total: number
}

// Interés simple (igual criterio que la calculadora de intereses judiciales).
export function calcularInteresSimple(input: InteresInput): InteresResult {
	const c = Number(input.capital)
	const t = Number(input.tasaAnual)
	const d = Math.trunc(Number(input.dias))
	if (!Number.isFinite(c) || c <= 0)
		return { ok: false, motivo: "capital_invalido", dias: 0, interes: 0, total: 0 }
	if (!Number.isFinite(t) || t <= 0)
		return { ok: false, motivo: "tasa_invalida", dias: 0, interes: 0, total: 0 }
	if (!Number.isFinite(d) || d <= 0)
		return { ok: false, motivo: "dias_invalidos", dias: 0, interes: 0, total: 0 }
	const interes = c * (t / 100) * (d / 365)
	return { ok: true, dias: d, interes, total: c + interes }
}

// Días entre dos fechas ISO (yyyy-mm-dd), mismo criterio que la calculadora.
export function diasEntre(desdeISO: string, hastaISO: string): number {
	const d1 = new Date(desdeISO)
	const d2 = new Date(hastaISO)
	if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 <= d1) return 0
	return Math.round((d2.getTime() - d1.getTime()) / 86400000)
}

// Tope del art. 730 CCyCN: las costas a cargo del condenado no pueden exceder
// el 25% del monto de la sentencia (capital + intereses).
export const TOPE_730_PORCENTAJE = 25

export function aplicarTope730(montoSentencia: number, costasTotales?: number) {
	const monto = Number(montoSentencia)
	if (!Number.isFinite(monto) || monto <= 0) {
		return { ok: false as const, motivo: "monto_invalido", tope: 0, excede: false }
	}
	const tope = monto * (TOPE_730_PORCENTAJE / 100)
	const excede = typeof costasTotales === "number" && costasTotales > tope
	return { ok: true as const, tope, excede, porcentaje: TOPE_730_PORCENTAJE }
}
