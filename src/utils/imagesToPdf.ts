import { Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import { PDFDocument } from "pdf-lib";

const A4_W = 595.28;
const A4_H = 841.89;

function base64ToUint8Array(base64: string): Uint8Array {
  const atobFn = globalThis.atob as ((s: string) => string) | undefined;
  if (!atobFn) {
    throw new Error("Base64 decode is not available in this environment");
  }
  const binary = atobFn(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function readUriAsBytes(uri: string): Promise<Uint8Array> {
  const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });
  return base64ToUint8Array(base64);
}

async function embedRaster(pdfDoc: PDFDocument, bytes: Uint8Array) {
  try {
    return await pdfDoc.embedJpg(bytes);
  } catch {
    return await pdfDoc.embedPng(bytes);
  }
}

/**
 * Builds one PDF page per image (A4, image scaled to fit). JPEG and PNG supported.
 */
export async function buildPdfFromImageUris(
  uris: string[],
): Promise<{ outputUri: string; fileName: string }> {
  if (uris.length === 0) {
    throw new Error("No images to convert");
  }

  const pdfDoc = await PDFDocument.create();

  for (const uri of uris) {
    const bytes = await readUriAsBytes(uri);
    const image = await embedRaster(pdfDoc, bytes);
    const page = pdfDoc.addPage([A4_W, A4_H]);
    const { width: pw, height: ph } = page.getSize();
    const scaled = image.scaleToFit(pw, ph);
    page.drawImage(image, {
      x: (pw - scaled.width) / 2,
      y: (ph - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
    });
  }

  const pdfBase64 = await pdfDoc.saveAsBase64();
  const fileName = `Images_${Date.now()}.pdf`;
  const outputUri = `${Paths.document.uri}${fileName}`;

  await LegacyFileSystem.writeAsStringAsync(outputUri, pdfBase64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });

  return { outputUri, fileName };
}
