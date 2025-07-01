import QRCode from 'qrcode';

export async function generateQRCode(data: string, filePath: string): Promise<void> {
  try {
    await QRCode.toFile(filePath, data);
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}