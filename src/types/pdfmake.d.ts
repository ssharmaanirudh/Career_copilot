declare module "pdfmake" {
  interface PdfMakeFontDescriptor {
    normal?: string | Buffer;
    bold?: string | Buffer;
    italics?: string | Buffer;
    bolditalics?: string | Buffer;
  }

  interface PdfMakeOutputDocument {
    getBuffer(): Promise<Buffer>;
  }

  interface PdfMakeInstance {
    setFonts(fonts: Record<string, PdfMakeFontDescriptor>): void;
    setUrlAccessPolicy(callback: (url: string) => boolean): void;
    setLocalAccessPolicy(callback: (path: string) => boolean): void;
    createPdf(
      docDefinition: Record<string, unknown>,
      options?: Record<string, unknown>,
    ): PdfMakeOutputDocument;
  }

  const pdfMake: PdfMakeInstance;
  export default pdfMake;
}
