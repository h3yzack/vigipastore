import * as sodium from "libsodium-wrappers-sumo";


export function toStrUrlSafeBase64(u8arr: Uint8Array): string {
  try {
    return sodium.to_base64(u8arr, sodium.base64_variants.URLSAFE_NO_PADDING);
  } catch (error) {
    throw new Error(`Failed to convert to URL-safe Base64: ${error}`);
  }
}

export function fromSafeUrlStrToBase64(b64: string): Uint8Array {
  try {
    return sodium.from_base64(b64, sodium.base64_variants.URLSAFE_NO_PADDING);
  } catch (error) {
    throw new Error(`Failed to convert from URL-safe Base64: ${error}`);
  }
}

export function toBase64Str(u8arr: Uint8Array): string {
  try {
    return sodium.to_base64(u8arr, sodium.base64_variants.ORIGINAL);
  } catch (error) {
    throw new Error(`Failed to convert to Base64: ${error}`);
  }
}

export function fromBase64Str(b64: string): Uint8Array {
  try {
    return sodium.from_base64(b64, sodium.base64_variants.ORIGINAL);
  } catch (error) {
    throw new Error(`Failed to convert from Base64: ${error}`);
  }
}

export const getInitials = (text: string): string => {
    if (!text) return '';
    const words = text.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else if (words.length >= 2) {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return '';
  };