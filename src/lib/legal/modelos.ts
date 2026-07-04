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
];
