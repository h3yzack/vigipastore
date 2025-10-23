import * as sodium from "libsodium-wrappers-sumo";


export function toUrlSafeBase64(u8arr: Uint8Array): string {
  return sodium.to_base64(u8arr, sodium.base64_variants.URLSAFE_NO_PADDING);
}

export function fromSafeUrlBase64(b64: string): Uint8Array {
  return sodium.from_base64(b64, sodium.base64_variants.URLSAFE_NO_PADDING);
}

export function toBase64(u8arr: Uint8Array): string {
  return sodium.to_base64(u8arr, sodium.base64_variants.ORIGINAL);
}

export function fromBase64(b64: string): Uint8Array {
  return sodium.from_base64(b64, sodium.base64_variants.ORIGINAL);
}
