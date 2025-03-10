
import QRCode from "qrcode";
export const qrCodeGenerator = async (bookingData) => {
  try {
    const bookingString = JSON.stringify(bookingData); // Convert booking data to string
    const qrCodeImageUrl = await QRCode.toDataURL(bookingString); // Generate QR Code as Data URL
    return qrCodeImageUrl;
  } catch (error) {
    console.error("Error generating QR Code:", error);
    throw new Error("QR Code generation failed");
  }
};