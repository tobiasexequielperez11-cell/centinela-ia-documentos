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
  // ⚖️ EJECUCIONES
  {
    id: 'demanda-ejecutiva-pagare',
    titulo: 'Demanda ejecutiva (pagaré / cheque)',
    categoria: 'Ejecuciones',
    descripcion: 'Inicia juicio ejecutivo por un título de crédito vencido.',
    cuerpo: `Señor Juez:

{{abogado}}, abogado/a, T° {{tomo}} F° {{folio}}, en representación de {{parte}}, con domicilio en {{domicilio_fisico}}, ante V.S. digo:

I. OBJETO
Promuevo juicio ejecutivo contra {{destinatario}}, domiciliado/a en {{domicilio_destinatario}}, por el cobro de la suma de $ {{monto_reclamado}}, con más intereses y costas, con fundamento en el título ejecutivo que acompaño ({{titulo}}).

II. HECHOS
El/la demandado/a suscribió el título de fecha {{fecha_titulo}}, con vencimiento el {{fecha_vencimiento}}, que se encuentra vencido, líquido y exigible, sin que se haya obtenido el pago.

III. DERECHO
Arts. 520 y siguientes del Código Procesal Civil y Comercial de la Nación.

IV. PETITORIO
Solicito: 1) Se libre mandamiento de intimación de pago y embargo por la suma reclamada con más lo presupuestado para intereses y costas; 2) Se cite de remate al/a la demandado/a para oponer excepciones; 3) Oportunamente, se dicte sentencia de trance y remate, con costas.

SERÁ JUSTICIA.

{{abogado}}`,
  },
  {
    id: 'prepara-via-ejecutiva',
    titulo: 'Prepara la vía ejecutiva',
    categoria: 'Ejecuciones',
    descripcion: 'Cita a reconocer firma para dejar expedita la ejecución.',
    cuerpo: `Señor Juez:

{{abogado}}, en representación de {{parte}}, ante V.S. digo:

I. OBJETO
Vengo a preparar la vía ejecutiva contra {{destinatario}}, domiciliado/a en {{domicilio_destinatario}}, a fin de que reconozca la firma y la deuda instrumentada en {{documento}}, por la suma de $ {{monto_reclamado}}.

II. DILIGENCIA
Solicito se cite al/a la requerido/a a reconocer firma bajo apercibimiento de tenerla por reconocida (art. 526 CPCCN) en caso de incomparecencia injustificada.

III. PETITORIO
Solicito se ordene la citación y, reconocida o tenida por reconocida la firma, quede expedita la vía ejecutiva.

SERÁ JUSTICIA.

{{abogado}}`,
  },
  // 📮 OFICIOS Y CÉDULAS
  {
    id: 'oficio-ley-22172',
    titulo: 'Oficio Ley 22.172',
    categoria: 'Oficios y cédulas',
    descripcion: 'Oficio a un organismo público con datos del expediente.',
    cuerpo: `OFICIO LEY 22.172

{{lugar_fecha}}

A: {{organismo_destinatario}}
Domicilio: {{domicilio_organismo}}

En los autos caratulados "{{caratula}}" (Expte. N° {{numero_expediente}}), en trámite ante {{juzgado}}, y conforme lo dispuesto por V.S., me dirijo a Ud. a fin de solicitar {{objeto_oficio}}.

Se encuentra autorizado/a para el diligenciamiento del presente {{persona_autorizada}}.

Sirva el presente de atenta nota de estilo.

{{abogado}}`,
  },
  {
    id: 'cedula-notificacion',
    titulo: 'Cédula de notificación',
    categoria: 'Oficios y cédulas',
    descripcion: 'Notifica una resolución al domicilio de la contraparte.',
    cuerpo: `CÉDULA DE NOTIFICACIÓN

Señor/a: {{destinatario}}
Domicilio: {{domicilio_destinatario}}
Carácter del domicilio: {{caracter_domicilio}}

Se hace saber a Ud. que en los autos "{{caratula}}" (Expte. N° {{numero_expediente}}), en trámite ante {{juzgado}}, se ha dictado la siguiente resolución que se transcribe: "{{resolucion}}".

Queda Ud. debidamente notificado/a.

{{lugar_fecha}}
{{abogado}}`,
  },
  // 🏥 AMPARO
  {
    id: 'accion-amparo-salud',
    titulo: 'Acción de amparo (salud)',
    categoria: 'Amparo',
    descripcion: 'Reclama cobertura de salud a una obra social o prepaga.',
    cuerpo: `Señor Juez:

{{abogado}}, en representación de {{parte}}, con domicilio en {{domicilio_fisico}}, ante V.S. digo:

I. OBJETO
Promuevo acción de amparo (art. 43 CN y Ley 16.986) contra {{obra_social_empresa}}, domiciliado/a en {{domicilio_destinatario}}, a fin de que se ordene la cobertura integral e inmediata de {{prestacion_solicitada}}.

II. HECHOS
Mi representado/a padece {{patologia}}, conforme prescripción médica que se acompaña. La demandada ha {{conducta_lesiva}}, lo que pone en riesgo la salud y afecta derechos de raigambre constitucional.

III. DERECHO
Art. 43 de la Constitución Nacional, Ley 16.986, Ley 24.240 y normativa de cobertura obligatoria (PMO).

IV. MEDIDA CAUTELAR
Solicito se ordene cautelarmente la cobertura mientras dure el proceso, dada la urgencia y el peligro en la demora.

V. PETITORIO
Solicito se haga lugar al amparo y se condene a la demandada a otorgar la cobertura, con costas.

SERÁ JUSTICIA.

{{abogado}}`,
  },
  // 👴 PREVISIONAL
  {
    id: 'demanda-reajuste-jubilatorio',
    titulo: 'Demanda de reajuste jubilatorio (ANSES)',
    categoria: 'Previsional',
    descripcion: 'Reclama el reajuste del haber previsional y retroactivos.',
    cuerpo: `Señor Juez:

{{abogado}}, en representación de {{parte}}, con domicilio en {{domicilio_fisico}}, ante V.S. digo:

I. OBJETO
Promuevo demanda contra la ANSES (Administración Nacional de la Seguridad Social) a fin de obtener el reajuste del haber jubilatorio de mi representado/a, beneficio N° {{numero_beneficio}}, con más las diferencias retroactivas e intereses.

II. HECHOS
El haber se encuentra mal liquidado / desactualizado por {{motivo_reajuste}}. Se agotó la vía administrativa mediante {{reclamo_administrativo}}.

III. DERECHO
Ley 24.241, Ley 26.417 (movilidad) y doctrina de la CSJN ("Badaro", "Elliff" y concordantes).

IV. PRUEBA
{{prueba}}

V. PETITORIO
Solicito se ordene el reajuste del haber, el pago de las diferencias retroactivas con intereses y las costas.

SERÁ JUSTICIA.

{{abogado}}`,
  },
  // 🔒 PENAL
  {
    id: 'denuncia-penal',
    titulo: 'Denuncia penal',
    categoria: 'Penal',
    descripcion: 'Pone en conocimiento de la justicia un hecho delictivo.',
    cuerpo: `Señor/a Fiscal / Señor Juez:

{{denunciante}}, DNI {{dni_denunciante}}, con domicilio en {{domicilio_fisico}}, ante Ud. me presento y formulo DENUNCIA PENAL contra {{denunciado}} (o N.N.), por los siguientes hechos:

I. HECHOS
El día {{fecha_hecho}}, en {{lugar_hecho}}, ocurrió lo siguiente: {{relato_hecho}}.

II. CALIFICACIÓN PROVISORIA
Los hechos podrían encuadrar en el delito de {{delito}}, sin perjuicio de la calificación que corresponda.

III. PRUEBA
Ofrezco: {{prueba}}. Testigos: {{testigos}}.

IV. PETITORIO
Solicito se reciba la presente denuncia, se investiguen los hechos y se adopten las medidas que correspondan. Constituyo domicilio en el indicado.

{{denunciante}}`,
  },
  {
    id: 'querella',
    titulo: 'Se constituye en parte querellante',
    categoria: 'Penal',
    descripcion: 'Solicita ser tenido por querellante en una causa penal.',
    cuerpo: `Señor Juez:

{{abogado}}, en representación de {{parte}}, con domicilio en {{domicilio_fisico}}, ante V.S. me presento y digo:

I. OBJETO
Vengo a constituir a mi representado/a en parte QUERELLANTE en la causa "{{caratula}}" (Expte. N° {{numero_expediente}}), contra {{denunciado}}, por el delito de {{delito}}.

II. LEGITIMACIÓN
Mi representado/a resulta damnificado/a directo/a por el hecho, conforme los arts. 82 y siguientes del Código Procesal Penal.

III. HECHOS
{{relato_hecho}}

IV. PRUEBA
{{prueba}}

V. PETITORIO
Solicito: 1) Se lo/la tenga por parte querellante; 2) Se disponga la producción de la prueba ofrecida; 3) Oportunamente, se eleve la causa a juicio.

SERÁ JUSTICIA.

{{abogado}}`,
  },
	// ───────────── CORRIENTES (CPCC Ley 6.556 · plataforma FORUM) ─────────────
	{
		id: 'demanda-danos-corrientes',
		titulo: 'Demanda de daños y perjuicios (Corrientes)',
		categoria: 'Civil y comercial',
		descripcion: 'Demanda por daños y perjuicios ante la Justicia Civil y Comercial de Corrientes (CPCC Ley 6.556, gestión electrónica FORUM).',
		cuerpo: `PROMUEVE DEMANDA POR DAÑOS Y PERJUICIOS

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con el patrocinio letrado del/de la Dr./Dra. {{abogado}}, Tomo {{tomo}} Folio {{folio}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. respetuosamente digo:

I. OBJETO
Vengo a promover formal demanda por daños y perjuicios contra {{demandado}}, con domicilio en {{domicilio_demandado}}, por la suma de $ {{monto}}, o lo que en más o en menos resulte de la prueba a producirse, con más sus intereses y costas.

II. COMPETENCIA
V.S. resulta competente en razón del territorio y la materia, conforme el Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556) y en atención al domicilio del demandado.

III. HECHOS
{{hechos}}

IV. DERECHO
Fundo el derecho en los arts. 1708, 1716, 1717, 1737, 1740 y concordantes del Código Civil y Comercial de la Nación (reparación plena) y en el Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556).

V. RUBROS RECLAMADOS
Daño emergente, lucro cesante, daño moral y demás perjuicios que se acrediten, conforme se liquidará.

VI. PRUEBA
DOCUMENTAL: {{prueba_documental}}. Asimismo se ofrece prueba INFORMATIVA, PERICIAL y TESTIMONIAL conforme se detalla.

VII. PETITORIO
Solicito a V.S.: a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Se corra traslado de la demanda por el plazo de ley; c) Oportunamente se haga lugar a la demanda, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'demanda-alimentos-corrientes',
		titulo: 'Demanda de alimentos (Corrientes)',
		categoria: 'Familia',
		descripcion: 'Demanda de alimentos ante la Justicia de Familia de Corrientes (CPCC Ley 6.556, plataforma FORUM).',
		cuerpo: `PROMUEVE DEMANDA DE ALIMENTOS

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, por derecho propio y/o en representación de {{beneficiario}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Vengo a promover demanda de alimentos contra {{alimentante}}, con domicilio en {{domicilio_demandado}}, a fin de que se fije una cuota alimentaria mensual a favor de {{beneficiario}}, en razón del vínculo de {{vinculo}}.

II. LEGITIMACIÓN Y VÍNCULO
Acredito el título en cuya virtud reclamo con la documentación acompañada: {{documentacion_vinculo}}.

III. HECHOS Y NECESIDADES
{{hechos}}

IV. CAUDAL DEL ALIMENTANTE
Denuncio, siquiera aproximadamente, el caudal económico del alimentante: {{caudal_alimentante}}.

V. CUOTA SOLICITADA Y ALIMENTOS PROVISORIOS
Solicito se fije una cuota alimentaria de $ {{monto_cuota}} mensuales y se establezcan alimentos provisorios, conforme los arts. 541, 542, 544, 548 y concordantes del Código Civil y Comercial de la Nación y el Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556).

VI. PRUEBA
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA y TESTIMONIAL conforme se detalla.

VII. PETITORIO
Solicito a V.S.: a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Se fijen alimentos provisorios; c) Se corra traslado y oportunamente se haga lugar a la demanda, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'demanda-laboral-corrientes',
		titulo: 'Demanda laboral por despido (Corrientes)',
		categoria: 'Laboral',
		descripcion: 'Demanda laboral por despido ante el fuero Laboral de Corrientes (fondo LCT 20.744; procedimiento laboral provincial, gestión FORUM).',
		cuerpo: `PROMUEVE DEMANDA LABORAL

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Vengo a promover demanda laboral contra {{empleador}}, con domicilio en {{domicilio_demandado}}, por la suma de $ {{monto}}, o lo que en más o en menos resulte de la prueba, con más intereses y costas, en concepto de los rubros que se detallan.

II. RELACIÓN LABORAL
Fecha de ingreso: {{fecha_ingreso}}. Fecha de egreso: {{fecha_egreso}}. Categoría: {{categoria_laboral}}. Remuneración: $ {{remuneracion}}. Jornada y modalidad: {{modalidad}}.

III. HECHOS
{{hechos}}

IV. RUBROS RECLAMADOS
{{rubros}} (indemnización por antigüedad, preaviso, integración del mes de despido, SAC y vacaciones proporcionales, y multas que correspondan).

V. DERECHO
Fundo el reclamo en la Ley de Contrato de Trabajo N° 20.744 y normas complementarias, y en las normas del procedimiento laboral vigente en la Provincia de Corrientes.

VI. PRUEBA
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA, PERICIAL CONTABLE y TESTIMONIAL conforme se detalla.

VII. PETITORIO
Solicito a V.S.: a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Se corra traslado de la demanda; c) Oportunamente se haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	// ───────────── BUENOS AIRES (CPCC Dec-Ley 7425/68 · MEV/SCBA) ─────────────
	{
		id: 'demanda-danos-baires',
		titulo: 'Demanda de daños y perjuicios (Prov. Buenos Aires)',
		categoria: 'Civil y comercial',
		descripcion: 'Demanda por daños y perjuicios ante la Justicia Civil y Comercial de la Provincia de Buenos Aires (CPCC Dec-Ley 7425/68, notificación electrónica MEV).',
		cuerpo: `PROMUEVE DEMANDA POR DAÑOS Y PERJUICIOS

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con el patrocinio letrado del/de la Dr./Dra. {{abogado}}, Tomo {{tomo}} Folio {{folio}} C.A.{{colegio}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado en el sistema de notificaciones (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. respetuosamente digo:

I. OBJETO
Vengo a promover demanda por daños y perjuicios contra {{demandado}}, con domicilio en {{domicilio_demandado}}, por la suma de $ {{monto}}, o lo que en más o en menos resulte de la prueba, con más intereses y costas.

II. COMPETENCIA
V.S. resulta competente conforme el Código Procesal Civil y Comercial de la Provincia de Buenos Aires (Decreto-Ley 7425/68) y en atención al domicilio del demandado y/o lugar del hecho.

III. HECHOS
{{hechos}}

IV. DERECHO
Fundo el derecho en los arts. 1708, 1716, 1717, 1737, 1740 y concordantes del Código Civil y Comercial de la Nación, y en el Código Procesal Civil y Comercial de la Provincia de Buenos Aires (Decreto-Ley 7425/68).

V. RUBROS RECLAMADOS
Daño emergente, lucro cesante, daño moral y demás perjuicios que se acrediten.

VI. PRUEBA
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA, PERICIAL y TESTIMONIAL conforme se detalla.

VII. PETITORIO
Solicito a V.S.: a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Se corra traslado de la demanda por el plazo de ley; c) Oportunamente se haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'demanda-alimentos-baires',
		titulo: 'Demanda de alimentos (Prov. Buenos Aires)',
		categoria: 'Familia',
		descripcion: 'Demanda de alimentos ante el Juzgado de Familia de la Provincia de Buenos Aires (art. 635 CPCC t.o. Ley 15.513, con alimentos provisorios y vista al Ministerio Público).',
		cuerpo: `PROMUEVE DEMANDA DE ALIMENTOS

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, por derecho propio y/o en representación de {{beneficiario}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. digo:

I. OBJETO
Vengo a promover demanda de alimentos contra {{alimentante}}, con domicilio en {{domicilio_demandado}}, a favor de {{beneficiario}}, en razón del vínculo de {{vinculo}}, cumpliendo los recaudos del art. 635 del CPCC (t.o. Ley 15.513).

II. TÍTULO / VÍNCULO (art. 635 inc. 1)
Acredito el título con la documentación acompañada: {{documentacion_vinculo}}.

III. CAUDAL DEL ALIMENTANTE (art. 635 inc. 2)
Denuncio, siquiera aproximadamente y por prueba indiciaria, el caudal del alimentante: {{caudal_alimentante}}.

IV. HECHOS Y NECESIDADES
{{hechos}}

V. ALIMENTOS PROVISORIOS Y CUOTA SOLICITADA
Solicito la fijación de alimentos provisorios (art. 636 bis CPCC) y, oportunamente, una cuota alimentaria de $ {{monto_cuota}} mensuales, conforme los arts. 541, 542, 544, 548 y concordantes del Código Civil y Comercial de la Nación.

VI. PRUEBA (art. 635 inc. 4)
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA y TESTIMONIAL (los testigos declararán en la primera audiencia).

VII. PETITORIO
Solicito a V.S.: a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Se fijen alimentos provisorios; c) Se dé la intervención que corresponda al Ministerio Público; d) Oportunamente se haga lugar a la demanda, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'demanda-laboral-baires',
		titulo: 'Demanda laboral por despido (Prov. Buenos Aires)',
		categoria: 'Laboral',
		descripcion: 'Demanda laboral por despido ante los Tribunales del Trabajo de la Provincia de Buenos Aires (Ley 11.653 / 15.057; fondo LCT 20.744).',
		cuerpo: `PROMUEVE DEMANDA LABORAL

Señor Presidente del Tribunal del Trabajo:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.E. digo:

I. OBJETO
Vengo a promover demanda laboral contra {{empleador}}, con domicilio en {{domicilio_demandado}}, por la suma de $ {{monto}}, o lo que en más o en menos resulte de la prueba, con más intereses y costas.

II. COMPETENCIA
El Tribunal resulta competente conforme los arts. 2 y 3 de la Ley 11.653 / 15.057 (domicilio del demandado, lugar de prestación del trabajo o de celebración del contrato).

III. RELACIÓN LABORAL
Fecha de ingreso: {{fecha_ingreso}}. Fecha de egreso: {{fecha_egreso}}. Categoría: {{categoria_laboral}}. Remuneración: $ {{remuneracion}}. Modalidad: {{modalidad}}.

IV. HECHOS
{{hechos}}

V. RUBROS RECLAMADOS
{{rubros}} (indemnización por antigüedad, preaviso, integración del mes de despido, SAC y vacaciones proporcionales, y multas que correspondan).

VI. DERECHO
Fundo el reclamo en la Ley de Contrato de Trabajo N° 20.744 y complementarias, y en la ley de procedimiento laboral de la Provincia de Buenos Aires (Ley 11.653 / 15.057).

VII. PRUEBA
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA, PERICIAL CONTABLE y TESTIMONIAL conforme se detalla.

VIII. PETITORIO
Solicito al Tribunal: a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Se corra traslado de la demanda; c) Oportunamente se haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	// ═══════════ AMPARO DE SALUD ═══════════
	{
		id: 'accion-amparo-salud-corrientes',
		titulo: 'Acción de amparo de salud (Corrientes)',
		categoria: 'Amparo',
		descripcion: 'Amparo de salud ante la Justicia de Corrientes (art. 43 CN y Constitución provincial; sin agotar vía administrativa, doctrina STJ).',
		cuerpo: `INTERPONE ACCIÓN DE AMPARO (SALUD)

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Vengo a interponer acción de amparo contra {{entidad_demandada}}, con domicilio en {{domicilio_demandado}}, a fin de que se ordene el otorgamiento inmediato de {{prestacion}}, prescripta en razón de la patología {{patologia}}, cuya cobertura fue negada o demorada con fecha {{fecha_negativa}}.

II. ADMISIBILIDAD
La acción de amparo es la vía idónea (art. 43 de la Constitución Nacional y normas de amparo de la Constitución de la Provincia de Corrientes), no resultando exigible el previo agotamiento de la vía administrativa conforme la doctrina del Superior Tribunal de Justicia de Corrientes.

III. HECHOS
{{hechos}}

IV. DERECHO
Arts. 42 y 43 CN; derecho a la salud (arts. 14 bis y 75 inc. 22 CN y tratados internacionales); Ley 26.682 de Medicina Prepaga y PMO (Ley 24.754); normas de amparo de la Provincia de Corrientes.

V. MEDIDA CAUTELAR
Solicito medida cautelar innovativa que ordene otorgar la prestación durante el proceso, atento la verosimilitud del derecho y el peligro en la demora.

VI. PRUEBA
DOCUMENTAL: {{prueba_documental}} (historia clínica, prescripción médica, negativa de cobertura). INFORMATIVA y PERICIAL MÉDICA.

VII. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Despache la medida cautelar; c) Corra traslado del amparo; d) Oportunamente haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'accion-amparo-salud-baires',
		titulo: 'Acción de amparo de salud (Prov. Buenos Aires)',
		categoria: 'Amparo',
		descripcion: 'Amparo de salud ante la Justicia de la Provincia de Buenos Aires (Ley 13.928, art. 20 inc. 2 Const. prov.; plazo 30 días).',
		cuerpo: `INTERPONE ACCIÓN DE AMPARO (SALUD)

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}} (C.A. {{colegio_abogados}}), constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. digo:

I. OBJETO
Vengo a interponer acción de amparo contra {{entidad_demandada}}, con domicilio en {{domicilio_demandado}}, a fin de que se ordene el otorgamiento inmediato de {{prestacion}}, prescripta en razón de la patología {{patologia}}, cuya cobertura fue negada o demorada con fecha {{fecha_negativa}}.

II. ADMISIBILIDAD Y PLAZO
La acción se interpone conforme la Ley 13.928 (reglamentaria del art. 20 inc. 2 de la Constitución de la Provincia de Buenos Aires), dentro del plazo de treinta (30) días desde la toma de conocimiento del acto lesivo (art. 5 Ley 13.928, texto Ley 14.192).

III. HECHOS
{{hechos}}

IV. DERECHO
Arts. 42 y 43 CN; art. 20 inc. 2 Const. Prov. Bs As; Ley 13.928; derecho a la salud (arts. 14 bis y 75 inc. 22 CN); Ley 26.682 y PMO (Ley 24.754).

V. MEDIDA CAUTELAR
Solicito medida cautelar innovativa que ordene otorgar la prestación durante el proceso, atento la verosimilitud del derecho y el peligro en la demora.

VI. PRUEBA
DOCUMENTAL: {{prueba_documental}} (historia clínica, prescripción médica, negativa de cobertura). INFORMATIVA y PERICIAL MÉDICA.

VII. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Despache la medida cautelar; c) Corra traslado del amparo; d) Oportunamente haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	// ═══════════ EJECUCIONES ═══════════
	{
		id: 'demanda-ejecutiva-corrientes',
		titulo: 'Demanda ejecutiva / juicio ejecutivo (Corrientes)',
		categoria: 'Ejecuciones',
		descripcion: 'Juicio ejecutivo por pagaré u otro título ante la Justicia de Corrientes (Dec-Ley 5965/63; CPCC Ley 6.556).',
		cuerpo: `PROMUEVE JUICIO EJECUTIVO

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Promuevo juicio ejecutivo contra {{demandado}}, con domicilio en {{domicilio_demandado}}, por el cobro de la suma de $ {{monto}}, con más intereses y costas.

II. TÍTULO EJECUTIVO
El crédito consta en {{titulo}}, con vencimiento el {{fecha_vencimiento}}, que reúne los recaudos del Decreto-Ley 5965/63 y constituye título ejecutivo hábil que se acompaña en original.

III. DERECHO
Decreto-Ley 5965/63 y normas del juicio ejecutivo del Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556).

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}} (título original).

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Libre mandamiento de intimación de pago y embargo por capital, intereses y costas; c) Cite de remate al ejecutado; d) Oportunamente dicte sentencia de trance y remate, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'demanda-ejecutiva-baires',
		titulo: 'Demanda ejecutiva / juicio ejecutivo (Prov. Buenos Aires)',
		categoria: 'Ejecuciones',
		descripcion: 'Juicio ejecutivo por pagaré u otro título ante la Justicia de la Provincia de Buenos Aires (Dec-Ley 5965/63; CPCC 7425/68).',
		cuerpo: `PROMUEVE JUICIO EJECUTIVO

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}} (C.A. {{colegio_abogados}}), constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. digo:

I. OBJETO
Promuevo juicio ejecutivo contra {{demandado}}, con domicilio en {{domicilio_demandado}}, por el cobro de la suma de $ {{monto}}, con más intereses y costas.

II. TÍTULO EJECUTIVO
El crédito consta en {{titulo}}, con vencimiento el {{fecha_vencimiento}}, que reúne los recaudos del Decreto-Ley 5965/63 y constituye título ejecutivo hábil que se acompaña en original.

III. DERECHO
Decreto-Ley 5965/63 y normas del juicio ejecutivo del Código Procesal Civil y Comercial de la Provincia de Buenos Aires (Decreto-Ley 7425/68).

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}} (título original).

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Libre mandamiento de intimación de pago y embargo por capital, intereses y costas; c) Cite de remate al ejecutado; d) Oportunamente dicte sentencia de trance y remate, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	// ═══════════ DESALOJO POR FALTA DE PAGO ═══════════
	{
		id: 'desalojo-falta-pago-corrientes',
		titulo: 'Demanda de desalojo por falta de pago (Corrientes)',
		categoria: 'Civil y comercial',
		descripcion: 'Desalojo por falta de pago ante la Justicia de Corrientes (art. 1219 CCyCN; CPCC Ley 6.556).',
		cuerpo: `PROMUEVE DEMANDA DE DESALOJO POR FALTA DE PAGO

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Promuevo demanda de desalojo por falta de pago contra {{demandado}}, con domicilio en {{domicilio_demandado}}, respecto del inmueble sito en {{inmueble}}, a fin de que se lo condene a desocuparlo y restituirlo.

II. HECHOS
Las partes celebraron contrato de locación por un canon mensual de $ {{canon}}. El locatario adeuda los períodos {{periodos_adeudados}}, configurándose la causal de falta de pago. {{hechos}}

III. DERECHO
Art. 1219 y concordantes del Código Civil y Comercial de la Nación y normas del proceso de desalojo del Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556).

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}} (contrato de locación, recibos, intimación de pago). INFORMATIVA y TESTIMONIAL.

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Corra traslado de la demanda; c) Oportunamente haga lugar, condenando a la desocupación y restitución del inmueble bajo apercibimiento de lanzamiento, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'desalojo-falta-pago-baires',
		titulo: 'Demanda de desalojo por falta de pago (Prov. Buenos Aires)',
		categoria: 'Civil y comercial',
		descripcion: 'Desalojo por falta de pago ante la Justicia de la Provincia de Buenos Aires, con desocupación inmediata (arts. 676 bis/ter CPCC, Ley 14.220).',
		cuerpo: `PROMUEVE DEMANDA DE DESALOJO POR FALTA DE PAGO

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}} (C.A. {{colegio_abogados}}), constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. digo:

I. OBJETO
Promuevo demanda de desalojo por falta de pago contra {{demandado}}, con domicilio en {{domicilio_demandado}}, respecto del inmueble sito en {{inmueble}}, a fin de que se lo condene a desocuparlo y restituirlo.

II. HECHOS
Las partes celebraron contrato de locación por un canon mensual de $ {{canon}}. El locatario adeuda los períodos {{periodos_adeudados}}, configurándose la causal de falta de pago. {{hechos}}

III. DESOCUPACIÓN INMEDIATA
Atento la causal de falta de pago, solicito la desocupación inmediata del inmueble bajo caución real, conforme los arts. 676 bis y 676 ter del CPCC de la Provincia de Buenos Aires (texto Ley 14.220).

IV. DERECHO
Art. 1219 y concordantes del Código Civil y Comercial de la Nación y arts. 676 y ss. del Código Procesal Civil y Comercial de la Provincia de Buenos Aires (Decreto-Ley 7425/68).

V. PRUEBA
DOCUMENTAL: {{prueba_documental}} (contrato de locación, recibos, intimación de pago). INFORMATIVA y TESTIMONIAL.

VI. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Despache la desocupación inmediata bajo caución; c) Corra traslado de la demanda; d) Oportunamente haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	// ═══════════ SUCESIONES ═══════════
	{
		id: 'sucesion-corrientes',
		titulo: 'Inicia juicio sucesorio (Corrientes)',
		categoria: 'Sucesiones',
		descripcion: 'Apertura de sucesión ante la Justicia de Corrientes (último domicilio del causante, art. 2336 CCyCN; CPCC Ley 6.556).',
		cuerpo: `PROMUEVE JUICIO SUCESORIO

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Promuevo el juicio sucesorio de {{causante}}, fallecido/a el {{fecha_fallecimiento}}, cuyo último domicilio se encontraba en {{ultimo_domicilio_causante}}, en mi carácter de {{vinculo_heredero}}.

II. COMPETENCIA
V.S. resulta competente por corresponder al último domicilio del causante (art. 2336 del Código Civil y Comercial de la Nación) y conforme el Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556).

III. BIENES
Se denuncian los siguientes bienes: {{bienes}}.

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}} (partida de defunción, partidas que acreditan el vínculo, títulos de los bienes).

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Tenga por iniciado el sucesorio; c) Ordene la publicación de edictos citando a herederos y acreedores; d) Oportunamente dicte declaratoria de herederos.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'sucesion-baires',
		titulo: 'Inicia juicio sucesorio (Prov. Buenos Aires)',
		categoria: 'Sucesiones',
		descripcion: 'Apertura de sucesión ante la Justicia de la Provincia de Buenos Aires (último domicilio del causante, art. 2336 CCyCN; CPCC 7425/68).',
		cuerpo: `PROMUEVE JUICIO SUCESORIO

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}} (C.A. {{colegio_abogados}}), constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. digo:

I. OBJETO
Promuevo el juicio sucesorio de {{causante}}, fallecido/a el {{fecha_fallecimiento}}, cuyo último domicilio se encontraba en {{ultimo_domicilio_causante}}, en mi carácter de {{vinculo_heredero}}.

II. COMPETENCIA
V.S. resulta competente por corresponder al último domicilio del causante (art. 2336 del Código Civil y Comercial de la Nación) y conforme el Código Procesal Civil y Comercial de la Provincia de Buenos Aires (Decreto-Ley 7425/68).

III. BIENES
Se denuncian los siguientes bienes: {{bienes}}.

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}} (partida de defunción, partidas que acreditan el vínculo, títulos de los bienes).

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Tenga por iniciado el sucesorio; c) Ordene la publicación de edictos citando a herederos y acreedores; d) Oportunamente dicte declaratoria de herederos.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	// ═══════════ COBRO ORDINARIO DE PESOS ═══════════
	{
		id: 'cobro-pesos-ordinario-corrientes',
		titulo: 'Demanda ordinaria por cobro de pesos (Corrientes)',
		categoria: 'Civil y comercial',
		descripcion: 'Cobro de pesos por proceso de conocimiento ante la Justicia de Corrientes (CCyCN; CPCC Ley 6.556).',
		cuerpo: `PROMUEVE DEMANDA POR COBRO DE PESOS

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico en la plataforma FORUM (CUIF {{cuif}}), a V.S. digo:

I. OBJETO
Promuevo demanda por cobro de pesos contra {{demandado}}, con domicilio en {{domicilio_demandado}}, por la suma de $ {{monto}}, con más intereses y costas.

II. HECHOS Y ORIGEN DE LA DEUDA
La deuda reclamada tiene origen en {{origen_deuda}}. {{hechos}}

III. DERECHO
Arts. 724, 725, 726, 730, 765 y concordantes del Código Civil y Comercial de la Nación y normas del proceso de conocimiento del Código Procesal Civil y Comercial de la Provincia de Corrientes (Ley N° 6.556).

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA, PERICIAL y TESTIMONIAL.

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Corra traslado de la demanda; c) Oportunamente haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
	{
		id: 'cobro-pesos-ordinario-baires',
		titulo: 'Demanda ordinaria por cobro de pesos (Prov. Buenos Aires)',
		categoria: 'Civil y comercial',
		descripcion: 'Cobro de pesos por proceso de conocimiento ante la Justicia de la Provincia de Buenos Aires (CCyCN; CPCC 7425/68).',
		cuerpo: `PROMUEVE DEMANDA POR COBRO DE PESOS

Señor Juez:

{{nombre_parte}}, DNI N° {{dni_parte}}, con domicilio real en {{domicilio_real_parte}}, con patrocinio letrado del/de la Dr./Dra. {{abogado}} (C.A. {{colegio_abogados}}), constituyendo domicilio procesal en {{domicilio_procesal}} y domicilio electrónico registrado (SCBA), Departamento Judicial de {{departamento_judicial}}, a V.S. digo:

I. OBJETO
Promuevo demanda por cobro de pesos contra {{demandado}}, con domicilio en {{domicilio_demandado}}, por la suma de $ {{monto}}, con más intereses y costas.

II. HECHOS Y ORIGEN DE LA DEUDA
La deuda reclamada tiene origen en {{origen_deuda}}. {{hechos}}

III. DERECHO
Arts. 724, 725, 726, 730, 765 y concordantes del Código Civil y Comercial de la Nación y normas del proceso de conocimiento del Código Procesal Civil y Comercial de la Provincia de Buenos Aires (Decreto-Ley 7425/68).

IV. PRUEBA
DOCUMENTAL: {{prueba_documental}}. INFORMATIVA, PERICIAL y TESTIMONIAL.

V. PETITORIO
a) Me tenga por presentado, por parte y por constituidos los domicilios; b) Corra traslado de la demanda; c) Oportunamente haga lugar, con costas.

Proveer de conformidad, SERÁ JUSTICIA.

{{localidad}}, {{fecha}}.`,
	},
  // ─────────────────────────────────────────────
  // 🗂️ MERO TRÁMITE (alta frecuencia)
  // ─────────────────────────────────────────────
  {
    id: 'acompana-documentacion',
    titulo: 'Acompaña documentación',
    categoria: 'Escritos judiciales',
    descripcion: 'Agrega documental a la causa y solicita su incorporación con traslado.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, por la parte que represento, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos caratulados «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
Que vengo por el presente a acompañar la siguiente documentación: {{documentacion}}.
Se agrega en {{cantidad_copias}} juego(s) de copias para su traslado a la contraria.
Por lo expuesto, a V.S. solicito:
1) Se tenga por acompañada la documentación referida y por agregada a los autos.
2) Se corra el traslado de ley.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'toma-vista',
    titulo: 'Toma vista de las actuaciones',
    categoria: 'Escritos judiciales',
    descripcion: 'Solicita tomar vista del expediente y su remisión al domicilio electrónico.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
Que vengo a tomar vista de las presentes actuaciones en su totalidad, solicitando —en su caso— la remisión digital de las mismas al domicilio electrónico constituido, a fin de tomar conocimiento del estado de la causa.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'solicita-copias-desarchivo',
    titulo: 'Solicita copias / desarchivo',
    categoria: 'Escritos judiciales',
    descripcion: 'Pide copias de piezas del expediente y/o el desarchivo de la causa.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
Que solicito se me expidan copias {{tipo_copias}} de las siguientes piezas: {{piezas_solicitadas}}.
Asimismo, y para el caso de encontrarse archivadas las actuaciones, solicito su desarchivo a fin de proseguir con el trámite de la causa.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'denuncia-nuevo-domicilio',
    titulo: 'Denuncia / constituye nuevo domicilio',
    categoria: 'Escritos judiciales',
    descripcion: 'Denuncia nuevo domicilio real y constituye nuevo domicilio procesal.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
Que vengo a denunciar el nuevo domicilio real de mi parte, sito en {{domicilio_real}}, y a constituir nuevo domicilio procesal en {{domicilio_procesal}}, solicitando se tomen las constancias pertinentes y se dirijan a él las futuras notificaciones.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'urge-pronto-despacho',
    titulo: 'Urge pronto despacho',
    categoria: 'Escritos judiciales',
    descripcion: 'Reitera un pedido pendiente de resolución y solicita despacho urgente.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
Que atento al tiempo transcurrido desde la presentación de fecha {{fecha_presentacion}}, sin que haya recaído resolución respecto de lo allí peticionado, vengo a urgir el pronto despacho de las actuaciones, solicitando se provea con carácter urgente lo requerido, en resguardo del derecho de defensa y del principio de celeridad procesal.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'acusa-rebeldia',
    titulo: 'Acusa rebeldía',
    categoria: 'Escritos judiciales',
    descripcion: 'Acusa la rebeldía de la contraria vencido el plazo para comparecer/contestar.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
Que encontrándose vencido el plazo acordado a la parte demandada, {{demandado}}, para comparecer y/o contestar la demanda, sin que lo haya hecho, vengo a acusar su rebeldía en los términos de los arts. 59 y concordantes del CPCCN.
En consecuencia, solicito:
1) Se declare la rebeldía de la demandada.
2) Se disponga la prosecución del trámite, con las presunciones que la rebeldía implica (art. 60 CPCCN).
3) Se notifique la resolución en el domicilio denunciado.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  // ─────────────────────────────────────────────
  // 🛡️ MEDIDAS CAUTELARES
  // ─────────────────────────────────────────────
  {
    id: 'solicita-embargo-preventivo',
    titulo: 'Solicita embargo preventivo',
    categoria: 'Medidas cautelares',
    descripcion: 'Pide embargo preventivo acreditando verosimilitud, peligro en la demora y contracautela.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
I. OBJETO. Que vengo a solicitar se decrete EMBARGO PREVENTIVO sobre {{bienes_a_embargar}} de titularidad de {{demandado}}, hasta cubrir la suma de $ {{monto}}, con más lo que se presupueste para responder a intereses y costas.
II. VEROSIMILITUD DEL DERECHO. {{verosimilitud_derecho}} (arts. 195 y 209 CPCCN).
III. PELIGRO EN LA DEMORA. {{peligro_demora}}.
IV. CONTRACAUTELA. Ofrezco caución {{tipo_caucion}}, en los términos del art. 199 CPCCN.
V. PETITORIO. Por lo expuesto, solicito a V.S.:
1) Tenga por promovido el pedido de medida cautelar.
2) Decrete el embargo preventivo solicitado, librando los oficios y/o mandamientos pertinentes.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'solicita-prohibicion-innovar',
    titulo: 'Solicita prohibición de innovar',
    categoria: 'Medidas cautelares',
    descripcion: 'Pide mantener el statu quo de una situación de hecho o de derecho (art. 230 CPCCN).',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
I. OBJETO. Que vengo a solicitar se decrete PROHIBICIÓN DE INNOVAR, ordenando a {{demandado}} abstenerse de modificar la situación de hecho o de derecho relativa a {{objeto_cautela}}, hasta tanto se resuelva la cuestión de fondo (art. 230 CPCCN).
II. VEROSIMILITUD DEL DERECHO. {{verosimilitud_derecho}}.
III. PELIGRO EN LA DEMORA. {{peligro_demora}}: de alterarse la situación actual se tornaría ineficaz o de imposible cumplimiento la eventual sentencia favorable.
IV. INEXISTENCIA DE OTRA MEDIDA. La medida requerida es la vía idónea, no pudiendo obtenerse igual resultado por otra cautelar.
V. CONTRACAUTELA. Ofrezco caución {{tipo_caucion}} (art. 199 CPCCN).
VI. PETITORIO. Solicito se decrete la medida y se libren las comunicaciones que correspondan.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'solicita-anotacion-litis',
    titulo: 'Solicita anotación de litis',
    categoria: 'Medidas cautelares',
    descripcion: 'Pide anotar la existencia del juicio sobre un bien registrable (art. 229 CPCCN).',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, en los autos «{{caratula}}» (Expte. N° {{numero_expediente}}), a V.S. digo:
I. OBJETO. Que vengo a solicitar se ordene la ANOTACIÓN DE LITIS sobre el bien {{bien_registrable}}, inscripto a nombre de {{demandado}}, a fin de dar publicidad de la existencia del presente juicio frente a terceros (art. 229 CPCCN).
II. VEROSIMILITUD DEL DERECHO. {{verosimilitud_derecho}}, encontrándose el bien directamente vinculado al objeto del litigio.
III. PROCEDENCIA. La medida no impide la disponibilidad del bien, sino que publicita la controversia, resguardando el derecho de mi parte.
IV. CONTRACAUTELA. Ofrezco caución {{tipo_caucion}} (art. 199 CPCCN).
V. PETITORIO. Solicito se decrete la anotación de litis y se libre el oficio pertinente al Registro correspondiente.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  // ─────────────────────────────────────────────
  // 👨👩👧 FAMILIA
  // ─────────────────────────────────────────────
  {
    id: 'divorcio-convenio-regulador',
    titulo: 'Demanda de divorcio con convenio regulador',
    categoria: 'Familia',
    descripcion: 'Promueve el divorcio (art. 437/438 CCyCN) acompañando propuesta reguladora.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Que vengo a promover DEMANDA DE DIVORCIO respecto de mi cónyuge, {{conyuge_demandado}}, con domicilio en {{domicilio_demandado}}, en los términos de los arts. 437 y 438 del CCyCN.
II. MATRIMONIO. Contraje matrimonio con el/la nombrado/a el día {{fecha_matrimonio}}, conforme acta de matrimonio que se acompaña.
III. HIJOS. {{datos_hijos}}.
IV. PROPUESTA REGULADORA (art. 438 CCyCN). Acompaño propuesta que regula los efectos del divorcio, contemplando: {{propuesta_reguladora}} (atribución de la vivienda, cuidado personal y régimen de comunicación de los hijos, alimentos, y liquidación de la comunidad de bienes, según corresponda).
V. PRUEBA. Acta de matrimonio; actas de nacimiento de los hijos; DNI; y demás documentación acompañada.
VI. DERECHO. Arts. 437, 438 y concordantes del CCyCN.
VII. PETITORIO. Solicito a V.S.:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal.
2) Corra traslado de la propuesta reguladora a la contraria.
3) Oportunamente decrete el divorcio y homologue el convenio regulador.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'regimen-comunicacion-cuidado',
    titulo: 'Régimen de comunicación / cuidado personal',
    categoria: 'Familia',
    descripcion: 'Solicita fijar régimen de comunicación y/o cuidado personal de hijos (arts. 652-655 CCyCN).',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Que vengo a promover demanda a fin de que se establezca RÉGIMEN DE COMUNICACIÓN y/o CUIDADO PERSONAL respecto de mi hijo/a {{nombre_hijo}}, en relación con el otro progenitor, {{demandado}}, con domicilio en {{domicilio_demandado}}.
II. HECHOS. {{hechos}}.
III. INTERÉS SUPERIOR DEL NIÑO. La medida se funda en el interés superior del niño (art. 3 CDN; arts. 639, 706 CCyCN), garantizando el vínculo con ambos progenitores.
IV. RÉGIMEN PROPUESTO. Propongo el siguiente régimen: {{regimen_propuesto}}.
V. DERECHO. Arts. 641, 648, 652, 653, 655 y concordantes del CCyCN.
VI. PETITORIO. Solicito se cite a audiencia, se dé intervención al Ministerio Público y, oportunamente, se homologue o fije el régimen solicitado.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'homologacion-convenio',
    titulo: 'Solicita homologación de convenio',
    categoria: 'Familia',
    descripcion: 'Pide homologar un acuerdo (alimentos, comunicación, etc.) confiriéndole fuerza ejecutoria.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Que vengo a solicitar la HOMOLOGACIÓN del convenio celebrado con {{otra_parte}} en fecha {{fecha_convenio}}, cuyo texto se acompaña.
II. CONTENIDO. El convenio regula: {{contenido_convenio}}.
III. FUNDAMENTO. Las partes han arribado a un acuerdo que no afecta el orden público ni derechos indisponibles, resultando procedente su homologación a fin de dotarlo de fuerza ejecutoria.
IV. PETITORIO. Solicito a V.S.:
1) Tenga por acompañado el convenio.
2) Dé intervención al Ministerio Público, si correspondiere.
3) Homologue el acuerdo, confiriéndole fuerza de sentencia.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'medidas-proteccion-violencia',
    titulo: 'Solicita medidas de protección (violencia familiar)',
    categoria: 'Familia',
    descripcion: 'Denuncia y pide medidas urgentes de protección (Ley 26.485 y Ley 24.417).',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Que vengo a denunciar hechos de violencia y a solicitar MEDIDAS DE PROTECCIÓN URGENTES en el marco de la Ley 26.485 y de la Ley 24.417, respecto de {{denunciado}}, con domicilio en {{domicilio_denunciado}}.
II. HECHOS. {{hechos}}.
III. MEDIDAS SOLICITADAS. Solicito se dispongan, con carácter urgente y sin necesidad de audiencia previa: {{medidas_solicitadas}} (v.gr. prohibición de acercamiento y de contacto por cualquier medio; exclusión del hogar; cese de actos de perturbación o intimidación; prohibición de compra y tenencia de armas; y toda otra que V.S. estime pertinente).
IV. DERECHO. Arts. 26 y ss. de la Ley 26.485; Ley 24.417; art. 3 CDN.
V. PETITORIO. Solicito se adopten de inmediato las medidas requeridas, dada la urgencia y el riesgo, y se dé intervención al equipo interdisciplinario y al Ministerio Público.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  // ─────────────────────────────────────────────
  // 💼 LABORAL / 🛒 CONSUMIDOR
  // ─────────────────────────────────────────────
  {
    id: 'demanda-diferencias-salariales',
    titulo: 'Demanda laboral por diferencias salariales',
    categoria: 'Laboral',
    descripcion: 'Reclama diferencias de haberes, rubros y horas adeudadas conforme LCT y CCT.',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Promuevo demanda laboral por cobro de DIFERENCIAS SALARIALES contra {{empleador}}, con domicilio en {{domicilio_empleador}}, por la suma de $ {{monto}}, con más intereses y costas.
II. RELACIÓN LABORAL. Ingresé a trabajar el {{fecha_ingreso}}, desempeñando la categoría {{categoria_laboral}}, con una remuneración mensual de $ {{remuneracion}}, bajo el CCT {{convenio_colectivo}}.
III. DIFERENCIAS RECLAMADAS. {{diferencias_reclamadas}} (v.gr. haberes abonados por debajo del convenio, rubros no liquidados, horas extra impagas, diferencias de categoría). Liquidación practicada: {{detalle_liquidacion}}.
IV. INTIMACIÓN PREVIA. Se intimó al empleador conforme constancias que se acompañan, sin obtener respuesta favorable.
V. DERECHO. Arts. 103, 116, 196, 260 y concordantes de la LCT (Ley 20.744) y CCT aplicable.
VI. PRUEBA. Documental, pericial contable, testimonial e informativa.
VII. PETITORIO. Solicito se tenga por promovida la demanda, se corra traslado y, oportunamente, se condene al pago de las diferencias reclamadas con más intereses y costas.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'demanda-accidente-art',
    titulo: 'Demanda por accidente de trabajo / ART',
    categoria: 'Laboral',
    descripcion: 'Reclama prestaciones por accidente o enfermedad profesional (Ley 24.557 y 27.348).',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Promuevo demanda por ACCIDENTE DE TRABAJO / ENFERMEDAD PROFESIONAL contra {{aseguradora}} (Aseguradora de Riesgos del Trabajo) y/o {{empleador}}, por la suma de $ {{monto}}, con más intereses y costas.
II. RELACIÓN LABORAL. Ingresé el {{fecha_ingreso}}, desempeñando la categoría {{categoria_laboral}}, con remuneración de $ {{remuneracion}}.
III. HECHOS DEL SINIESTRO. El día {{fecha_siniestro}}, {{hechos_siniestro}}.
IV. INCAPACIDAD. A raíz del hecho sufrí las siguientes lesiones: {{lesiones}}, con una incapacidad estimada del {{porcentaje_incapacidad}} % de la T.O.
V. INSTANCIA ADMINISTRATIVA. {{estado_comision_medica}} (trámite ante la Comisión Médica, conf. Ley 27.348).
VI. DERECHO. Ley 24.557 y modif., Ley 27.348; en su caso, acción civil (arts. 1716, 1737, 1749 CCyCN).
VII. PRUEBA. Pericial médica, documental, testimonial e informativa.
VIII. PETITORIO. Solicito se tenga por promovida la demanda, se corra traslado y, oportunamente, se condene al pago de las prestaciones e indemnizaciones que correspondan.
Proveer de conformidad,
SERÁ JUSTICIA.`,
  },
  {
    id: 'demanda-danos-consumo',
    titulo: 'Demanda por daños — relación de consumo',
    categoria: 'Civil y comercial',
    descripcion: 'Reclama daños derivados de una relación de consumo, con daño punitivo (Ley 24.240).',
    cuerpo: `Señor Juez:
{{nombre_parte}}, con el patrocinio letrado del Dr./Dra. {{abogado}}, constituyendo domicilio procesal en {{domicilio_procesal}}, a V.S. digo:
I. OBJETO. Promuevo demanda por DAÑOS Y PERJUICIOS derivados de una RELACIÓN DE CONSUMO contra {{proveedor}}, con domicilio en {{domicilio_proveedor}}, por la suma de $ {{monto}}, o lo que en más o en menos resulte de la prueba, con más intereses y costas.
II. RELACIÓN DE CONSUMO. Revisto la calidad de consumidor en los términos de los arts. 1 y 2 de la Ley 24.240 y art. 1092 del CCyCN.
III. HECHOS. {{hechos}}.
IV. RUBROS RECLAMADOS. Daño emergente, daño moral y DAÑO PUNITIVO (art. 52 bis, Ley 24.240): {{detalle_rubros}}.
V. DERECHO. Ley 24.240 (arts. 8 bis, 40, 52 bis, 53); arts. 1092 y ss. CCyCN. Invoco el beneficio de gratuidad (art. 53) y la carga dinámica probatoria en cabeza del proveedor.
VI. PRUEBA. Documental, pericial, testimonial e informativa.
VII. PETITORIO. Solicito se tenga por promovida la demanda, se corra traslado y, oportunamente, se condene al pago de los rubros reclamados con más intereses y costas.
Proveer de conformidad,
SERÁ JUSTICIA.`,
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

  // Ejecuciones / títulos de crédito
  if (t.includes('ejecut') || t.includes('pagar') || t.includes('cheque') || t.includes('pagaré') || t.includes('título') || t.includes('titulo ejecutivo')) {
    return MODELOS.find((m) => m.id === 'demanda-ejecutiva-pagare') ?? null;
  }
  // Amparo / salud
  if (t.includes('amparo') || t.includes('salud') || t.includes('obra social') || t.includes('prepaga') || t.includes('cobertura')) {
    return MODELOS.find((m) => m.id === 'accion-amparo-salud') ?? null;
  }
  // Previsional / ANSES
  if (t.includes('jubilaci') || t.includes('previsional') || t.includes('anses') || t.includes('reajuste') || t.includes('haber') || t.includes('pension')) {
    return MODELOS.find((m) => m.id === 'demanda-reajuste-jubilatorio') ?? null;
  }
  // Penal
  if (t.includes('penal') || t.includes('denuncia') || t.includes('delito') || t.includes('querella') || t.includes('robo') || t.includes('hurto') || t.includes('estafa')) {
    return MODELOS.find((m) => m.id === 'denuncia-penal') ?? null;
  }
  // Oficios
  if (t.includes('oficio')) {
    return MODELOS.find((m) => m.id === 'oficio-ley-22172') ?? null;
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
