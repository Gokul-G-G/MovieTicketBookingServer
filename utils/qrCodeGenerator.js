
import QRCode from "qrcode";
export const qrCodeGenerator = async (bookingData) => {
  try {
    const bookingString = JSON.stringify(bookingData); // Convert booking data to string
    const qrCodeImageUrl = await QRCode.toDataURL(bookingString); // Generate QR Code as Data URL
    const base64Data = qrCodeImageUrl.replace(/^data:image\/png;base64,/, "");
    return base64Data;
  } catch (error) {
    console.error("Error generating QR Code:", error);
    throw new Error("QR Code generation failed");
  }
};