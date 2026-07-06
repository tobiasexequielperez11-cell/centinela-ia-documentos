// 📝 Biblioteca de modelos de escritos — bases orientativas y editables.
// Las variables se escriben entre llaves dobles, por ejemplo {{nombre_parte}},
// y se detectan y completan solas. Agregá, quitá o editá modelos libremente.

export type ModeloEscrito = {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  cuerpo: string;
};

export const MODELOS: ModeloEscrito[] = [
  {
    id: 'presentacion-generica',
    titulo: 'Escrito de presentación (genérico)',
    categoria: 'Escritos judiciales',
    descripcion: 'Se presenta, acredita personería y constituye domicilios.',
    cuerpo: `Señor Juez:

{{nombre_letrado}}, abogado/a, T° {{tomo}} F° {{folio}}, en mi carácter de letrado/a apoderado/a de {{nombre_parte}}, en los autos caratulados "{{caratula}}" (Expte. N° {{numero_expediente}}), ante V.S. me presento y respetuosamente digo:

I. OBJETO
Que vengo a {{objeto}}.

II. PERSONERÍA
Acredito mi personería con la documentación que acompaño.

III. DOMICILIOS
Constituyo domicilio procesal electrónico en {{domicilio_electronico}} y domicilio físico en {{domicilio_fisico}}.

IV. PETITORIO
Por lo expuesto, a V.S. solicito:
1) Me tenga por presentado/a, por {{parte}} y por constituidos los domicilios.
2) {{peticion}}.

Proveer de conformidad,
SERÁ JUSTICIA.

{{lugar_y_fecha}}
{{nombre_letrado}}`,
  },
  {
    id: 'solicita-tramite',
    titulo: 'Solicita (mero trámite)',
    categoria: 'Escritos judiciales',
    descripcion: 'Escrito breve para pedir una diligencia o providencia.',
    cuerpo: `Señor Juez:

{{nombre_letrado}}, por la parte {{parte}} en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), a V.S. digo:

Que vengo a solicitar {{solicitud}}.

Proveer de conformidad,
SERÁ JUSTICIA.

{{lugar_y_fecha}}`,
  },
  {
    id: 'carta-documento-intimacion',
    titulo: 'Carta documento — intimación de pago',
    categoria: 'Cartas e intimaciones',
    descripcion: 'Intimación fehaciente a pagar una suma bajo apercibimiento legal.',
    cuerpo: `{{lugar_y_fecha}}

Sr./Sra. {{destinatario}}
Domicilio: {{domicilio_destinatario}}

De mi consideración:

En mi carácter de {{caracter_remitente}}, intimo a Ud. a abonar la suma de $ {{monto}} ({{monto_en_letras}}) en concepto de {{concepto}}, dentro del plazo perentorio de {{plazo}} días de recibida la presente.

Vencido dicho plazo sin acreditar el pago, iniciaré las acciones legales que correspondan, con costas a su cargo. Queda Ud. debidamente notificado/a e intimado/a.

{{nombre_remitente}}
{{documento_remitente}}`,
  },
  {
    id: 'autorizacion-compulsar',
    titulo: 'Autorización para compulsar expediente',
    categoria: 'Poderes y autorizaciones',
    descripcion: 'Autoriza a terceros a revisar el expediente y sacar copias.',
    cuerpo: `Señor Juez:

{{nombre_autorizante}}, {{caracter}} en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), a V.S. digo:

Que vengo a autorizar a {{personas_autorizadas}} a compulsar el expediente, extraer fotocopias, retirarlo en préstamo y realizar toda diligencia relacionada, en forma conjunta, alternada o indistinta.

Proveer de conformidad,
SERÁ JUSTICIA.

{{lugar_y_fecha}}
{{nombre_autorizante}}`,
  },
  {
    id: 'contesta-demanda',
    titulo: 'Contesta demanda (genérico)',
    categoria: 'Escritos judiciales',
    descripcion: 'Contesta el traslado, niega hechos y ofrece prueba.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, abogado/a, T° {{tomo}} F° {{folio}}, en representación de la parte demandada {{parte}}, en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), ante V.S. me presento y digo:

I. OBJETO
Que en tiempo y forma vengo a contestar el traslado de la demanda, solicitando su rechazo, con costas.

II. NEGATIVA
Niego todos y cada uno de los hechos que no sean objeto de expreso reconocimiento. En particular, niego: {{hechos_negados}}.

III. REALIDAD DE LOS HECHOS
{{version_hechos}}

IV. PRUEBA
Ofrezco: {{prueba_ofrecida}}.

V. PETITORIO
Solicito se tenga por contestada la demanda y, oportunamente, se la rechace con costas.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'ofrece-prueba',
    titulo: 'Ofrece prueba',
    categoria: 'Escritos judiciales',
    descripcion: 'Ofrecimiento de prueba documental, testimonial, pericial e informativa.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, por la parte {{parte}} en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), a V.S. digo:

Que vengo a ofrecer la siguiente prueba:

I. DOCUMENTAL: {{prueba_documental}}
II. TESTIMONIAL: {{testigos}}
III. PERICIAL: {{pericial}}
IV. INFORMATIVA: {{oficios}}
V. CONFESIONAL: cítese a la contraria a absolver posiciones.

PETITORIO: Solicito se tenga por ofrecida la prueba y se ordene su producción.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'interpone-apelacion',
    titulo: 'Interpone recurso de apelación',
    categoria: 'Escritos judiciales',
    descripcion: 'Apela una resolución dentro del plazo legal.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, por la parte {{parte}} en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), a V.S. digo:

Que vengo a interponer recurso de apelación contra la resolución de fecha {{fecha_resolucion}}, por causar a mi parte un gravamen irreparable.

Solicito se conceda el recurso y se eleven las actuaciones al Superior, expresando agravios en la oportunidad procesal correspondiente.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'beneficio-litigar-sin-gastos',
    titulo: 'Solicita beneficio de litigar sin gastos',
    categoria: 'Escritos judiciales',
    descripcion: 'Promueve el beneficio para litigar sin costo por falta de recursos.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, en representación de {{parte}}, en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), a V.S. digo:

Que vengo a promover beneficio de litigar sin gastos, por carecer mi representado/a de recursos suficientes para afrontar las costas del proceso.

Ofrezco prueba testimonial de {{testigos}} e informativa para acreditar el estado de necesidad.

PETITORIO: Solicito se conceda el beneficio y la exención del pago de tasa de justicia y costas.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'demanda-laboral-despido',
    titulo: 'Demanda laboral por despido (art. 245 LCT)',
    categoria: 'Laboral',
    descripcion: 'Reclama indemnización por despido sin justa causa y rubros adeudados.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, abogado/a, T° {{tomo}} F° {{folio}}, en representación de {{parte}}, con domicilio en {{domicilio_fisico}}, ante V.S. digo:

I. OBJETO
Promuevo demanda laboral contra {{demandado}}, domiciliado/a en {{domicilio_destinatario}}, por la suma de $ {{monto_reclamado}} o lo que en más o menos resulte de la prueba, con intereses y costas.

II. HECHOS
Mi representado/a ingresó el {{fecha_ingreso}}, en la categoría {{categoria_laboral}}, con remuneración de $ {{remuneracion}}. El vínculo se extinguió el {{fecha_egreso}} por despido sin justa causa.

III. RUBROS
Indemnización por antigüedad (art. 245 LCT), preaviso, integración del mes de despido, SAC y vacaciones proporcionales y demás que correspondan.

IV. DERECHO
Ley de Contrato de Trabajo N° 20.744 y concordantes.

V. PRUEBA
{{prueba_ofrecida}}

VI. PETITORIO
Solicito se haga lugar a la demanda, con costas.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'intimacion-laboral-registracion',
    titulo: 'Intimación laboral — registración (Ley 24.013)',
    categoria: 'Laboral',
    descripcion: 'Intima al empleador a registrar correctamente la relación laboral.',
    cuerpo: `{{fecha}}

Sr./Sra. Empleador/a {{destinatario}}
Domicilio: {{domicilio_destinatario}}

Intimo a Ud. en el plazo de 30 días corridos a registrar correctamente mi relación laboral, consignando la real fecha de ingreso {{fecha_ingreso}}, la categoría {{categoria_laboral}} y la remuneración de $ {{remuneracion}}, bajo apercibimiento de las multas previstas en la Ley 24.013 y el art. 80 LCT. Hago reserva de considerarme despedido/a por su exclusiva culpa ante el silencio o la negativa. Remito copia a la AFIP en los términos legales.

{{remitente}}`,
  },
  {
    id: 'demanda-danos-perjuicios',
    titulo: 'Demanda por daños y perjuicios',
    categoria: 'Civil y comercial',
    descripcion: 'Reclama la reparación integral de daños derivados de un hecho.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, en representación de {{parte}}, ante V.S. digo:

I. OBJETO
Promuevo demanda por daños y perjuicios contra {{demandado}}, domiciliado/a en {{domicilio_destinatario}}, por la suma de $ {{monto_reclamado}} o lo que en más o menos resulte de la prueba, con intereses y costas.

II. HECHOS
El día {{fecha_hecho}} ocurrió el siguiente hecho: {{descripcion_hecho}}, que ocasionó a mi mandante los daños que se detallan.

III. RUBROS
Daño emergente, lucro cesante, daño moral y {{otros_rubros}}.

IV. DERECHO
Arts. 1716, 1737, 1740 y concordantes del Código Civil y Comercial.

V. PRUEBA
{{prueba_ofrecida}}

VI. PETITORIO
Solicito se haga lugar a la demanda, con costas.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'demanda-cobro-pesos',
    titulo: 'Demanda por cobro de pesos',
    categoria: 'Civil y comercial',
    descripcion: 'Reclama el pago de una suma adeudada con intereses y costas.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, en representación de {{parte}}, ante V.S. digo:

I. OBJETO
Promuevo demanda por cobro de pesos contra {{demandado}}, domiciliado/a en {{domicilio_destinatario}}, por la suma de $ {{monto_reclamado}}, con intereses y costas.

II. HECHOS
La deuda tiene origen en {{origen_deuda}}, encontrándose vencida e impaga pese a las gestiones realizadas.

III. DERECHO Y PRUEBA
Código Civil y Comercial. Ofrezco: {{prueba_ofrecida}}.

IV. PETITORIO
Solicito se condene al pago del capital, intereses y costas.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'demanda-alimentos',
    titulo: 'Demanda de alimentos',
    categoria: 'Familia',
    descripcion: 'Solicita cuota alimentaria a favor de hijos/as u otros legitimados.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, en representación de {{parte}}, ante V.S. digo:

I. OBJETO
Promuevo demanda de alimentos contra {{demandado}}, domiciliado/a en {{domicilio_destinatario}}, a favor de {{beneficiario}}, solicitando una cuota mensual equivalente a {{cuota_solicitada}}.

II. HECHOS
{{descripcion_hechos}}. Se detallan las necesidades del/de la beneficiario/a y la capacidad económica del/de la demandado/a.

III. DERECHO
Arts. 658 y siguientes del Código Civil y Comercial.

IV. PRUEBA
{{prueba_ofrecida}}

V. PETITORIO
Solicito se fije cuota alimentaria provisoria y, oportunamente, definitiva, con costas.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'inicia-sucesion',
    titulo: 'Inicia juicio sucesorio (ab intestato)',
    categoria: 'Sucesiones',
    descripcion: 'Promueve la sucesión y denuncia herederos y bienes.',
    cuerpo: `Señor Juez:

{{letrado_nombre}}, en representación de {{parte}}, en su carácter de heredero/a de {{causante}}, ante V.S. digo:

I. OBJETO
Vengo a promover el juicio sucesorio ab intestato de {{causante}}, fallecido/a el {{fecha_fallecimiento}}, con último domicilio en {{ultimo_domicilio}}.

II. HEREDEROS
Se denuncian como herederos: {{herederos}}.

III. BIENES
Integran el acervo: {{bienes}}.

IV. PETITORIO
Solicito: 1) Se tenga por iniciada la sucesión; 2) Se ordene la publicación de edictos; 3) Oportunamente, se dicte declaratoria de herederos.

SERÁ JUSTICIA.

{{letrado_nombre}}`,
  },
  {
    id: 'denuncia-venta-automotor',
    titulo: 'Denuncia de venta de automotor',
    categoria: 'Automotor',
    descripcion: 'Nota para denunciar la venta de un vehículo ante el Registro (DNRPA).',
    cuerpo: `Registro Seccional de la Propiedad del Automotor N° {{registro_seccional}}

{{vendedor}}, DNI {{dni_vendedor}}, con domicilio en {{domicilio_fisico}}, en carácter de titular registral del automotor dominio {{dominio}}, marca {{marca}}, modelo {{modelo}}, vengo a DENUNCIAR LA VENTA del vehículo, efectuada el {{fecha_venta}} a favor de {{comprador}}, DNI {{dni_comprador}}.

Solicito se tome razón de la presente a los efectos del art. 27 del Régimen Jurídico del Automotor, cesando mi responsabilidad como titular a partir de la fecha de la venta.

{{vendedor}}`,
  },
  {
    id: 'autoriza-transferencia-automotor',
    titulo: 'Autorización para tramitar transferencia de automotor',
    categoria: 'Automotor',
    descripcion: 'Autoriza a un gestor a realizar el trámite ante el Registro.',
    cuerpo: `AUTORIZACIÓN

{{otorgante}}, DNI {{dni_otorgante}}, con domicilio en {{domicilio_fisico}}, AUTORIZO a {{autorizado}}, DNI {{dni_autorizado}}, a realizar ante el Registro Seccional de la Propiedad del Automotor todos los trámites relacionados con la transferencia del vehículo dominio {{dominio}}, marca {{marca}}, modelo {{modelo}}, incluyendo la presentación y firma de formularios, pago de aranceles y retiro de documentación.

Lugar y fecha: {{lugar_fecha}}

Firma: ____________________
{{otorgante}}`,
  },
  {
    id: 'cd-intimacion-locacion',
    titulo: 'Carta documento — intimación por alquileres',
    categoria: 'Cartas e intimaciones',
    descripcion: 'Intima al inquilino a pagar alquileres bajo apercibimiento de desalojo.',
    cuerpo: `{{fecha}}

Sr./Sra. {{destinatario}}
Domicilio: {{domicilio_destinatario}}

En mi carácter de locador/a del inmueble sito en {{inmueble}}, intimo a Ud. a abonar la suma de $ {{monto_adeudado}} en concepto de alquileres adeudados correspondientes a {{periodos}}, dentro del plazo de {{plazo}} días.

Bajo apercibimiento, en caso de incumplimiento, de iniciar las acciones judiciales de cobro y desalojo por falta de pago, con costas a su cargo. Queda Ud. debidamente intimado/a y notificado/a.

{{remitente}}`,
  },
];

// 🔗 Sugiere el modelo de escrito más adecuado según el tipo de documento
// detectado por la IA. Devuelve null si no hay una sugerencia clara.
export function sugerirModeloPorTipo(
  tipo: string | null | undefined
): ModeloEscrito | null {
  if (!tipo) return null;
  const t = tipo.toLowerCase();

  // Laboral
  if (t.includes('despido') || t.includes('laboral') || t.includes('lct') || t.includes('trabajo')) {
    return MODELOS.find((m) => m.id === 'demanda-laboral-despido') ?? null;
  }
  // Daños / accidentes
  if (t.includes('daño') || t.includes('dano') || t.includes('accidente') || t.includes('siniestro')) {
    return MODELOS.find((m) => m.id === 'demanda-danos-perjuicios') ?? null;
  }
  // Alimentos
  if (t.includes('aliment')) {
    return MODELOS.find((m) => m.id === 'demanda-alimentos') ?? null;
  }
  // Sucesiones
  if (t.includes('sucesi') || t.includes('herencia') || t.includes('fallec') || t.includes('defunci')) {
    return MODELOS.find((m) => m.id === 'inicia-sucesion') ?? null;
  }
  // Locación / alquiler
  if (t.includes('alquiler') || t.includes('locaci') || t.includes('desalojo') || t.includes('inquilin')) {
    return MODELOS.find((m) => m.id === 'cd-intimacion-locacion') ?? null;
  }
  // Automotor
  if (t.includes('automotor') || t.includes('vehic') || t.includes('transferencia') || t.includes('dominio')) {
    return MODELOS.find((m) => m.id === 'autoriza-transferencia-automotor') ?? null;
  }

  // Cartas / intimaciones / reclamos de pago
  if (
    t.includes('carta') ||
    t.includes('intimaci') ||
    t.includes('reclamo') ||
    t.includes('mora') ||
    t.includes('deuda')
  ) {
    return MODELOS.find((m) => m.id === 'carta-documento-intimacion') ?? null;
  }

  // Poderes / autorizaciones
  if (
    t.includes('autorizaci') ||
    t.includes('poder') ||
    t.includes('compuls')
  ) {
    return MODELOS.find((m) => m.id === 'autorizacion-compulsar') ?? null;
  }

  // Actos procesales que suelen requerir una presentación/contestación
  if (
    t.includes('demanda') ||
    t.includes('notificaci') ||
    t.includes('cedula') ||
    t.includes('cédula') ||
    t.includes('traslado') ||
    t.includes('oficio') ||
    t.includes('resoluci') ||
    t.includes('sentencia') ||
    t.includes('providencia')
  ) {
    return MODELOS.find((m) => m.id === 'presentacion-generica') ?? null;
  }

  return null;
}
