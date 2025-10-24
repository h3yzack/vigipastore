export interface VaultRecord {
  id: string;
  key: string;
  name: string;
  loginId: string;
  password: string;
  description?: string;
  tags?: string[];
}

export interface DerivedVaultKeys {
  masterKeySalt: Uint8Array;
  vaultKeyEncrypted: Uint8Array;
  vaultKeyNonce: Uint8Array;
}

export interface EncryptedVaultKeys {
  vaultKeyEncrypted: Uint8Array;
  vaultKeyNonce: Uint8Array;
}

export interface MasterKey {
  masterKey: Uint8Array;
  masterKeySalt: Uint8Array;
}

export interface EncryptedExportKey {
  encryptedData: Uint8Array;
  nonce: Uint8Array;
}