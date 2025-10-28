export interface VaultData {
  id?: string;
  key?: React.Key;
  title: string;
  loginId: string;
  encryptedPassword?: string;
  encryptionIv?: string;
  password?: string;
  notes?: string;
  tags?: string[];
  userId?: string;
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

export interface VaultRecordRequest {
  id?: string;
  title: string;
  loginId: string;
  encryptedPassword: string;
  encryptionIv: string;
  notes?: string;
  tags?: string[];
  userId: string;
}

export interface VaultRecordResponse {
  status: boolean;
  record?: VaultData;
  records?: VaultData[];
  message?: string;
}

// record to encrypt
export interface VaultRecord {
  loginId: string;
  password: string;
  userId: string;
}