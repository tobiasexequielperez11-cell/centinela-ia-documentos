declare module 'pdf-parse' {
  interface PdfParseResult {
    text: string;
    numpages?: number;
    info?: unknown;
    metadata?: unknown;
  }

  const pdfParse: (dataBuffer: Buffer | Uint8Array) => Promise<PdfParseResult>;

  export default pdfParse;
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseResult {
    text: string;
    numpages?: number;
    info?: unknown;
    metadata?: unknown;
  }

  const pdfParse: (dataBuffer: Buffer | Uint8Array) => Promise<PdfParseResult>;

  export default pdfParse;
}